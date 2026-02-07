import CategoryRepo from '../repositories/category.repository'
import { categoryInput } from '../schemas/categoryValidation.schema'
import { ApiError } from '../utils/apiError'

class CategoryService {
    static async createCategory(data: categoryInput) {
        return await CategoryRepo.create(data)
    }

    static async getCategories() {
        return await CategoryRepo.getAll()
    }

    static async getCategoryById(id: string) {
        const category = await CategoryRepo.findById(id)
        if (!category) throw new ApiError(404, 'Category not found')
        return category
    }

    static async update(id: string, data: categoryInput) {
        return await CategoryRepo.update(id, data)
    }

    static async delete(id: string) {
        return await CategoryRepo.delete(id)
    }
}

export default CategoryService
