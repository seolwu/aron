'use client'

import React, { RefObject, useCallback, useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { toast } from 'react-toastify'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { cn, hasNullValue as nv } from '@/utils'
import { updateModels } from '@/utils/indexeddb'
import { Model, ProviderFunctional, Providers } from '@/types'
import { Library } from '@/types/database'
import { KeyEvent, useKeys } from './KeyboardComboContext'

const KeyboardEventHandler = dynamic(() => import('react-keyboard-event-handler'), { ssr: false })
const ModelItem = dynamic(() => import('@/components/ModelItem'), { ssr: false })

type State = {
  baseLibraryRef: RefObject<HTMLDivElement | null>
  currentLibrary: Library
  libraries: Library[]
  libraryModels: Model[]
  libraryPageModels: Model[]
  libraryCurrentPage: number
  libraryModelsPerPage: number
  libraryPageCount: number
  playerSource: string | null
  setBaseLibraryRef: (ref: RefObject<HTMLDivElement  | null>) => void
  setCurrentLibrary: (value: Library) => void
  setLibraries: (value: Library[]) => void
  setLibraryModels: (value: Model[]) => void
  setLibraryPageModels: (value: Model[]) => void
  setLibraryModelsPerPage: (value: number) => void
  setLibraryCurrentPage: (value: number) => void
  setLibraryPageCount: (value: number) => void
  setPlayerSource: (value: string | null) => void
  paginate: (page: number) => void
  sortModels: (libraryPageModels: Model[]) => Model[]
  deleteRawModel: (index: number) => void
  requestToProvider: (namespace: string, functional: ProviderFunctional, value: string) => Promise<boolean>
  validateInput: (input: HTMLInputElement | HTMLTextAreaElement, namespace: string, providers: Providers) => void
}

export const useLibrary = create<State>()(
  devtools((set) => ({
    currentLibrary: null,
    libraries: [],
    libraryModels: [],
    libraryPageModels: [],
    libraryCurrentPage: 1,
    libraryModelsPerPage: 10,
    libraryPageCount: 0,
    playerSource: null,
    setBaseLibraryRef: ref => set(() => ({ baseLibraryRef: ref })),
    setCurrentLibrary: value => set(() => ({ currentLibrary: value })),
    setLibraries: value => set(() => ({ libraries: value })),
    setLibraryModels: value => set(() => ({ libraryModels: value })),
    setLibraryPageModels: value => set(() => ({ libraryPageModels: value })),
    setLibraryModelsPerPage: value => set(() => ({ libraryCurrentPage: value })),
    setLibraryCurrentPage: value => set(() => ({ libraryModelsPerPage: value })),
    setLibraryPageCount: value => set(() => ({ libraryPageCount: value })),
    setPlayerSource: value => set(() => ({ playerSource: value })),
    paginate: page => {
      set(state => {
        const startIndex = (page - 1) * state.libraryModelsPerPage
        const selectedWords = state.libraryModels.slice(startIndex, startIndex + state.libraryModelsPerPage)
        state.libraryCurrentPage = page
        return { libraryPageModels: selectedWords }
      })
    },
    sortModels: libraryPageModels => {
      const sortByCreatedAt = (a: Model, b: Model) => {
        return b.createdAt - a.createdAt
      }
      return libraryPageModels.sort(sortByCreatedAt)
    },
    deleteRawModel: index => {
      set(state => {
        const updatedModel = [...state.libraryModels]
        updatedModel.splice(index, 1)
        return { libraryModels: updatedModel }
      })
    },
    requestToProvider: async (namespace, functional, value) => {
      const response = await functional.callback(value, namespace)
      set(state => {
        if (response) {
          const { data: model } = response
          if (model) {
            return { libraryModels: [model, ...state.libraryModels]}
          }
        }
        return state
      })
      return true
    },
    validateInput: (input, namespace, providers) => {
      set(state => {
        const value = input.value
        
        if (!value) {
          toast('Empty URLs cannot be added.')
        } else if (providers) {
          const providerArray = Object.entries(providers)
          const tested = providerArray.filter(([, { expression }]) => expression.test(value)).pop()
      
          if (tested) {
            const [, functional] = tested
            const clearInput = (isSuccess: boolean) => isSuccess && (input.value = '')
            state.requestToProvider(namespace, functional, value).then(clearInput)
          } else {
            toast('The format is incorrect!')
          }
        } else {
          toast('An unknown error has occurred.')
        }

        return state
      })
    },
  }))
)

type ModelPartition = {
  [key: string]: HTMLElement | null
}

const getModelElement = (ref: React.RefObject<HTMLDivElement | null>, index: number): ModelPartition => {
  const children = ref.current!.children
  const child = children.item(index)

  if (child) {
    const tag = child.tagName || 'span'

    if (!/span/i.test(tag)) {
      const firstChild = child as HTMLAnchorElement
      const thumbnailContainer = firstChild.querySelector('#ar-thumbnail-container') as HTMLElement
      const cinematic = firstChild.querySelector('#ar-thumbnail-cinematic') as HTMLElement
      const action = firstChild.querySelector('#ar-action') as HTMLElement

      return { thumbnailContainer, cinematic, action }
    }
  }

  return {}
}
export const focusModel = ({ cinematic, action } : ModelPartition) => {
  if (cinematic) {
    cinematic.style.opacity = '0.35'
    cinematic.style.scale = '3'
  }
  if (action) {
    action.style.opacity = '0.9'

    const actions = action.children
    for (const elem of actions) {
      const btn = elem.querySelector('*>*') as HTMLElement
      btn.style.filter = 'brightness(1)'
      btn.style.transitionDuration = '150ms'
    }
  }
}
export const blurModel = ({ cinematic, action } : ModelPartition) => {
  if (cinematic) {
    cinematic.style.opacity = ''
    cinematic.style.scale = ''
  }
  if (action) {
    action.style.opacity = ''

    const actions = action.children
    for (const elem of actions) {
      const btn = elem.querySelector('*>*') as HTMLElement
      btn.style.filter = ''
      btn.style.transitionDuration = ''
    }
  }
}
const clickAction = (partition: ModelPartition, query: string) => {
  const action = partition.action
  if (action) {
    const btn = action.querySelector(query) as HTMLButtonElement
    btn.click()
  }
}

const Trigger: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className }) => {
  const {
    setBaseLibraryRef,
    currentLibrary: current,
    libraryModels: models, setLibraryModels: setModels,
    libraryPageModels: pageModels,
    libraryCurrentPage: currentPage,
    libraryPageCount: maxPage, setLibraryPageCount: setPageCount,
    libraryModelsPerPage: perPage,
    deleteRawModel: deleteModel,
    paginate,
    playerSource, setPlayerSource,
  } = useLibrary()
  const {
    all: keysOfAll,
    nextPage: keysOfNextPage,
    previousPage: keysOfPreviousPage,
    select: keysOfSelect,
    newWindow: keysOfNew,
    copyToClipboard: keysOfCopy,
    deleteSelect: keysOfDelete,
    playByPopup: keysOfPlay,
  } = useKeys()

  const baseLibraryRef = useRef<HTMLDivElement>(null)

  const [focusIndex, setFocusIndex] = useState(-1)

  const toPrevious = useCallback<KeyEvent>((_, event) => {
    event.preventDefault()
    const newPage = currentPage - 1
    if (newPage > 0) paginate(newPage)
  }, [currentPage, paginate])
  const toNext = useCallback<KeyEvent>((_, event) => {
    event.preventDefault()
    const newPage = currentPage + 1
    if (currentPage !== maxPage) paginate(newPage)
  }, [currentPage, maxPage, paginate])
  const select = useCallback<KeyEvent>((key, event) => {
    event.preventDefault()

    if (!baseLibraryRef) return

    const numeric = /[0-9]/, alphabet = /[a-z]/i
    const char = key.replace(/^[\w]+\+/, '')
    
    let num: number = 0
    if (char) {
      if (numeric.test(char)) {
        num = Number(char)
      } else if (alphabet.test(char)) {
        num = ['q', 'w', 'e', 'r', 't'].indexOf(char) + 6
      }
      if (num === 0) (num = 10)
    }

    setFocusIndex(num - 1)
  }, [baseLibraryRef, setFocusIndex])

  const newWindow = useCallback<KeyEvent>((_, event) => {
    event.preventDefault()
    if (focusIndex >= 0) {
      const partition = getModelElement(baseLibraryRef, focusIndex)
      clickAction(partition, '#ar-action-open')
    }
  }, [focusIndex])
  const copyClipboard = useCallback<KeyEvent>((_, event) => {
    event.preventDefault()
    if (focusIndex >= 0) {
      const partition = getModelElement(baseLibraryRef, focusIndex)
      clickAction(partition, '#ar-action-copy')
    }
  }, [focusIndex])
  const deleteSelect = useCallback<KeyEvent>((_, event) => {
    event.preventDefault()
    if (focusIndex >= 0) {
      const partition = getModelElement(baseLibraryRef, focusIndex)
      clickAction(partition, '#ar-action-delete')
    }
  }, [focusIndex])
  const popupPlay = useCallback<KeyEvent>((_, event) => {
    event.preventDefault()
    if (focusIndex >= 0) {
      const partition = getModelElement(baseLibraryRef, focusIndex)
      const container = partition.thumbnailContainer
      if (container) {
        container.click()
      }
    }
  }, [focusIndex])
  const popupClose = useCallback<KeyEvent>((_, event) => {
    event.preventDefault()
    if (playerSource) {
      setPlayerSource(null)
    }
  }, [playerSource, setPlayerSource])

  useEffect(() => setBaseLibraryRef(baseLibraryRef), [baseLibraryRef, setBaseLibraryRef])
  useEffect(() => {
    if (playerSource) {
      toast('Tap outside the screen to exit the player.')
    }
  }, [playerSource])
  useEffect(() => {
    for (let i = 0; i < perPage; i++) {
      if (focusIndex >= 0) {
        const modelElement = getModelElement(baseLibraryRef, i)
        if (i === focusIndex) {
          focusModel(modelElement)
        } else {
          blurModel(modelElement)
        }
      } else {
        const modelElement = getModelElement(baseLibraryRef, i)
        blurModel(modelElement)
      }
    }
  }, [focusIndex, perPage])
  useEffect(() => {
    if (currentPage > 1 && pageModels.length === 0) {
      const cpage = currentPage - 1
      paginate(cpage)
    }
  }, [pageModels, currentPage, paginate])
  useEffect(() => {
    setPageCount(Math.ceil(models.length / perPage))
    const incorrect = models.filter(model => nv(model))
    if (incorrect.length) {
      const correct = models.filter(model => !nv(model))
      setModels(correct)
      toast('Detected and removed an incorrect model.')
    }
    if (current) {
      try {
        async function save() {
          await updateModels(
            models,
            current.id!)
        }
        save()
      } catch {}
    }
    paginate(currentPage)
  }, [current, currentPage, models, perPage, paginate, setModels, setPageCount])

  return (<>
    <KeyboardEventHandler handleKeys={['esc']} onKeyEvent={popupClose} />
    <KeyboardEventHandler handleKeys={keysOfAll} onKeyEvent={() => setFocusIndex(-1)} />
    <KeyboardEventHandler handleKeys={keysOfNextPage} onKeyEvent={toNext} />
    <KeyboardEventHandler handleKeys={keysOfPreviousPage} onKeyEvent={toPrevious} />
    <KeyboardEventHandler handleKeys={keysOfSelect} onKeyEvent={select} />
    <KeyboardEventHandler handleKeys={keysOfNew} onKeyEvent={newWindow} />
    <KeyboardEventHandler handleKeys={keysOfCopy} onKeyEvent={copyClipboard} />
    <KeyboardEventHandler handleKeys={keysOfDelete} onKeyEvent={deleteSelect} />
    <KeyboardEventHandler handleKeys={keysOfPlay} onKeyEvent={popupPlay} />
    <div
      ref={baseLibraryRef}
      className={cn(className)}
    >
      {pageModels.length ? (
        pageModels.map((model, idx) => (
          <ModelItem
            key={idx + model.id}
            model={model}
            onDelete={() => deleteModel(currentPage * idx)}
            onThumbnailInteract={() => setPlayerSource(model.videoInfo.url)}
          />
        ))
      ) : (
        <span className={cn`
          flex items-center m-auto h-[calc(100dvh-10rem)]
          text-on-background/85 text-xs font-light
        `}>
          There are no videos added yet.
        </span>
      )}
    </div>
  </>)
}

export default Trigger
