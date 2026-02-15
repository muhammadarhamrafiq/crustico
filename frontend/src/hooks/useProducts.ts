import API from '@/utils/api'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

const useProducts = (limit: number = 16) => {
    const [ products, setProducts ] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const controller = new AbortController()

        const getProducts = async () => {
            setLoading(true)
            const data = await API.get("/product").query({ limit: 16 }).send()
            if(!data.success){
                toast.error(data.message || "Error fetching products")
                setLoading(false)
                return
            }

            setProducts(data.data?.products || [])
            setLoading(false)
        }   

        getProducts()

        return () => controller.abort()
    },[limit])

    return {products, loading}
}

export default useProducts