import { expect } from 'chai'
import sinon from 'sinon'
import { SDK_VERSION } from '../../src/constants'
import { postRequest } from '../../src/utils'
import { TEST_API_KEY } from '../constants'

describe('(unit) postRequest', () => {
  it('calls fetch with the given arguments', async () => {
    global.fetch = sinon.stub().resolves({
      ok: true,
      async json() {
        return 'test response'
      },
    } as any)

    const data = {
      a: 'a',
      b: 5,
      c: {
        d: 'd',
        e: {
          f: 'f',
        },
      },
    }
    const res = await postRequest('https://example.com/', TEST_API_KEY, 'v1', data)

    expect(res).to.equal('test response')
    expect(SDK_VERSION).to.not.be.empty
    expect(global.fetch).to.have.been.calledOnceWithExactly('https://example.com/v1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        'x-api-key': TEST_API_KEY,
        'x-sdk-version': SDK_VERSION,
      },
      body: JSON.stringify(data),
    })

    global.fetch = undefined as any
  })
})
