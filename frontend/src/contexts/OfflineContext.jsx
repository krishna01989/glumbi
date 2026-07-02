import { createContext, useContext } from 'react'

export const OfflineContext = createContext(false)
export const useOffline = () => useContext(OfflineContext)
