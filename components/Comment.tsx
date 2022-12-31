import { FC, useState } from 'react'
import { ReactCusdis } from 'react-cusdis'
import sha256 from 'crypto-js/sha256'
import { useTranslation } from 'next-i18next'

const Comments: FC<{
  url: string
}> = ({ url }) => {
  const [isShowingComments, setIsShowingComments] = useState(false)

  const { t } = useTranslation()

  const pageId = sha256(url).toString()
  console.log(`pageId: ${pageId}`)
  const pageTitle = decodeURIComponent(url.split('/').slice(-2)[0])
  console.log(`pageTitle: ${pageTitle}`)

  return (
    <div className="flex flex-col items-center">
      {isShowingComments ? (
        <>
          <div className="mt-4 grid h-96 w-full max-w-5xl grid-cols-1 gap-4 bg-white ">
            <ReactCusdis
              lang="zh-cn"
              attrs={{
                host: 'https://cusdis.180811.xyz',
                appId: 'c56906bd-f8b3-4701-8659-7b0e19929392',
                pageTitle: `${pageTitle}`,
                pageId: `${pageId}`,
                pageUrl: `${url}`,
              }}
            />
          </div>
          <button
            className="rounded border py-2 px-4 font-semibold text-gray-800 shadow hover:bg-gray-300"
            onClick={() => setIsShowingComments(false)}
          >
            {t('HideComments')}
          </button>
        </>
      ) : (
        <button
          className="rounded border py-2 px-4 font-semibold text-gray-800 shadow hover:bg-gray-300"
          onClick={() => setIsShowingComments(true)}
        >
          {t('ShowComments')}
        </button>
      )}
    </div>
  )
}

export default Comments
