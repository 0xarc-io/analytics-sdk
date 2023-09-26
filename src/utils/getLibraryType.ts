import { LibraryType } from '../types'

export function getLibraryType(): LibraryType {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (window as any).arcx !== undefined ? 'script-tag' : 'npm-package'
}
