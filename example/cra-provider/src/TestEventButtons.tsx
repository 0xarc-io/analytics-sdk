import { useArcxAnalytics } from '@arcxmoney/analytics'

export const TestEventButtons = () => {
  const sdk = useArcxAnalytics()

  return (
    <>
      <div className="text-lg font-bold">Manual events</div>
      <div className="flex gap-4">
        <button
          className="rounded-full bg-blue-500 px-4 py-2 hover:bg-blue-300 font-bold"
          onClick={() => sdk?.event('BLUE_BUTTON', { attr1: '1', attr2: '2' })}
        >
          Test event: blue button
        </button>
        <button
          className="rounded-full bg-red-500 px-4 py-2 hover:bg-red-300 font-bold"
          onClick={() => sdk?.event('RED_EVENT', { attr1: 'a', attr2: 'b' })}
        >
          Test event: red button
        </button>
        <button
          className="rounded-full bg-red-500 px-4 py-2 hover:bg-red-300 font-bold"
          onClick={() => sdk?.["_report"]('warning', 'Example report')}
        >
          Report example warning
        </button>
      </div>
    </>
  )
}
