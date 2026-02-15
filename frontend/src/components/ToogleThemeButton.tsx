import { Sun, Moon } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import { Button } from './ui/button'

const ToogleThemeButton = () => {
    const { theme, toggleTheme } = useTheme()
    return (
    <Button variant='ghost' onClick={toggleTheme}>
        {theme === 'light' ? <Moon /> : <Sun />}
    </Button>
    )
}

export default ToogleThemeButton