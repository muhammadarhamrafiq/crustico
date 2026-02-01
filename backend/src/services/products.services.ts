import ProductRepo from '../repositories/product.repository'
import type { createProductInput, updateProductInput } from '../schemas/productValidation.schemas'
import { removeUndefined } from '../utils/removeUndefined'

class ProductService {
    static async createProduct(productData: createProductInput) {
        return await ProductRepo.createProduct(productData)
    }

    static async updateProduct(id: string, productData: updateProductInput) {
        const cleaned = removeUndefined(productData)
        return await ProductRepo.updateProduct(id, cleaned)
    }
}

export default ProductService
