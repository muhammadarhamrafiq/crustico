import useProducts from '@/hooks/useProducts'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router'
import { PlusCircle,} from 'lucide-react'
import Card from '@/components/Card'
import Search from '@/components/Search'
import { useState } from 'react'
import useDebounce from '@/hooks/useDebounce'
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination'

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
    const [page, setPage] = useState(1)
    const {products, loading, pages} = useProducts({
        page: page,
        limit: 1,
        search: useDebounce(search, 500)
    })


    return (
    <>
        <div className='flex items-center justify-between'>
            <div>
                <h1 className="text-2xl font-bold mb-4">Products</h1>
            </div>
            <div className='flex items-center gap-2'>
                <Search placeholder='Search products...' value={search} onChange={(s) => setSearch(s)} />
                <Button  size='icon-sm' asChild><Link to='create-product'><PlusCircle /></Link></Button>
            </div>
        </div>
        <div>
            {loading ? (
                <p>Loading...</p>
            ) : products.length === 0 ? (
                <p>No products found.</p>
            ) : (
                <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4'>
                    {
                        products.map(p => <Card product={p} key={p.id}/>)
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