'use client'

import React, { useMemo, useState } from 'react'
import { useEffect } from 'react'
import { provideYouTube, YouTubeURLRegex, FileURLRegex, provideFileFormat } from '@/utils'
import { Providers, ProviderCallback, ControllerURLFormat } from '@/types'

type AronProperies = {
  namespace: string | undefined
  property: {
    providers: Providers | null
    format: ControllerURLFormat[] | null
    add: {
      provider: (name: string, callback: ProviderCallback, expression: RegExp) => void
      format: (name: string, format: string) => void
    }
  }
  __PROXY_INITIALIZED__: boolean
}

declare global {
  var __aron__: AronProperies
}

interface Props {
  onChange?: ([k, v]: [string, any]) => void,
  [key: string]: any
}

const GlobalConstruct: React.FC<Props> = ({ onChange, ...props }) => {
  const [namespace] = useState(props['prop-namespace'])
  const [format] = useState(props['prop-controller-format'])

  const defaultProviders = useMemo((): Providers => {
    return {
      'YouTube': {
        callback: (url: string, namespace: string) => provideYouTube(url, namespace),
        expression: YouTubeURLRegex,
      },
      'File Format': {
        callback: (url: string, namespace: string) => provideFileFormat(url, namespace),
        expression: FileURLRegex,
      },
    }
  }, [])
  
  useEffect(() => {
    if (typeof globalThis !== 'undefined') {
      if (!globalThis.__aron__) {
        globalThis.__aron__ = {
          namespace: undefined,
          property: {
            providers: null,
            format: null,
            add: {
              provider(name, callback, expression) {
                globalThis.__aron__.property.providers && (
                  globalThis.__aron__.property.providers[name] = { callback, expression }
                )
              },
              format(name, format) {
                globalThis.__aron__.property.format && (
                  globalThis.__aron__.property.format.push({ name, format })
                )
              },
            },
          },
          __PROXY_INITIALIZED__: false,
        }
      }
      
      if (!globalThis.__aron__.__PROXY_INITIALIZED__) {
        const handler = {
          set(target: any, prop: string, value: any) {
            onChange && onChange([prop, value])
            target[prop] = value
            return true
          }
        }
        globalThis.__aron__ = new Proxy(globalThis.__aron__, handler)
        globalThis.__aron__.namespace = namespace

        globalThis.__aron__.property = new Proxy(globalThis.__aron__.property, handler)
        globalThis.__aron__.property.format = format
        globalThis.__aron__.property.providers = defaultProviders
        
        globalThis.__aron__.__PROXY_INITIALIZED__ = true
      }
    }
  }, [globalThis.__aron__])

  return (<></>)
}

export default GlobalConstruct
