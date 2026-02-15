import AppSidebar from "./AppSidebar"
import { SidebarProvider } from "./ui/sidebar"
import Header from "./Header"
import { Toaster } from "./ui/sonner"

interface LayoutProps {
    children: React.ReactNode
}

const Layout = ({ children } : LayoutProps) => {

    return (
    <SidebarProvider>
        <AppSidebar />
        <div className="flex flex-col flex-1 min-h-screen">
            <Header />
            <main className="w-full px-4 py-8">
                {children}
            </main>
            <Toaster />
        </div>
    </SidebarProvider>
    )
}

export default Layout