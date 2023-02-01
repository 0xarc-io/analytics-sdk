import { asString, cast } from '@restless/sanitizers'

export async function postRequest(
  base: string,
  apiKey: string,
  path: string,
  data?: unknown,
): Promise<string> {
  const response = await fetch(`${base}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
      'x-api-key': apiKey,
      'x-sdk-version': 'local',
    },
    body: JSON.stringify(data),
  })
  const body = await response.json()

  if (response.ok) {
    return cast(body, asString)
  } else {
    throw new Error(`Cannot fetch ${base}${path} with code ${response.status}`)
  }
}
