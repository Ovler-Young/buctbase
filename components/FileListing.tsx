import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import toast, { Toaster } from 'react-hot-toast'
import emojiRegex from 'emoji-regex'
import { useClipboard } from 'use-clipboard-copy'

import { ParsedUrlQuery } from 'querystring'
import { FunctionComponent, useState } from 'react'
import { ImageDecorator } from 'react-viewer/lib/ViewerProps'

import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'

import { getExtension, getFileIcon, hasKey } from '../utils/getFileIcon'
import { extensions, preview } from '../utils/getPreviewType'
import { getBaseUrl, useProtectedSWRInfinite } from '../utils/tools'

import { VideoPreview } from './previews/VideoPreview'
import { AudioPreview } from './previews/AudioPreview'
import Loading from './Loading'
import FourOhFour from './FourOhFour'
import Auth from './Auth'
import TextPreview from './previews/TextPreview'
import MarkdownPreview from './previews/MarkdownPreview'
import CodePreview from './previews/CodePreview'
import OfficePreview from './previews/OfficePreview'
import DownloadBtn from './DownloadBtn'

// Disabling SSR for some previews (image gallery view, and PDF view)
const ReactViewer = dynamic(() => import('react-viewer'), { ssr: false })
const PDFPreview = dynamic(() => import('./previews/PDFPreview'), { ssr: false })
const EPUBPreview = dynamic(() => import('./previews/EPUBPreview'), { ssr: false })

/**
 * Convert raw bits file/folder size into a human readable string
 *
 * @param size File or folder size, in raw bits
 * @returns Human readable form of the file or folder size
 */
const humanFileSize = (size: number) => {
  if (size < 1024) return size + ' B'
  const i = Math.floor(Math.log(size) / Math.log(1024))
  const num = size / Math.pow(1024, i)
  const round = Math.round(num)
  const formatted = round < 10 ? num.toFixed(2) : round < 100 ? num.toFixed(1) : round
  return `${formatted} ${'KMGTPEZY'[i - 1]}B`
}

/**
 * Convert url query into path string
 *
 * @param query Url query property
 * @returns Path string
 */
const queryToPath = (query?: ParsedUrlQuery) => {
  if (query) {
    const { path } = query
    if (!path) return '/'
    if (typeof path === 'string') return `/${encodeURIComponent(path)}`
    return `/${path.map(p => encodeURIComponent(p)).join('/')}`
  }
  return '/'
}

const FileListItem: FunctionComponent<{
  fileContent: { id: string; name: string; size: number; file: Object; lastModifiedDateTime: string }
}> = ({ fileContent: c }) => {
  const emojiIcon = emojiRegex().exec(c.name)
  const renderEmoji = emojiIcon && !emojiIcon.index

  return (
    <div className="grid items-center grid-cols-11 p-3 space-x-2 cursor-pointer">
      <div className="md:col-span-7 flex items-center col-span-11 space-x-2 truncate">
        {/* <div>{c.file ? c.file.mimeType : 'folder'}</div> */}
        <div className="flex-shrink-0 w-5 text-center">
          {renderEmoji ? (
            <span>{emojiIcon ? emojiIcon[0] : '📁'}</span>
          ) : (
            <FontAwesomeIcon icon={c.file ? getFileIcon(c.name) : ['far', 'folder']} />
          )}
        </div>
        <div className="truncate">
          {renderEmoji ? c.name.replace(emojiIcon ? emojiIcon[0] : '', '').trim() : c.name}
        </div>
      </div>
      <div className="md:block dark:text-gray-500 flex-shrink-0 hidden col-span-3 font-mono text-sm text-gray-700">
        {new Date(c.lastModifiedDateTime).toLocaleString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })}
      </div>
      <div className="md:block dark:text-gray-500 flex-shrink-0 hidden col-span-1 font-mono text-sm text-gray-700 truncate">
        {humanFileSize(c.size)}
      </div>
    </div>
  )
}

