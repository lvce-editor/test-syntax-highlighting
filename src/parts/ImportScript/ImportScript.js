import { pathToFileURL } from 'node:url'

export const importScript = async (path) => {
  const url = pathToFileURL(path).toString()
  return await import(url)
}
