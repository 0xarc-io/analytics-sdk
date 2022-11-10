import { cleanup } from '@testing-library/react'

exports.mochaHooks = {
  afterEach() {
    cleanup()
  },
}
