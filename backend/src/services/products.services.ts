import ProductRepo from '../repositories/product.repository'
import type { createProductInput } from '../schemas/productValidation.schemas'

class ProductService {
    static async createProduct(productData: createProductInput) {
        return await ProductRepo.createProduct(productData)
    }
}

export default ProductService
