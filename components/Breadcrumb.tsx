import Link from 'next/link'

import { ParsedUrlQuery } from 'querystring'

const Breadcrumb: React.FC<{ query?: ParsedUrlQuery }> = ({ query }) => {
  if (query) {
    const { path } = query
    if (Array.isArray(path)) {
      return (
        <div className="dark:text-gray-300 no-scrollbar flex pb-4 overflow-x-scroll text-sm text-gray-600 -mx-1">
          <div className="hover:opacity-80 flex-shrink-0 px-1 transition-all duration-75">
            <Link href="/">🚩 Home</Link>
          </div>
          {path.map((q: string, i: number) => (
            <div key={i} className="flex items-center flex-shrink-0">
              <div>/</div>
              <div className="hover:opacity-80 px-1 transition-all duration-75">
                <Link
                  href={`/${path
                    .slice(0, i + 1)
                    .map(p => encodeURIComponent(p))
                    .join('/')}`}
                >
                  {q}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )
    }
  }

  return (
    <div className="dark:text-gray-300 hover:opacity-80 pb-4 text-sm text-gray-600 transition-all duration-75">
      <div>
        <Link href="/">🚩 Home</Link>
      </div>
    </div>
  )
}

export default Breadcrumb
