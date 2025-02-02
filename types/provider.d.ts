import { Model, ParsedUrl } from '.'

export type ProvideData = {
  data: Model
  input: ParsedUrl
}

export type Provider = 'YouTube' | 'File Format' | string

export type Providers = {
  [key in Provider]: ProviderFunctional
}

export type ProviderCallback = (value: string, namespace: string) => Promise<ProvideData | undefined>

export type ProviderFunctional = {
  callback: ProviderCallback
  expression: RegExp
}
