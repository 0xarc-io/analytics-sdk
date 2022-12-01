import { cleanup } from '@testing-library/react'

// Needed in watch mode:
// https://testing-library.com/docs/react-testing-library/setup#auto-cleanup-in-mochas-watch-mode
exports.mochaHooks = {
  afterEach() {
    cleanup()
  },
}
