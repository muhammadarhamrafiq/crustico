import ToogleThemeButton from "./ToogleThemeButton"
import { SidebarTrigger } from "./ui/sidebar"

const Header = () => {
    return (
    <header className="w-full px-4 py-2 flex justify-end items-center">
        <ToogleThemeButton />
        <SidebarTrigger />
    </header>
    )
}

export default Header