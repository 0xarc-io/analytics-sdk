let counter = 0

/**
 * Generates a unique ID.
 */
export function generateUniqueID() {
  const timestamp = new Date().getTime()
  const randomPart = Math.random().toString(36).substring(2)
  // Counter increments on every call to ensure uniqueness even if called rapidly in succession
  counter += 1

  return `${timestamp}-${randomPart}-${counter}`
}
