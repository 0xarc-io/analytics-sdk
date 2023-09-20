/**
 * Generates a unique ID.
 */
export function generateUniqueID(identityId: string) {
  const timestamp = new Date().getTime()
  const randomPart = Math.random().toString(36).substring(2)

  return `${timestamp}-${identityId}-${randomPart}`
}
