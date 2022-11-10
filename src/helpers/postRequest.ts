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
    },
    body: JSON.stringify(data),
  })
  const body = await response.json()
  return cast(body, asString)
}
