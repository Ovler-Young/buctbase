import Image from 'next/image'
import { FunctionComponent } from 'react'

const FourOhFour: FunctionComponent<{ errorMsg: string }> = ({ errorMsg }) => {
  return (
    <div className="my-12">
      <div className="w-1/3 mx-auto">
        <Image src='/images/fabulous-rip-2.png' alt="404" width={912} height={912} />
      </div>
      <div className="mt-6 text-gray-500 max-w-xl mx-auto">
        <div className="text-xl font-bold mb-8">
          Oops, 服务器出了点<span className="underline decoration-wavy decoration-red-500">问题</span>.
        </div>
        <div className="font-mono border border-gray-400/20 rounded p-2 mb-4 text-xs bg-gray-50 dark:bg-gray-800">
          {errorMsg}
        </div>
        <div className="text-sm">
          等技术人员考完试就修，绝对不鸽！🕊
        </div>
      </div>
    </div>
  )
}

export default FourOhFour
