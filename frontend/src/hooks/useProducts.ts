import type { Product } from '@/types'
import API from '@/utils/api'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

interface UseProductsOptions {
    page?: number
    limit?: number
    search?: string
    category?: string
}

const useProducts = ({page, limit, search, category}: UseProductsOptions) => {
    const [ products, setProducts ] = useState<Product[]>([])
    const [loading, setLoading] = useState(false)
    const [total, setTotal] = useState(0)
    const [pages, setPages] = useState(0)
    const [refetchTrigger, setRefetchTrigger] = useState(0)

    useEffect(() => {
        const controller = new AbortController()

        const getProducts = async () => {
            setLoading(true)

            const query : {
                page: number
                limit: number
                search?: string
                category?: string
            } = {
                page: page || 1,
                limit: limit || 20,
            }

            if(search) query['search'] = search
            if(category) query['category'] = category
            
            const data = await API.get("/product").query(query).send()


            if(!data.success){
                toast.error(data.message || "Error fetching products")
                setLoading(false)
                return
            }

            setProducts(data.data?.products || [])
            setLoading(false)
            setTotal(data.data?.pagination?.total || 0)
            setPages(data.data?.pagination?.pages || 0)
        }   

        getProducts()

        return () => controller.abort()
    },[limit, page, search,category ,refetchTrigger])

    const refetch = () => setRefetchTrigger((prev) => prev + 1)

    return {products, loading, pages, total, refetch}
}

export default useProducts