import { Vibrant } from 'node-vibrant/browser'

export const extractVideoThumbnail = async (videoUrl: string): Promise<string> => {
  const urlWithoutSearch = new URL(videoUrl)
  urlWithoutSearch.search = ''
  const cleanVideoUrl = urlWithoutSearch.toString()

  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.crossOrigin = 'anonymous'
    video.src = cleanVideoUrl
    video.load()
    video.addEventListener('loadeddata', () => (video.currentTime = 0))
    video.addEventListener('seeked', () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const uri = canvas.toDataURL('image/jpeg')
        resolve(uri)
      }
    })
    video.addEventListener('error', (e) => reject(e))
  })
}

export const url2Image = (image: HTMLImageElement) => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  canvas.width = image.naturalWidth
  canvas.height = image.naturalHeight
  if (ctx) {
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
    const uri = canvas.toDataURL('image/png')
    return uri
  }
}

export const getThumbnailFromUrl = async (url: string): Promise<string | null> => {
  const urlWithoutSearch = new URL(url)
  urlWithoutSearch.search = ''
  const cleanUrl = urlWithoutSearch.toString()

  if (/\.(mp4|webm|ogv)/.test(cleanUrl.toLowerCase())) {
    try {
      return await extractVideoThumbnail(cleanUrl)
    } catch (error) {
      console.error('Error extracting video thumbnail:', error)
      return null
    }
  } else if (cleanUrl.match(/\.(jpeg|jpg|gif|png)$/) !== null) {
    return cleanUrl
  } else {
    return null
  }
}

export const imagePalette = async (url: string) => {
  try {
    const vibrant = await Vibrant.from(url).getPalette()
    return vibrant.Vibrant
  } catch {
    return
  }
}
