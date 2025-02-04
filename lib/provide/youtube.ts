import dayjs from 'dayjs'
import { v4, v5 } from 'uuid'
import { Model, ParsedUrl, ProvideData } from '@/types'
import { Response } from '@/types/youtube'

const key = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY!
const apiUrl = 'https://www.googleapis.com/youtube/v3/videos'
export const URLRegex = /^(https:\/\/(?:www\.|music\.)?youtube\.com\/(?:watch\?v=|embed\/)|https:\/\/youtu\.be\/)([^?&]+)([\?&]([^#]*))?/

function parsedUrl(url: string): ParsedUrl | null {
  const match = url.match(URLRegex)

  if (match) {
    const id = match[2]
    const query = match[4]
    const params: Record<string, string> = {}
    let search = ''
    
    if (query) {
      const queries = query.split('&')
      queries.forEach(param => {
        const [key, value] = param.split('=')
        if (key && value) {
          params[key] = value
        }
      })
      search = '?' + queries.map(param => param).join('&')
    }

    return {
      url: url,
      path: id,
      search: search || '',
      params: Object.keys(params).length ? params : {},
    }
  }
  return null
}

async function request(url: string) {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`HTTP Error: ${res.status}`)
  } else {
    return await res.json()
  }
}

function serialize(res: Response, namespace: string): Model {
  if (res) {
    const item = res.items.pop()!
    const snippet = item.snippet!
    const localized = snippet.localized!

    return {
      provider: 'YouTube',
      id: v5(v4(), namespace),
      videoInfo: {
        id: item!.id,
        url: `https://youtu.be/${item!.id}`,
        title: !localized ? snippet!.title : localized!.title,
        description: !localized ? snippet!.description : localized!.description,
        thumbnailUrl: snippet!.thumbnails.maxres.url,
        publishedAt: snippet!.publishedAt,
        params: {
          name: snippet!.channelTitle,
        }
      },
      createdAt: dayjs().unix(),
    }
  } else {
    return {
      provider: '',
      id: '00000000-0000-0000-0000-000000000000',
      videoInfo: {},
      createdAt: 0,
    }
  }
}

export async function provide(url: string, namespace: string): Promise<ProvideData | undefined> {
  if (!url) return

  const parsed = parsedUrl(url)
  if (parsed) {
    const { path: id } = parsed
    const options = `?key=${encodeURIComponent(key)}&part=snippet&id=${encodeURIComponent(id!)}`
    const input = apiUrl + options

    const res = await request(input)
    if (res) {
      const data = serialize(res, namespace)
      const id = data.videoInfo.id
      const params = parsed.search || ''
      data.videoInfo.url = `https://youtu.be/${id}${params}`
      return { data, input: parsed }
    }
  }

  return
}
