import { FocusEvent, RefObject, useCallback, useEffect, useRef } from 'react'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import KeyboardEventHandler from 'react-keyboard-event-handler'
import { CircleAlert, SendHorizonal } from 'lucide-react'
import { cn } from '@/utils'
import { useGlobal } from './GlobalContext'
import { useKeys, KeyEvent } from './KeyboardComboContext'
import { ControllerURLFormat } from '@/types'
import { useLibrary } from '@/lib/context/LibraryContext'
import Button from '@/components/Button'
import Format from '@/components/Format'
import Tooltip from '@/components/Tooltip'

type State = {
  controllerRef: RefObject<HTMLInputElement>
  controllerTimeoutRef: RefObject<NodeJS.Timer | null>
  controllerState: boolean
  controllerGuideVisible: boolean
  cc: number
  untilCloseTime: number
  urlformat: ControllerURLFormat[]
  setControllerRef: (ref: RefObject<any>) => void
  setControllerTimeoutRef: (ref: RefObject<NodeJS.Timer | null>) => void
  setControllerState: (state: boolean) => void
  setControllerGuideVisible: (state: boolean) => void
  setCC: (count: number) => void
  setURLFormat: (format: ControllerURLFormat[]) => void
  setUntilCloseTime: (time: number) => void
}

export const useController = create<State>()(
  devtools(set => ({
    controllerState: false,
    controllerGuideVisible: true,
    cc: 0,
    untilCloseTime: 3,
    urlformat: [{
      name: 'YouTube',
      format: 'https:[//][www.]youtube.com/watch?v=*',
    }, {
      name: 'YouTube Universal Link',
      format: 'https:[//]youtu.be/*',
    }, {
      name: 'File Format',
      format: 'http[s]:[//]*.[mp4|webm|ogv]',
    }],
    setControllerRef: ref => set(() => ({ controllerRef: ref })),
    setControllerTimeoutRef: ref => set(() => ({ controllerTimeoutRef: ref })),
    setControllerState: state => set(() => ({ controllerState: state })),
    setControllerGuideVisible: state => set(() => ({ controllerState: state })),
    setCC: count => set(() => ({ cc: count })),
    setURLFormat: format => set(() => ({ urlformat: format })),
    setUntilCloseTime: time => set(() => ({ untilCloseTime: time })),
  }))
)

