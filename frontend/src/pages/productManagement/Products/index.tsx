import useProducts from '@/hooks/useProducts'
import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'
import Card from '@/components/Card'
import Search from '@/components/Search'
import { useState } from 'react'
import useDebounce from '@/hooks/useDebounce'
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination'
import API from '@/utils/api'
import { toast } from 'sonner'
import ProductSheet from './ProductSheet'
import type { Category, Product, Variant } from '@/types'
import useCategories from '@/hooks/useCategories'
import CategorySelector from './CategorySelector'

interface PaginationButtonProps {
    page: number
    onClick: () => void
    active: boolean
}

const PaginationButton = ({page, onClick, active} : PaginationButtonProps) => {
    return <PaginationItem>
        <PaginationLink onClick={onClick} href='#' isActive={active}>{page}</PaginationLink>
    </PaginationItem>
}

const Products= () => {
    const [search, setSearch] = useState('')
    const [category, setCategory] = useState<string>('')
    const [page, setPage] = useState(1)
    const [editingProduct, setEditingProduct] = useState<Product | null>(null)
    const [editOpen, setEditOpen] = useState(false)
    const { categories } = useCategories()
    const {products, loading, pages, refetch} = useProducts({
        page: page,
        limit: 16,
        search: useDebounce(search, 500),
        category: category
    })

    const handleDelete = async (id: string) => {
        const res = await API.delete(`/product/${id}/delete`).query({ confirm: true }).send()
        if(!res.success){
            toast.error(res.message || 'Failed to delete product')
            return
        }
        toast.message(res.message || 'Product deleted')
        refetch()
    }

    const handleCreate = async (data: {
        name: string
        sku: string
        slug: string
        basePrice: number
        description?: string
        image?: File | null
        variants?: Variant[]
        categoryIds?: string[]
    }) => {
        let imageUrl = ""
        if(data.image){
            const formData = new FormData()
            formData.append("image", data.image)
            const response = await API.post("/product/upload-image", formData).send()
            if(!response.success){
                toast.error(response.message)
                return false
            }
            imageUrl = response.data.url
        }

        const productPayload = {
            name: data.name,
            sku: data.sku,
            slug: data.slug,
            basePrice: data.basePrice,
            description: data.description || "",
            image: imageUrl,
            variants: data.variants || [],
            categoryIds: data.categoryIds || [],
        }

        console.log("Creating product with payload:", productPayload)

        const response = await API.post("/product/add", productPayload).send()
        if(!response.success){
            toast.error(response.message)
            return false
        }

        toast.success("Product created successfully")
        refetch()
        return true
    }

    const handleUpdate = async (data: {
        name: string
        sku: string
        slug: string
        basePrice: number
        description?: string
        image?: File | null
        categoryIds?: string[]
    }, productId?: string) => {
        if(!productId) return false

        if(data.image){
            const formData = new FormData()
            formData.append("image", data.image)
            const imageRes = await API.patch(`/product/${productId}/update-image`, formData).send()
            if(!imageRes.success){
                toast.error(imageRes.message || "Failed to update image")
                return false
            }
        }

        const payload = {
            name: data.name,
            sku: data.sku,
            slug: data.slug,
            basePrice: data.basePrice,
            description: data.description || "",
        }

        const res = await API.patch(`/product/${productId}/update`, payload).send()
        if(!res.success){
            toast.error(res.message || "Failed to update product")
            return false
        }

        toast.success("Product updated successfully")
        refetch()
        return true
    }

    const handleFetchProduct = async (productId: string) => {
        const res = await API.get(`/product/${productId}`).send()
        if(!res.success){
            toast.error(res.message || "Failed to load product")
            return null
        }
        return res.data as Product
    }

    const handleAddVariant = async (productId: string, variant: Variant) => {
        const res = await API.patch(`/product/${productId}/add-variants`, variant).send()
        if(!res.success){
            toast.error(res.message || "Failed to add variant")
            return null
        }
        toast.message(res.message || "Variant added")
        return res.data?.variants as Variant[]
    }

    const handleUpdateVariant = async (variant: Variant) => {
        if(!variant.id) return false
        const res = await API.patch(`/product/update-variant/${variant.id}`, {
            label: variant.label,
            priceModifier: variant.priceModifier,
            description: variant.description,
        }).send()
        if(!res.success){
            toast.error(res.message || "Failed to update variant")
            return false
        }
        toast.message(res.message || "Variant updated")
        return true
    }

    const handleDeleteVariant = async (variantId: string) => {
        const res = await API.delete(`/product/delete-variant/${variantId}`)
            .query({ confirm: true })
            .send()
        if(!res.success){
            toast.error(res.message || "Failed to delete variant")
            return false
        }
        toast.message(res.message || "Variant deleted")
        return true
    }

    const handleAddCategory = async (productId: string, categoryId: string) => {
        const res = await API.patch(`/product/${productId}/add-categories`, {
            categoryIds: [categoryId],
        }).send()
        if(!res.success){
            toast.error(res.message || "Failed to add category")
            return null
        }
        toast.message(res.message || "Category added")
        return res.data?.categories as Category[]
    }

    const handleRemoveCategory = async (productId: string, categoryId: string) => {
        const res = await API.delete(`/product/${productId}/remove-category/${categoryId}`).send()
        if(!res.success){
            toast.error(res.message || "Failed to remove category")
            return null
        }
        toast.message(res.message || "Category removed")
        return res.data?.categories as Category[]
    }

    const handleEdit = (product: Product) => {
        setEditingProduct(product)
        setEditOpen(true)
    }

    return (
    <>
        <div className='flex items-center justify-between'>
            <div>
                <h1 className="text-2xl font-bold mb-4">Products</h1>
            </div>
            <div className='flex items-center gap-2'>
                <Search placeholder='Search products...' value={search} onChange={(s) => setSearch(s)} />
                <div>
                    <CategorySelector value={category} onSelect={(id) => setCategory(id !== 'default' ? id : "")} allowDefault />
                </div>
                <ProductSheet
                    mode="create"
                    title="Create Product"
                    description="Fill the following details to create product"
                    categories={categories}
                    onSubmit={handleCreate}
                >
                    <Button size='icon-sm'><PlusCircle /></Button>
                </ProductSheet>
            </div>
        </div>
        <ProductSheet
            mode="edit"
            title="Edit Product"
            description="Update product details and variants"
            value={editingProduct}
            categories={categories}
            open={editOpen}
            onOpenChange={(nextOpen) => {
                setEditOpen(nextOpen)
                if(!nextOpen) setEditingProduct(null)
            }}
            onSubmit={handleUpdate}
            onFetchProduct={handleFetchProduct}
            onAddVariant={handleAddVariant}
            onUpdateVariant={handleUpdateVariant}
            onDeleteVariant={handleDeleteVariant}
            onAddCategory={handleAddCategory}
            onRemoveCategory={handleRemoveCategory}
        />
        <div>
            {loading ? (
                <p>Loading...</p>
            ) : products.length === 0 ? (
                <p>No products found.</p>
            ) : (
                <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4'>
                    {
                        products.map(p => (
                            <Card
                                product={p}
                                key={p.id}
                                onEdit={() => handleEdit(p)}
                                onDelete={handleDelete}
                            />
                        ))
                    }
                </div>
            )}
        </div>
        <div>
            <Pagination>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious className='cursor-pointer' onClick={()=>{setPage(p => p !== 1 ? p-1 : p)}}/>
                    </PaginationItem>
                    {
                        page > 2 && pages > 3 && 
                        <PaginationItem>
                            <PaginationEllipsis />
                        </PaginationItem>
                    }
                    {
                        page == 1 ? Array.from({length: Math.min(3, pages)}, (_, i) => i + 1).map(p => <PaginationButton key={p} page={p} onClick={() => setPage(p)} active={page === p} />) :
                        page == pages ? Array.from({length: Math.min(3, pages)}, (_, i) => pages - i).reverse().map(p => <PaginationButton key={p} page={p} onClick={() => setPage(p)} active={page === p} />) :
                        [page-1, page, page+1].map(p => <PaginationButton key={p} page={p} onClick={() => setPage(p)} active={page === p} />)
                    }
                    {
                        page < pages - 2 && pages > 3 && 
                        <PaginationItem>
                            <PaginationEllipsis />
                        </ PaginationItem>
                    }
                    <PaginationItem>
                        <PaginationNext className='cursor-pointer' onClick={() => setPage(p => p !== pages ? p+1 : p)} />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    </>
    )
}

export default Products