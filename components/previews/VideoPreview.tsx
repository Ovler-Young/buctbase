import { FunctionComponent } from 'react'
import ReactPlayer from 'react-player'
import { useRouter } from 'next/router'
import { useClipboard } from 'use-clipboard-copy'
import toast from 'react-hot-toast'

import { getBaseUrl } from '../../utils/getBaseUrl'
import { DownloadButton } from '../DownloadBtnGtoup'

const VideoPreview: FunctionComponent<{ file: any }> = ({ file }) => {
  const { asPath } = useRouter()
  const clipboard = useClipboard()

  return (
    <>
      <div className="dark:bg-gray-900 p-3 bg-white rounded">
        <ReactPlayer
          className="aspect-video"
          url={file['@microsoft.graph.downloadUrl']}
          controls
          width="100%"
          height="100%"
          config={{ file: { forceVideo: true } }}
        />
      </div>

      <div className="flex flex-wrap justify-center mt-4 gap-2">
        <DownloadButton
          onClickCallback={() => window.open(file['@microsoft.graph.downloadUrl'])}
          btnColor="blue"
          btnText="Download"
          btnIcon="file-download"
        />
        <DownloadButton
          onClickCallback={() =>
            window.open(`/api/proxy?url=${encodeURIComponent(file['@microsoft.graph.downloadUrl'])}`)
          }
          btnColor="teal"
          btnText="Proxy download"
          btnIcon="download"
        />
        <DownloadButton
          onClickCallback={() => {
            clipboard.copy(`${getBaseUrl()}/api?path=${asPath}&raw=true`)
            toast.success('Copied direct link to clipboard.')
          }}
          btnColor="yellow"
          btnText="Copy direct link"
          btnIcon="copy"
        />

        <DownloadButton
          onClickCallback={() => window.open(`iina://weblink?url=${file['@microsoft.graph.downloadUrl']}`)}
          btnText="IINA"
          btnImage="/players/iina.png"
        />
        <DownloadButton
          onClickCallback={() => window.open(`vlc://${file['@microsoft.graph.downloadUrl']}`)}
          btnText="VLC"
          btnImage="/players/vlc.png"
        />
        <DownloadButton
          onClickCallback={() => window.open(`potplayer://${file['@microsoft.graph.downloadUrl']}`)}
          btnText="PotPlayer"
          btnImage="/players/potplayer.png"
        />
      </div>
    </>
  )
}

export default VideoPreview