const Controller: React.FC = () => {
  const { namespace, providers } = useGlobal()
  const { validateInput } = useLibrary()
  const {
    setControllerRef,
    setControllerTimeoutRef,
    controllerState, setControllerState,
    cc, setCC, urlformat, untilCloseTime,
  } = useController()
  const {
    focus: keysOfFocus,
    blur: keysOfBlur,
    send: keysOfSend,
  } = useKeys()

  const controllerRef = useRef<HTMLInputElement>(null)
  const controllerTimeoutRef = useRef<NodeJS.Timer>(null)

  function send() {
    const cRef = controllerRef
    if (!cRef) return
    
    if (cRef.current && providers) {
      validateInput(cRef.current, namespace, providers)
    }
  }

  const controllerHandler = useCallback((event: FocusEvent<HTMLInputElement>) => {
    const focused = event.type === 'focus'
    const timeout = focused ? 0 : 250 // if it's a focus handle; set to 0(NO-DELAY), not 250(ms).
    const callback = (state: boolean) => setControllerState(state)
    setTimeout(() => callback(focused), timeout)
  }, [setControllerState, setCC])

  const sendHandler = useCallback<KeyEvent>((_, event) => {
    event.preventDefault()
    send()
    setCC(0)
  }, [send, setCC])
  const maintenanceController = useCallback<KeyEvent>(() => setCC(0), [setCC])

  const visibleController = useCallback<KeyEvent>((_, event) => {
    event.preventDefault()
    setControllerState(true)
    setCC(0)
  }, [setControllerState, setCC])
  const invisibleController = useCallback<KeyEvent>((_, event) => {
    event.preventDefault()
    setControllerState(false)
  }, [setControllerState])
  
  useEffect(() => setControllerRef(controllerRef), [controllerRef.current])
  useEffect(() => setControllerTimeoutRef(controllerTimeoutRef), [controllerTimeoutRef.current])
  useEffect(() => {
    if (!controllerState) {
      const tRef = controllerTimeoutRef
      setCC(0)
      if (tRef) clearTimeout(tRef.current as unknown as number)
      return
    } else {
      const cRef = controllerRef
      const tRef = controllerTimeoutRef
      if (cRef && cRef.current && tRef) {
        const constant = () => {
          if (!cRef.current) return
          if (cc === -1 || cc >= untilCloseTime - 1) {
            clearInterval(tRef.current as unknown as number)
            setControllerState(false)
            setCC(0)
            cRef.current.blur()
          } else {
            setCC(cc + 1)
          }
        }
        controllerTimeoutRef.current = setInterval(constant, 1000)
        cRef.current.focus()
      }
    }

    return () => {
      const tRef = controllerTimeoutRef
      if (tRef) {
        clearInterval(tRef.current as unknown as number)
      }
    }

    // if (!controllerState) {
    //   setCC(0)
    //   if (controllerTimeoutRef) {
    //     clearTimeout(controllerTimeoutRef.current as unknown as number)
    //   }
    //   return
    // } else {
    //   controllerTimeoutRef.current = setInterval(() => {
    //     if (cc >= untilCloseTime - 1) {
    //       clearInterval(controllerTimeoutRef.current as unknown as number)
    //       if (controllerRef.current) 
    //         controllerRef.current.blur()
    //       setCC(0)
    //     } else {
    //       setCC(cc + 1)
    //     }
    //   }, 1000)
    // }

    // return () => {
    //   if (controllerTimeoutRef && controllerTimeoutRef.current) {
    //     clearInterval(controllerTimeoutRef.current as unknown as number)
    //   }
    // }
  }, [controllerState, cc, untilCloseTime])

  return (
    <div
      data-controller-state={controllerState}
      className={cn`
        absolute inset-x-0 bottom-0 flex z-[150]
        px-1 mx-0 mb-0 md:mb-4 lg:mx-2 lg:mb-6
        bg-background/85 border-t md:border border-outline
        rounded-none md:rounded-b-sm lg:rounded-t-sm
        backdrop-blur-md lg:shadow-2xl
        md:transition-[margin,background-color,color,border-color,filter] md:duration-500
        lg:focus-within:border-primary/15
        lg:[&:not([data-controller-state=true])]:-mb-9
        lg:[&:not([data-controller-state=true])]:blur-xs
      `}
    >
      <div className='flex items-center'>
        <Tooltip
          position='custom'
          tooltip-class='bottom-full left-0 mb-1.5'
          tooltip={<>
            <div className='flex flex-col'>
              <span>The link format is:</span>
              <code className={cn`
                flex flex-col mx-2 my-1
                [&_b]:font-light [&_b]:opacity-45 [&_b]:dark:opacity-30
              `}>
                {urlformat.map(({ name, format }, idx) => (
                  <Format key={idx + name} label={name} content={format} />
                ))}
              </code>
              <span className='opacity-50'>
                <span className='px-0.5 mr-1 rounded-sm border border-on-background/20 text-xs'>//</span>
                does not need to be included.
              </span>
            </div>
          </>}
        >
          <div className='opacity-65'>
            <CircleAlert className='w-5 h-5' />
          </div>
        </Tooltip>
      </div>
      <div className='basis-full'>
        <KeyboardEventHandler
          handleKeys={keysOfFocus}
          onKeyEvent={visibleController}
        />
        <KeyboardEventHandler
          handleKeys={keysOfBlur}
          onKeyEvent={invisibleController}
        >
          <KeyboardEventHandler
            handleKeys={keysOfSend}
            onKeyEvent={sendHandler}
          >
            <KeyboardEventHandler
              handleKeys={keysOfFocus}
              onKeyEvent={maintenanceController}
            >
              <input
                ref={controllerRef}
                id='controller'
                type='url'
                title=''
                placeholder='https://youtu.be/xQtC3F8fH6g'
                autoCapitalize='off'
                autoComplete='off'
                autoFocus={false}
                className={cn`
                  p-2 w-full bg-transparent
                  placeholder:text-on-background placeholder:opacity-20
                  text-base font-light outline-hidden appearance-none
                `}
                onFocus={controllerHandler}
                onBlur={controllerHandler}
              />
            </KeyboardEventHandler>
          </KeyboardEventHandler>
        </KeyboardEventHandler>
      </div>
      <div className='pl-2 m-auto'>
        <Button
          className='opacity-60 hover:opacity-95'
          onClick={send}
        >
          <SendHorizonal className='w-5 h-5' />
        </Button>
      </div>
    </div>
  )
}

export default Controller
