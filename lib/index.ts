import { Model } from '@/types'
import { Library } from '@/types/database'
import { initDB, getOrCreateDefaultLibrary, getLibrarys, getModels, updateModels } from '@/utils/indexeddb'

export const initalizeLib = async (): Promise<[Library, Library[], Model[]] | [null, null, null]> => {
  try {
    await initDB()
    const loadedLibs = await getLibrarys()

    var currentLib = loadedLibs.find(lib => lib.id === 'default')
    if (!currentLib) {
      currentLib = await getOrCreateDefaultLibrary()
    }
    
    const [loadedModels] = await Promise.all([
      getModels(currentLib.id)
    ])

    return [currentLib, loadedLibs, loadedModels]
  } catch {
    return [null, null, null]
  }
}
