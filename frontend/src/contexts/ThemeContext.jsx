import { createContext, useContext } from 'react'
import { THEMES } from '../themes'

export const ThemeContext = createContext(THEMES.coral)

export function useTheme() {
  return useContext(ThemeContext)
}
