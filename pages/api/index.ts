import axios from 'axios'
import type { NextApiRequest, NextApiResponse } from 'next'
import { posix as pathPosix } from 'path'

import apiConfig from '../../config/api.json'
import siteConfig from '../../config/site.json'
import { compareHashedToken } from '../../utils/tools'

const basePath = pathPosix.resolve('/', apiConfig.base)
const encodePath = (path: string) => {
  let encodedPath = pathPosix.join(basePath, pathPosix.resolve('/', path))
  if (encodedPath === '/' || encodedPath === '') {
    return ''
  }
  encodedPath = encodedPath.replace(/\/$/, '')
  return `:${encodeURIComponent(encodedPath)}`
}

// Store access token in memory, cuz Vercel doesn't provide key-value storage natively
let _access_token = ''
const getAccessToken = async () => {
  if (_access_token) {
    console.log('Fetch token from memory.')
    return _access_token
  }

  const body = new URLSearchParams()
  body.append('client_id', apiConfig.clientId)
  body.append('redirect_uri', apiConfig.redirectUri)
  body.append('client_secret', process.env.CLIENT_SECRET ? process.env.CLIENT_SECRET : '')
  body.append('refresh_token', process.env.REFRESH_TOKEN ? process.env.REFRESH_TOKEN : '')
  body.append('grant_type', 'refresh_token')

  const resp = await axios.post(apiConfig.authApi, body, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })

  if (resp.data.access_token) {
    _access_token = resp.data.access_token
    return _access_token
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { path = '/', raw = false, next = '' } = req.query
  if (path === '[...path]') {
    res.status(400).json({ error: 'No path specified.' })
    return
  }

  if (typeof path === 'string') {
    const accessToken = await getAccessToken()

    // Handle authentication through .password
    const protectedRoutes = siteConfig.protectedRoutes
    let authTokenPath = ''
    for (const r of protectedRoutes) {
      if (path.startsWith(r)) {
        authTokenPath = `${r}/.password`
        break
      }
    }

    // Fetch password from remote file content
    if (authTokenPath !== '') {
      try {
        const token = await axios.get(`${apiConfig.driveApi}/root${encodePath(authTokenPath)}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          params: {
            select: '@microsoft.graph.downloadUrl,file',
          },
        })

        // Handle request and check for header 'od-protected-token'
        const odProtectedToken = await axios.get(token.data['@microsoft.graph.downloadUrl'])
        // console.log(req.headers['od-protected-token'], odProtectedToken.data.trim())

        if (!compareHashedToken(req.headers['od-protected-token'] as string, odProtectedToken.data)) {
          res.status(401).json({ error: 'Password required for this folder.' })
          return
        }
      } catch (error: any) {
        // Password file not found, fallback to 404
        if (error.response.status === 404) {
          res.status(404).json({ error: "You didn't set a password for your protected folder." })
        }
        res.status(500).end()
        return
      }
    }

    const requestPath = encodePath(path)
    // Handle response from OneDrive API
    const requestUrl = `${apiConfig.driveApi}/root${requestPath}`
    // Whether path is root, which requires some special treatment
    const isRoot = requestPath === ''

    // Go for file raw download link and query with only temporary link parameter
    if (raw) {
      const { data } = await axios.get(requestUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: {
          select: '@microsoft.graph.downloadUrl,folder,file',
        },
      })

      if ('folder' in data) {
        res.status(400).json({ error: "Folders doesn't have raw download urls." })
        return
      }
      if ('file' in data) {
        res.redirect(data['@microsoft.graph.downloadUrl'])
        return
      }
    }

    // Querying current path identity (file or folder) and follow up query childrens in folder
    // console.log(accessToken)

    const { data: identityData } = await axios.get(requestUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: {
        select: '@microsoft.graph.downloadUrl,name,size,id,lastModifiedDateTime,folder,file',
      },
    })

    if ('folder' in identityData) {
      const { data: folderData } = await axios.get(`${requestUrl}${isRoot ? '': ':'}/children`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: next
          ? {
              select: '@microsoft.graph.downloadUrl,name,size,id,lastModifiedDateTime,folder,file',
              top: siteConfig.maxItems,
              $skipToken: next,
            }
          : {
              select: '@microsoft.graph.downloadUrl,name,size,id,lastModifiedDateTime,folder,file',
              top: siteConfig.maxItems,
            },
      })

      // Extract next page token from full @odata.nextLink
      const nextPage = folderData['@odata.nextLink']
        ? folderData['@odata.nextLink'].match(/&\$skiptoken=(.+)/i)[1]
        : null

      // Return paging token if specified
      if (nextPage) {
        res.status(200).json({ folder: folderData, next: nextPage })
      } else {
        res.status(200).json({ folder: folderData })
      }
      return
    }
    res.status(200).json({ file: identityData })
    return
  }

  res.status(404).json({ error: 'Path query invalid.' })
  return
}
