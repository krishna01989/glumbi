import { createContext, useContext } from 'react'

export const ActivityTrackerContext = createContext({ track: () => {} })
export const useTracker = () => useContext(ActivityTrackerContext)
