import { ChevronRight, ScanBarcode } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible"
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarHeader, SidebarMenuItem} from "./ui/sidebar"
import { Link, NavLink } from "react-router"

const AppSidebar = () => {
    return (
    <Sidebar>
        <SidebarHeader  className="mx-2 my-3">
            <Link to="/" className="text-lg font-bold flex items-center gap-2">
                <h1 className="text-lg font-bold flex items-center gap-2">
                    <img src="/crustico.svg" width={30} /> Crustico
                </h1>
            </Link>
        </SidebarHeader>
        <SidebarContent className="my-4">
            <Collapsible defaultOpen className="group">
                <SidebarGroup>
                    <SidebarGroupLabel className="hover:bg-accent cursor-pointer *:cursor-pointer">
                        <CollapsibleTrigger className="flex w-full items-center">
                            <span className="text-md flex items-center gap-1">
                                <ScanBarcode />
                                Product Management
                            </span>
                            <ChevronRight className="ml-auto transition-transform group-data-[state=open]:rotate-90" size={18} />
                        </CollapsibleTrigger>
                    </SidebarGroupLabel>
                    <CollapsibleContent>
                        <SidebarContent className="ml-4 my-1 border-l border-accent px-4 py-2 list-none gap-1 *:hover:bg-accent *:cursor-pointer *:py-0.5 *:px-1 *:rounded *:text-sm">
                            <NavLink to="/product-management/products">
                                <SidebarMenuItem>
                                    Products
                                </SidebarMenuItem>
                            </NavLink>
                            <NavLink to="/product-management/categories">
                                <SidebarMenuItem>
                                    Categories
                                </SidebarMenuItem>
                            </NavLink>
                            <NavLink to="/product-management/deals">
                                <SidebarMenuItem>
                                    Deals
                                </SidebarMenuItem>
                            </NavLink>
                        </SidebarContent>
                    </CollapsibleContent>
                </SidebarGroup>
            </Collapsible>
        </SidebarContent>
    </Sidebar>
    )
}

export default AppSidebar