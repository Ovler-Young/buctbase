import axios from 'axios'

export default async (res, label, message, colour) => {
  const badgeUrl = `https://img.shields.io/static/v1?label=${label}&message=${message}&color=${colour}&style=for-the-badge`

  const { data: badgeSVG } = await axios.get(badgeUrl)

  res.setHeader('Content-Type', 'image/svg+xml;charset=utf-8')
  res.setHeader('Cache-Control', 'no-store, max-age=0')
  res.send(badgeSVG)
};