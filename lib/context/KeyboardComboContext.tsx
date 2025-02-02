import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export type KeyEvent = (key: string, event: globalThis.KeyboardEvent) => void

type State = {
  all: string[]
  focus: string[]
  blur: string[]
  send: string[]
  nextPage: string[]
  previousPage: string[]
  select: string[]
  newWindow: string[]
  copyToClipboard: string[]
  deleteSelect: string[]
  playByPopup: string[],
  setKeyFocus: (keys: string[]) => void
  setKeyBlur: (keys: string[]) => void
  setKeySend: (keys: string[]) => void
  setKeyNextPage: (keys: string[]) => void
  setKeyPreviousPage: (keys: string[]) => void
  setKeySelect: (keys: string[]) => void
  setKeyNewWindow: (keys: string[]) => void
  setKeyCopyToClipboard: (keys: string[]) => void
  setKeyDeleteSelect: (keys: string[]) => void
  setKeyPopupPlay: (keys: string[]) => void
}

export const useKeys = create<State>()(
  devtools(set => ({
    all: [
      'alphanumeric', 'function',
      'enter', 'esc', 'tab', 'space', 'backspace', 'del', 'ins', 'home', 'end', 'pageup', 'pagedown', 
      'up', 'down', 'left', 'right', 'cap', 'num', 'clear',
      ';', '=', ',', '-', '.', '/', '`', '[', ']', '*', '+', '\'',
    ],
    focus: ['alphabetic', 'ctrl+z', 'ctrl+x', 'ctrl+c', 'ctrl+v', 'ctrl+a', 'ctrl+y'],
    blur: ['esc'],
    send: ['enter'],
    nextPage: ['shift+d'],
    previousPage: ['shift+a'],
    select: [
      ...Array(10).fill(0).map((_, idx) => `shift+${idx}`),
      ...['q', 'w', 'e', 'r', 't'].map(t => `shift+${t}`),
    ],
    newWindow: ['alt+s'],
    copyToClipboard: ['alt+c'],
    deleteSelect: ['alt+d'],
    playByPopup: ['alt+a'],
    setKeyFocus: keys => set(() => ({ focus: keys })),
    setKeyBlur: keys => set(() => ({ blur: keys })),
    setKeySend: keys => set(() => ({ send: keys })),
    setKeyNextPage: keys => set(() => ({ nextPage: keys })),
    setKeyPreviousPage: keys => set(() => ({ previousPage: keys })),
    setKeySelect: keys => set(() => ({ select: keys })),
    setKeyNewWindow: keys => set(() => ({ newWindow: keys })),
    setKeyCopyToClipboard: keys => set(() => ({ copyToClipboard: keys })),
    setKeyDeleteSelect: keys => set(() => ({ deleteSelect: keys })),
    setKeyPopupPlay: keys => set(() => ({ playByPopup: keys })),
  }))
)