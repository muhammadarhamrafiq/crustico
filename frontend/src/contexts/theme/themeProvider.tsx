import { useState, useEffect } from "react";
import { ThemeContext } from "./themeContext";
import type { Theme } from "./themeContext";

interface ThemeProviderProps {
    children: React.ReactNode
}

const getSystemTheme = () : Theme => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return "dark"
    }
    return "light"
}

export const ThemeProvider = ({children} : ThemeProviderProps) => {
    const [theme, setTheme] = useState<Theme>(getSystemTheme())

    const toggleTheme = () => {
        setTheme(prev => prev === "light" ? "dark" : "light")
    }
    
    useEffect(() => {
        const root = window.document.documentElement

        root.classList.remove('light', 'dark')
        root.classList.add(theme)
    }, [theme])

    const value = {
        theme,
        toggleTheme
    }
    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    )
}