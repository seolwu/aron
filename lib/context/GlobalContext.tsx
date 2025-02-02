'use client'

import { v4 } from 'uuid'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { Providers } from '@/types'

type State = {
  namespace: string,
  providers: Providers | undefined,
  setNamespace: (ns: string) => void,
  setProviders: (providers: Providers) => void,
}

export const useGlobal = create<State>()(
  devtools((set) => ({
    namespace: v4(),
    providers: undefined,
    setNamespace: ns => set(() => ({ namespace: ns })),
    setProviders: providers => set(() => ({ providers: providers })),
  }))
)