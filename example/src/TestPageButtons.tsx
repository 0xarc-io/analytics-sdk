import { useLocation, useNavigate } from 'react-router-dom'

export const TestPageButtons = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const getRedirectUrl = (path: string) => {
    return location.pathname === path ? '/' : path
  }

  return (
    <>
      <div className="text-lg font-bold">Page navigation</div>
      <div className="flex gap-4">
        <button
          className="rounded-full bg-blue-500 px-4 py-2 hover:bg-blue-300 font-bold"
          onClick={() => navigate(getRedirectUrl('/page-1'))}
        >
          Go to {location.pathname === '/page-1' ? 'Home' : '/page-1'}
        </button>
        <button
          className="rounded-full bg-green-500 px-4 py-2 hover:bg-green-300 font-bold"
          onClick={() => navigate(getRedirectUrl('/page-2'))}
        >
          Go to {location.pathname === '/page-2' ? 'Home' : '/page-2'}
        </button>
        <button
          className="rounded-full bg-red-500 px-4 py-2 hover:bg-red-300 font-bold"
          onClick={() => navigate(getRedirectUrl('/page-3'))}
        >
          Go to {location.pathname === '/page-3' ? 'Home' : '/page-3'}
        </button>
      </div>
    </>
  )
}