const FileListing: FunctionComponent<{ query?: ParsedUrlQuery }> = ({ query }) => {
  const [imageViewerVisible, setImageViewerVisibility] = useState(false)
  const [activeImageIdx, setActiveImageIdx] = useState(0)

  const router = useRouter()
  const clipboard = useClipboard()

  const path = queryToPath(query)

  const { data, error, size, setSize } = useProtectedSWRInfinite(path)

  if (error) {
    return (
      <div className="dark:bg-gray-900 p-3 bg-white rounded shadow">
        {error.message.includes('401') ? <Auth redirect={path} /> : <FourOhFour errorMsg={error.message} />}
      </div>
    )
  }
  if (!data) {
    return (
      <div className="dark:bg-gray-900 p-3 bg-white rounded shadow">
        <Loading loadingText="Loading ..." />
      </div>
    )
  }

  const fileIsImage = (fileName: string) => {
    const fileExtension = getExtension(fileName)
    if (hasKey(extensions, fileExtension)) {
      if (extensions[fileExtension] === preview.image) {
        return true
      }
    }
    return false
  }

  const responses: any[] = data ? [].concat(...data) : []

  const isLoadingInitialData = !data && !error
  const isLoadingMore = isLoadingInitialData || (size > 0 && data && typeof data[size - 1] === 'undefined')
  const isEmpty = data?.[0]?.length === 0
  const isReachingEnd = isEmpty || (data && typeof data[data.length - 1]?.next === 'undefined')
  const onlyOnePage = data && typeof data[0].next === 'undefined'

  if ('folder' in responses[0]) {
    // Image preview rendering preparations
    const imagesInFolder: ImageDecorator[] = []
    const imageIndexDict: { [key: string]: number } = {}
    let imageIndex = 0

    // README rendering preparations
    let renderReadme = false
    let readmeFile = null

    // Expand list of API returns into flattened file data
    const children = [].concat(...responses.map(r => r.folder.value))

    children.forEach((c: any) => {
      if (fileIsImage(c.name)) {
        imagesInFolder.push({
          src: c['@microsoft.graph.downloadUrl'],
          alt: c.name,
          downloadUrl: c['@microsoft.graph.downloadUrl'],
        })
        imageIndexDict[c.id] = imageIndex
        imageIndex += 1
      }

      if (c.name.toLowerCase() === 'readme.md') {
        renderReadme = true
        readmeFile = c
      }
    })

    return (
      <div className="dark:bg-gray-900 dark:text-gray-100 bg-white rounded shadow">
        <div className="dark:border-gray-700 grid items-center grid-cols-12 p-3 space-x-2 border-b border-gray-200">
          <div className="md:col-span-7 col-span-12 font-bold">Name</div>
          <div className="md:block hidden col-span-3 font-bold">Last Modified</div>
          <div className="md:block hidden font-bold">Size</div>
          <div className="md:block hidden font-bold">Actions</div>
        </div>

        <Toaster
          toastOptions={{
            style: {
              background: '#316C23',
              color: '#ffffff',
            },
          }}
        />

        {imagesInFolder.length !== 0 && (
          <ReactViewer
            zIndex={99}
            visible={imageViewerVisible}
            activeIndex={activeImageIdx}
            images={imagesInFolder}
            drag={false}
            rotatable={false}
            noClose={true}
            scalable={false}
            zoomSpeed={0.2}
            downloadable={true}
            downloadInNewWindow={true}
            onMaskClick={() => {
              setImageViewerVisibility(false)
            }}
            customToolbar={toolbars => {
              toolbars[0].render = <FontAwesomeIcon icon="plus" />
              toolbars[1].render = <FontAwesomeIcon icon="minus" />
              toolbars[2].render = <FontAwesomeIcon icon="arrow-left" />
              toolbars[3].render = <FontAwesomeIcon icon="undo" />
              toolbars[4].render = <FontAwesomeIcon icon="arrow-right" />
              toolbars[9].render = <FontAwesomeIcon icon="download" />
              return toolbars.concat([
                {
                  key: 'copy',
                  render: <FontAwesomeIcon icon={['fas', 'copy']} />,
                  onClick: i => {
                    clipboard.copy(i.alt ? `${getBaseUrl()}/api?path=${path + '/' + i.alt}&raw=true` : '')
                    toast.success('Copied image permanent link to clipboard.')
                  },
                },
              ])
            }}
          />
        )}

        {children.map((c: any) => (
          <div className="hover:bg-gray-100 dark:hover:bg-gray-850 grid grid-cols-12" key={c.id}>
            <div
              className="col-span-11"
              onClick={e => {
                e.preventDefault()

                if (!c.folder && fileIsImage(c.name)) {
                  setActiveImageIdx(imageIndexDict[c.id])
                  setImageViewerVisibility(true)
                } else {
                  router.push(`${path === '/' ? '' : path}/${encodeURIComponent(c.name)}`)
                }
              }}
            >
              <FileListItem fileContent={c} />
            </div>
            {c.folder ? (
              <div className="md:flex dark:text-gray-400 hidden p-1 text-gray-700">
                <span
                  title="Copy folder permalink"
                  className="hover:bg-gray-300 dark:hover:bg-gray-600 p-2 rounded cursor-pointer"
                  onClick={() => {
                    clipboard.copy(`${getBaseUrl()}${path === '/' ? '' : path}/${encodeURIComponent(c.name)}`)
                    toast.success('Copied folder permalink.')
                  }}
                >
                  <FontAwesomeIcon icon={['far', 'copy']} />
                </span>
              </div>
            ) : (
              <div className="md:flex dark:text-gray-400 hidden p-1 text-gray-700">
                <span
                  title="Copy raw file permalink"
                  className="hover:bg-gray-300 dark:hover:bg-gray-600 p-2 rounded cursor-pointer"
                  onClick={() => {
                    clipboard.copy(`${getBaseUrl()}/api?path=${path === '/' ? '' : path}/${encodeURIComponent(c.name)}&raw=true`)
                    toast.success('Copied raw file permalink.')
                  }}
                >
                  <FontAwesomeIcon icon={['far', 'copy']} />
                </span>
                <a
                  title="Download file"
                  className="hover:bg-gray-300 dark:hover:bg-gray-600 p-2 rounded cursor-pointer"
                  href={c['@microsoft.graph.downloadUrl']}
                >
                  <FontAwesomeIcon icon={['far', 'arrow-alt-circle-down']} />
                </a>
              </div>
            )}
          </div>
        ))}

        {!onlyOnePage && (
          <div>
            <div className="dark:border-gray-700 p-3 font-mono text-sm text-center text-gray-400 border-b border-gray-200">
              - showing {size} page{size > 1 ? 's' : ''} of {isLoadingMore ? '...' : children.length} files -
            </div>
            <button
              className={`flex items-center justify-center w-full p-3 space-x-2 ${
                isLoadingMore || isReachingEnd ? 'opacity-60' : 'hover:bg-gray-100 dark:hover:bg-gray-850'
              }`}
              onClick={() => setSize(size + 1)}
              disabled={isLoadingMore || isReachingEnd}
            >
              {isLoadingMore ? (
                <>
                  <span>Loading ...</span>{' '}
                  <svg
                    className="animate-spin w-5 h-5 mr-3 -ml-1"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </>
              ) : isReachingEnd ? (
                <span>No more files</span>
              ) : (
                <>
                  <span>Load more</span>
                  <FontAwesomeIcon icon="chevron-circle-down" />
                </>
              )}
            </button>
          </div>
        )}

        {renderReadme && (
          <div className="dark:border-gray-700 border-t">
            <MarkdownPreview file={readmeFile} path={path} standalone={false} />
          </div>
        )}
      </div>
    )
  }

  if ('file' in responses[0] && responses.length === 1) {
    const { file } = responses[0]
    const downloadUrl = file['@microsoft.graph.downloadUrl']
    const fileName = file.name
    const fileExtension = fileName.slice(((fileName.lastIndexOf('.') - 1) >>> 0) + 2).toLowerCase()

    if (hasKey(extensions, fileExtension)) {
      switch (extensions[fileExtension]) {
        case preview.image:
          return (
            <div className="w-full p-3 bg-white rounded shadow">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="mx-auto" src={downloadUrl} alt={fileName} />
            </div>
          )

        case preview.text:
          return <TextPreview file={file} />

        case preview.code:
          return <CodePreview file={file} />

        case preview.markdown:
          return <MarkdownPreview file={file} path={path} />

        case preview.video:
          return <VideoPreview file={file} />

        case preview.audio:
          return <AudioPreview file={file} />

        case preview.pdf:
          return <PDFPreview file={file} />

        case preview.office:
          return <OfficePreview file={file} />

        case preview.epub:
          return <EPUBPreview file={file} />

        default:
          return <div className="dark:bg-gray-900 bg-white rounded shadow">{fileName}</div>
      }
    }

    return (
      <>
        <div className="dark:bg-gray-900 p-3 bg-white rounded shadow">
          <FourOhFour
            errorMsg={`Preview for file ${fileName} is not available, download directly with the button below.`}
          />
        </div>
        <div className="mt-4">
          <DownloadBtn downloadUrl={downloadUrl} />
        </div>
      </>
    )
  }

  return (
    <div className="dark:bg-gray-900 p-3 bg-white rounded shadow">
      <FourOhFour errorMsg={`Cannot preview ${path}`} />
    </div>
  )
}
export default FileListing
