import { useState } from "react";
import Search from "@/components/Search";
import { Button } from "@/components/ui/button";
import { DeleteIcon, Edit2Icon, FolderIcon, PlusCircle } from "lucide-react";
import CategorySheet from "./CategorySheet";
import { toast } from "sonner";
import API from "@/utils/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import useCategories from "@/hooks/useCategories";

import type { Category } from "@/types";
import Confirm from "@/components/Confirm";

const CategoryPage = ()=> {
    const [search, setSearch] = useState('')
    const {categories, loading, refetch} = useCategories()

    const handleCreate = async (data: Category) => {
        const res = await API.post('/categories/add', data).send()
        if(!res.success) {
            toast.error(res.message)
            return false
        }
        toast.message(res.message)
        refetch()
        return true
    }

    const handleUpdate = async (id: string, data: Category) => {
        const res = await API.put(`/categories/${id}`, data).send()
        if(!res.success){
            toast.error(res.message)
            return false
        }
        toast.message(res.message)
        refetch()
        return true
    }

    const handleDelete = async (id: string) => {
        const res = await API.delete(`/categories/${id}`).send()
        if(!res.success){
            toast.error(res.message)
            return
        }
        toast.message(res.message)
        refetch()
    }

    if(loading) return (
        <div className="flex flex-col items-center justify-center gap-2 mt-10">
            <FolderIcon className="h-12 w-12 text-muted-foreground animate-pulse" />
            <p className="text-muted-foreground">Loading categories...</p>
        </div>
    )

    return (
        <>
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold mb-4">Categories</h1>
                </div>
                <div className='flex items-center gap-2'>
                    <Search placeholder='Search categories...' value={search} onChange={(s) => setSearch(s)} />
                    <CategorySheet onSubmit={handleCreate} title="Create Category" description="Fill the following details to create category">
                        <Button className="cursor-pointer" ><PlusCircle /></Button>
                    </CategorySheet>
                </div>
            </div>
            {categories.length > 0 ? 
            <div className="rounded-lg border border-muted overflow-hidden mt-2">
                <Table className="bg-background w-full">
                    <TableHeader>
                        <TableRow className="bg-muted/50 hover:bg-muted/50">
                            <TableHead className="w-30" />
                            <TableHead className="w-50 font-semibold text-foreground">
                                Name
                            </TableHead>
                            <TableHead className="font-semibold text-foreground">
                                Description
                            </TableHead>
                            <TableHead className="w-25 text-right" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {categories.filter((c)=> c.name.includes(search) || c.description?.includes(search)).map((category) => (
                            <TableRow
                                key={category.id}
                                className="transition-colors hover:bg-muted/40"
                            >
                                <TableCell className="font-medium gap-1">
                                    <div className="flex items-center gap-1">
                                        <FolderIcon className="h-4 w-4 text-muted-foreground" />/ {category.slug}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {category.name}
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {category.description}
                                </TableCell>
                            
                                <TableCell>
                                    <div className="flex justify-end gap-1">
                                        <CategorySheet value={category} onSubmit={(data) => handleUpdate(category.id, data)} title="Update Category" description="Modify the following details to update category">
                                            <Button
                                                size="icon-sm"
                                                variant="ghost"
                                                className="cursor-pointer"
                                            >
                                                <Edit2Icon className="h-4 w-4" />
                                            </Button>
                                        </CategorySheet>
                                
                                        <Confirm onConfirm={()=>handleDelete(category.id)} heading="Delete Category" message={`Are you sure you want to delete category "${category.name}"? This action cannot be undone.`}>
                                            <Button
                                                size="icon-sm"
                                                variant="ghost"
                                                className="cursor-pointer"
                                            >
                                                <DeleteIcon className="h-4 w-4" />
                                            </Button>
                                        </Confirm>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div> :
            <div className="flex flex-col items-center justify-center gap-2 mt-10">
                <FolderIcon className="h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">No categories found</p>
            </div>
            }

        </>
    )
}

export default CategoryPage;