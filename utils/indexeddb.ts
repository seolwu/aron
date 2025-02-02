import { Attribute, Library } from '@/types/database'
import { Model } from '@/types'

const DB_NAME = 'AronDB'
const DB_VERSION = 1
const LIBRARIES_STORE = 'libraries'
const ATTRIBUTES_STORE = 'attributes'
const MODELS_STORE = 'models'

let db: IDBDatabase | null = null

export const initDB = async (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(new Error('Error opening database'))

    request.onsuccess = (event) => {
      db = (event.target as IDBOpenDBRequest).result
      resolve()
    }

    request.onupgradeneeded = (event) => {
      db = (event.target as IDBOpenDBRequest).result
      
      if (!db.objectStoreNames.contains(MODELS_STORE)) {
        const modelStore = db.createObjectStore(MODELS_STORE, { keyPath: 'id' })
        modelStore.createIndex('libraryId', 'libraryId', { unique: false })
      }
      
      if (!db.objectStoreNames.contains(ATTRIBUTES_STORE)) {
        const attrStore = db.createObjectStore(ATTRIBUTES_STORE, { keyPath: 'id' })
        attrStore.createIndex('libraryId', 'libraryId', { unique: false })
      }

      if (!db.objectStoreNames.contains(LIBRARIES_STORE)) {
        db.createObjectStore(LIBRARIES_STORE, { keyPath: 'id' })
      }
    }
  })
}

export const createDefaultLibrary = async (): Promise<Library> => {
  const defaultLibrary: Library = {
    id: 'default',
    name: 'Default',
  }

  await saveLibrary(defaultLibrary)
  return defaultLibrary
}

export const getOrCreateDefaultLibrary = async (): Promise<Library> => {
  const librarys = await getLibrarys()
  if (librarys.length === 0) {
    return await createDefaultLibrary()
  }
  return librarys[0]
}

const ensureDBInitialized = async (): Promise<IDBDatabase> => {
  if (!db) {
    await initDB()
  }
  if (!db) {
    throw new Error('Database initialization failed')
  }
  return db
}

export const updateModels = async (models: Model[], libraryId: string): Promise<void> => {
  const database = await ensureDBInitialized()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([MODELS_STORE], 'readwrite')
    const store = transaction.objectStore(MODELS_STORE)

    store.clear()

    models.forEach(model => {
      store.put({ ...model, libraryId })
    })

    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(new Error('Error updating models'))
  })
}

export const getModels = async (libraryId: string): Promise<Model[]> => {
  const database = await ensureDBInitialized()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([MODELS_STORE], 'readonly')
    const store = transaction.objectStore(MODELS_STORE)
    const index = store.index('libraryId')
    const request = index.getAll(libraryId)

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(new Error('Error getting models'))
  })
}

export const saveAttributes = async (attributes: Attribute[], libraryId: string): Promise<void> => {
  const database = await ensureDBInitialized()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([ATTRIBUTES_STORE], 'readwrite')
    const store = transaction.objectStore(ATTRIBUTES_STORE)

    attributes.forEach(attribute => {
      store.put({ ...attribute, libraryId })
    })

    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(new Error('Error saving attributes'))
  })
}

export const getAttributes = async (libraryId: string): Promise<Attribute[]> => {
  const database = await ensureDBInitialized()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([ATTRIBUTES_STORE], 'readonly')
    const store = transaction.objectStore(ATTRIBUTES_STORE)
    const index = store.index('libraryId')
    const request = index.getAll(libraryId)

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(new Error('Error getting attributes'))
  })
}

export const saveLibrary = async (library: Library): Promise<void> => {
  const database = await ensureDBInitialized()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([LIBRARIES_STORE], 'readwrite')
    const store = transaction.objectStore(LIBRARIES_STORE)
    
    const request = store.put(library)

    request.onsuccess = () => resolve()
    request.onerror = () => reject(new Error('Error saving library'))
  })
}

export const getLibrarys = async (): Promise<Library[]> => {
  const database = await ensureDBInitialized()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([LIBRARIES_STORE], 'readonly')
    const store = transaction.objectStore(LIBRARIES_STORE)
    const request = store.getAll()

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(new Error('Error getting librarys'))
  })
}

export const deleteLibrary = async (libraryId: string): Promise<void> => {
  const database = await ensureDBInitialized()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([LIBRARIES_STORE, MODELS_STORE, ATTRIBUTES_STORE], 'readwrite')
    const libraryStore = transaction.objectStore(LIBRARIES_STORE)
    const modelsStore = transaction.objectStore(MODELS_STORE)
    const attributesStore = transaction.objectStore(ATTRIBUTES_STORE)

    libraryStore.delete(libraryId)
    
    const modelsIndex = modelsStore.index('libraryId')
    const modelsRequest = modelsIndex.openCursor(IDBKeyRange.only(libraryId))
    modelsRequest.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue | null>).result
      if (cursor) {
        cursor.delete()
        cursor.continue()
      }
    }

    const attributesIndex = attributesStore.index('libraryId')
    const attributesRequest = attributesIndex.openCursor(IDBKeyRange.only(libraryId))
    attributesRequest.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue | null>).result
      if (cursor) {
        cursor.delete()
        cursor.continue()
      }
    }

    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(new Error('Error deleting library'))
  })
}
