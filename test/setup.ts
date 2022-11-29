import { cleanup } from '@testing-library/react'
import chai from 'chai'
import sinonChai from 'sinon-chai'

chai.use(sinonChai)

exports.mochaHooks = {
  afterEach() {
    cleanup()
  },
}
