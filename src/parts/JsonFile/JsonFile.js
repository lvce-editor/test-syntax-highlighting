import { readFile } from 'node:fs/promises'

export const readJson = async (absolutePath) => {
  const content = await readFile(absolutePath, 'utf8')
  return JSON.parse(content)
}
