import dayjs from 'dayjs'
import { v4, v5 } from 'uuid'
import { Model, ParsedUrl, ProvideData } from '@/types'
import { getThumbnailFromUrl } from '@/utils/image-extraction-utils'

export const URLRegex = /^(https?:\/\/[\w.]+\.[\w]+\/)([\w\/]*(\.(mp4|webm|ogv)))([\?&]+([^#]*))?/

function parsedUrl(url: string): ParsedUrl | null {
  const match = url.match(URLRegex)

  if (match) {
    const { pathname, search } = new URL(url)
    const params: Record<string, string> = {}
    
    if (search) {
      const queries = search.split('&')
      queries.forEach(param => {
        const [key, value] = param.split('=')
        if (key && value) {
          params[key] = value
        }
      })
    }

    return {
      url,
      path: pathname,
      search: search || '',
      params: Object.keys(params).length ? params : {},
    }
  }
  return null
}

async function requestThumbnail(url: string) {
  const res = await getThumbnailFromUrl(url)
  return res
}

export function serialize(thumbnailUrl: string, parsedUrl: ParsedUrl, namespace: string): Model {
  const filenameWithExt = parsedUrl.path.split('/').pop()
  const splitedFilename = filenameWithExt?.split('.')
  splitedFilename?.pop()
  return {
    provider: 'File',
    id: v5(v4(), namespace),
    videoInfo: {
      id: parsedUrl.path,
      url: parsedUrl.url,
      title: splitedFilename?.join('.'),
      description: '',
      thumbnailUrl: thumbnailUrl,
      filename: filenameWithExt,
    },
    createdAt: dayjs().unix(),
  }
}

export async function provide(url: string, namespace: string): Promise<ProvideData | undefined> {
  if (!url) return

  const parsed = parsedUrl(url)
  if (parsed) {
    const res = await requestThumbnail(url)
    if (res) {
      const data = serialize(res, parsed, namespace)
      return { data, input: parsed }
    }
  }

  return
}
