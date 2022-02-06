import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IconName } from '@fortawesome/fontawesome-svg-core'
import { Dialog, Transition } from '@headlessui/react'
import toast, { Toaster } from 'react-hot-toast'
import { useHotkeys } from 'react-hotkeys-hook'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { Fragment, useEffect, useState } from 'react'

import siteConfig from '../config/site.config'
import SearchModal from './SearchModal'
import useDeviceOS from '../utils/useDeviceOS'

const Navbar = () => {
  const router = useRouter()
  const os = useDeviceOS()

  const [tokenPresent, setTokenPresent] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isOpenWechat, setIsOpenWechat] = useState(false)

  const [searchOpen, setSearchOpen] = useState(false)
  const openSearchBox = () => setSearchOpen(true)

  useHotkeys(`${os === 'mac' ? 'cmd' : 'ctrl'}+k`, openSearchBox)

  useEffect(() => {
    const storedToken = () => {
      for (const r of siteConfig.protectedRoutes) {
        if (localStorage.hasOwnProperty(r)) {
          return true
        }
      }
      return false
    }
    setTokenPresent(storedToken())
  }, [])

  const clearTokens = () => {
    setIsOpen(false)

    siteConfig.protectedRoutes.forEach(r => {
      localStorage.removeItem(r)
    })

    toast.success('Cleared all tokens')
    setTimeout(() => {
      router.reload()
    }, 1000)
  }

  return (
    <div className="sticky top-0 z-[100] border-b border-gray-900/10 bg-white bg-opacity-80 backdrop-blur-md dark:border-gray-500/30 dark:bg-gray-900">
      <Toaster />

      <SearchModal searchOpen={searchOpen} setSearchOpen={setSearchOpen} />

      <div className="mx-auto flex w-full items-center justify-between space-x-4 px-4 py-1">
        <Link href="/" passHref>
          <a className="flex items-center space-x-2 py-2 hover:opacity-80 dark:text-white md:p-2">
            <Image src={siteConfig.icon} alt="icon" width="25" height="25" priority />
            <span className="hidden font-bold sm:block">{siteConfig.title}</span>
          </a>
        </Link>

        <div className="flex flex-1 items-center space-x-4 text-gray-700 md:flex-initial">
          <button
            className="flex flex-1 items-center justify-between rounded-lg bg-gray-100 px-2.5 py-1.5 hover:opacity-80 dark:bg-gray-800 dark:text-white md:w-48"
            onClick={openSearchBox}
          >
            <div className="flex items-center space-x-2">
              <FontAwesomeIcon className="h-4 w-4" icon="search" />
              <span className="text-sm font-medium">Search ...</span>
            </div>

            <div className="flex items-center space-x-1">
              <div className="rounded-lg bg-gray-200 px-2 py-1 text-xs font-medium dark:bg-gray-700">
                {os === 'mac' ? '⌘' : 'Ctrl'}
              </div>
              <div className="rounded-lg bg-gray-200 px-2 py-1 text-xs font-medium dark:bg-gray-700">K</div>
            </div>
          </button>

          {siteConfig.links.length !== 0 &&
            siteConfig.links.map((l: { name: string; link: string }) => (
              <a
                key={l.name}
                href={l.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 hover:opacity-80 dark:text-white"
              >
                <FontAwesomeIcon icon={['fab', l.name.toLowerCase() as IconName]} />
                <span className="hidden text-sm font-medium md:inline-block">{l.name}</span>
              </a>
            ))}

          {siteConfig.email && (
            <a href={siteConfig.email} className="flex items-center space-x-2 hover:opacity-80 dark:text-white">
              <FontAwesomeIcon icon={['far', 'envelope']} />
              <span className="hidden text-sm font-medium md:inline-block">Email</span>
            </a>
          )}
          
          {siteConfig.wechat && (
            <button
              className="flex items-center space-x-2 dark:text-white hover:opacity-80"
              onClick={() => setIsOpenWechat(true)}
            >
              <FontAwesomeIcon icon={['fab', 'weixin']} />
              <span className="text-sm font-medium hidden md:inline-block">微信公众号</span>
            </button>
          )}
          
          {tokenPresent && (
            <button
              className="flex items-center space-x-2 p-2 hover:opacity-80 dark:text-white"
              onClick={() => setIsOpen(true)}
            >
              <span className="text-sm font-medium">Logout</span>
              <FontAwesomeIcon icon="sign-out-alt" />
            </button>
          )}
         
        </div>
      </div>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="fixed inset-0 z-10 overflow-y-auto" open={isOpen} onClose={() => setIsOpen(false)}>
          <div className="min-h-screen px-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-100"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-50"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0 bg-gray-50 dark:bg-gray-800" />
            </Transition.Child>

            {/* This element is to trick the browser into centering the modal contents. */}
            <span className="inline-block h-screen align-middle" aria-hidden="true">
              &#8203;
            </span>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-100"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-50"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="my-8 inline-block w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle transition-all dark:bg-gray-900">
                <Dialog.Title className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  Clear all tokens?
                </Dialog.Title>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    These tokens are used to authenticate yourself into password protected folders, clearing them means
                    that you will need to re-enter the passwords again.
                  </p>
                </div>

                <div className="mt-4 max-h-32 overflow-y-scroll font-mono text-sm dark:text-gray-100">
                  {siteConfig.protectedRoutes.map((r, i) => (
                    <div key={i} className="flex items-center space-x-1">
                      <FontAwesomeIcon icon="key" />
                      <span className="truncate">{r}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex items-center justify-end">
                  <button
                    className="mr-3 inline-flex items-center justify-center space-x-2 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-400 focus:outline-none focus:ring focus:ring-blue-300"
                    onClick={() => setIsOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="inline-flex items-center justify-center space-x-2 rounded bg-red-500 px-4 py-2 text-white hover:bg-red-400 focus:outline-none focus:ring focus:ring-red-300"
                    onClick={() => clearTokens()}
                  >
                    <FontAwesomeIcon icon={['far', 'trash-alt']} />
                    <span>Clear all</span>
                  </button>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
      
      <Transition appear show={isOpenWechat} as={Fragment}>
        <Dialog as="div" className="fixed inset-0 z-10 overflow-y-auto" open={isOpenWechat} onClose={() => setIsOpenWechat(false)}>
          <div className="min-h-screen px-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-100"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-50"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="bg-gray-50 dark:bg-gray-800 fixed inset-0" />
            </Transition.Child>

            {/* This element is to trick the browser into centering the modal contents. */}
            <span className="inline-block h-screen align-middle" aria-hidden="true">
              &#8203;
            </span>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-100"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-50"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="dark:bg-gray-900 inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white rounded-lg">
                <Dialog.Title className="dark:text-gray-100 text-lg font-bold text-gray-900">
                  公众号二维码
                </Dialog.Title>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">下面的就是公众号二维码</p>
                  <p className="text-sm text-gray-500">拿起手机扫一扫吧！</p>
                  <br/>
                  <p className="text-sm text-gray-500">p.s.手机上请先长按保存图片，然后</p><a key="微信扫码" href="weixin://dl/scan" target="_blank" rel="noopener noreferrer"><span className="text-sm text-gray-500">点我</span></a><p className="text-sm text-gray-500">直达微信扫码</p>      
                </div>

                <div className="dark:text-gray-100 mt-4 font-mono text-sm">
                  <Image
                    src={siteConfig.wechat}
                    width={450}
                    height={450}
                    alt="微信公众号二维码"
                    priority
                  />
                </div>

                <div className="flex items-center justify-end mt-8">
                  <button
                    className="focus:outline-none focus:ring focus:ring-blue-300 hover:bg-blue-400 inline-flex items-center justify-center px-4 py-2 mr-3 space-x-2 text-white bg-blue-500 rounded"
                    onClick={() => setIsOpenWechat(false)}
                  >
                    <span>好嘞</span>
                  </button>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </div>
  )
}

export default Navbar
