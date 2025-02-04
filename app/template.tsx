'use client'

import { useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Poppins } from 'next/font/google'
import ReactPlayer from 'react-player/lazy'
import { AnimatePresence, motion } from 'motion/react'
import ResponsivePagination from 'react-responsive-pagination'
import { cssTransition, ToastContainer } from 'react-toastify'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/utils'
import { ControllerURLFormat, Providers } from '@/types'
import { initalizeLib } from '@/lib'
import { useGlobal } from '@/lib/context/GlobalContext'
import { useLibrary } from '@/lib/context/LibraryContext'
import { useController } from '@/lib/context/ControllerContext'
import 'animate.css'

const BaseLibrary = dynamic(() => import('@/lib/context/LibraryContext'), { ssr: false })
const Controller = dynamic(() => import('@/lib/context/ControllerContext'), { ssr: false })
const GlobalConstruct = dynamic(() => import('@/components/GlobalConstruct'), { ssr: false })

const poppins = Poppins({
  variable: '--poppins',
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
})

const Template: React.FC = () => {
  const { namespace, setNamespace, setProviders } = useGlobal()

  const {
    setLibraries, setCurrentLibrary,
    setLibraryModels,
    libraryCurrentPage,
    libraryPageCount,
    playerSource, setPlayerSource,
    paginate, sortModels,
  } = useLibrary()
  const {
    controllerState,
    controllerGuideVisible,
    urlformat, setURLFormat,
  } = useController()

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const constructChanged = ([k, v]: [string, any]) => {
    if (k === 'namespace') setNamespace(v as string)
    if (k === 'format') setURLFormat(v as ControllerURLFormat[])
    if (k === 'providers') setProviders(v as Providers)
  }
  /* eslint-enable @typescript-eslint/no-explicit-any */

  // Initlize IndexedDB
  useEffect(() => {
    initalizeLib()
      .then(([currentLib, libs, models]) => {
        if (currentLib) setCurrentLibrary(currentLib)
        if (libs) setLibraries(libs)
        if (models) {
          const sorted = sortModels(models)
          setLibraryModels(sorted)
        }
      })
  }, [setCurrentLibrary, setLibraries, setLibraryModels, sortModels])

  return (<>
    <GlobalConstruct
      prop-namespace={namespace}
      prop-controller-format={urlformat}
      onChange={constructChanged}
    ></GlobalConstruct>
    <div className='h-svh select-none'>
      <div className={cn`
        flex flex-col-reverse sm:flex-row gap-0 md:gap-4
        mx-0 md:mx-4 h-dvh
      `}>
        {/* Space and Plugins */}
        <aside className='hidden lg:block flex-1'></aside>
        <main className='relative flex-1 basis-full md:basis-1/3 md:py-4 md:max-w-3xl'>
          {/* Pagination, BaseLibrary */}
          <div className='h-full rounded-md border-0 md:border border-outline overflow-hidden'>
            <div className='relative grid grid-rows-[auto_1fr_auto] h-full'>
              <div className='row-span-1 bg-background/85 backdrop-blur-md z-10'>
                <ResponsivePagination
                  current={libraryCurrentPage}
                  total={libraryPageCount}
                  className='flex justify-between gap-1 p-1 border-b border-outline'
                  previousClassName={cn`
                    flex flex-row !justify-start flex-1
                    [&.disabled>*]:brightness-50 [&.disabled>*]:pointer-events-none
                  `}
                  nextClassName={cn`
                    flex flex-row-reverse !justify-start flex-1
                    [&.disabled>*]:brightness-50 [&.disabled>*]:pointer-events-none
                  `}
                  pageItemClassName={cn`
                    ${poppins.className} flex items-center justify-center transition-colors
                    [&.active>*]:bg-white/[0.0125] [&.active>*]:text-on-background
                    [&.active>*]:border [&.active>*]:border-outline/45
                    [&.active>*]:pointer-events-none
                  `}
                  pageLinkClassName={cn`
                    flex items-center justify-center p-0 w-8 h-8
                    hover:bg-black/[0.03] hover:dark:bg-white/[0.03]
                    text-on-background/60 hover:text-on-background
                    rounded-sm border border-transparent hover:border-outline
                    text-sm cursor-pointer transition-colors
                  `}
                  previousLabel={<ChevronLeft className='w-5 md:w-4 h-5 md:h-4' />}
                  nextLabel={<ChevronRight className='w-5 md:w-4 h-5 md:h-4' />}
                  onPageChange={paginate}
                />
              </div>
              <div className='absolute inset-0 row-[1/4] overflow-hidden'>
                <div className='px-0 md:px-6 py-6 h-full overflow-auto'>
                  <BaseLibrary className='flex flex-col gap-3 mt-10 mb-10 lg:mb-0' />
                </div>
              </div>
            </div>
          </div>
          {/* Display msg when the min-width: 1024px */}
          <AnimatePresence>
            {!controllerState && controllerGuideVisible && (
              <div className={cn`
                absolute inset-x-0 bottom-6 mx-auto
                hidden lg:flex items-center justify-center
                h-10 border border-transparent
                pointer-events-none z-[149]
              `}>
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.55, delay: 0.215 }}
                  className={cn`
                    px-1 py-0.5 bg-transparent text-on-background rounded-sm
                    text-xs backdrop-blur-sm border border-primary/5
                  `}
                >
                  {'When you press a character, an input field appears.'}
                </motion.span>
              </div>
            )}
          </AnimatePresence>
          {/* URL Input */}
          <Controller />
        </main>
        <aside className='absolute sm:relative flex-1'>
          {/* Toast */}
          <div className={cn`
            absolute bottom-auto md:bottom-0 inset-x-0 md:inset-x-0
            opacity-75 pointer-events-none z-50
          `}>
            <ToastContainer
              toastClassName={cn`
                !relative !flex !justify-between !p-2 !mt-1 !mb-auto !w-auto !min-h-8
                !bg-background !border !border-outline !rounded-sm
                !text-xs !overflow-hidden
              `}
              position='bottom-right'
              transition={cssTransition({
                enter: 'animate__animated animate__fadeInUp animate__faster',
                exit: 'animate__animated animate__fadeOutUp animate__faster',
              })}
              aria-label=''
              autoClose={350}
              closeButton={false}
              hideProgressBar={true}
              closeOnClick={false}
              pauseOnHover={false}
              pauseOnFocusLoss={false}
              theme=''
              limit={1}
            />
          </div>
        </aside>
        {/* Video Player */}
        <AnimatePresence>
          {playerSource && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={cn`
                absolute inset-0 flex items-center
                bg-white/5 backdrop-blur-xl z-200
              `}
            >
              <div className='absolute inset-0' onClick={() => setPlayerSource(null)}></div>
              <div className='m-auto container aspect-video z-10'>
                <div className={cn`
                  w-full h-full bg-black rounded-md
                  shadow-2xl shadow-black/[0.075] dark:shadow-white/[0.03]
                  overflow-hidden pointer-events-auto
                `}>
                  <ReactPlayer
                    width='100%'
                    height='100%'
                    url={playerSource}
                    style={{ borderRadius: '0.375rem', overflow: 'hidden' }}
                    pip={true}
                    controls={true}
                    config={{ youtube: { playerVars: { autoplay: 1 }}}}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
    <canvas width={0} height={0} />
  </>)
}

export default Template
