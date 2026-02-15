import useProducts from '@/hooks/useProducts'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router'
import { PlusCircle,} from 'lucide-react'

const Products= () => {
    const {products, loading} = useProducts()

    return (
    <>
        <div className='flex items-center justify-between'>
            <div>
                <h1 className="text-2xl font-bold mb-4">Products</h1>
            </div>
            <div>
                <Button  size='icon-sm' asChild><Link to='create-product'><PlusCircle /></Link></Button>
            </div>
        </div>
        <div>
            {loading ? (
                <p>Loading...</p>
            ) : products.length === 0 ? (
                <p>No products found.</p>
            ) : (
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                    { JSON.stringify(products) }
                </div>
            )}
        </div>
    </>
    )
}

export default Products