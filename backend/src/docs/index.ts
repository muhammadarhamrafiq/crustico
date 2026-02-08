import registerProductPaths from './product.docs'
import registerCategoryPaths from './category.docs'
import registerDealPaths from './deals.docs'

const registerPaths = () => {
    registerProductPaths()
    registerCategoryPaths()
    registerDealPaths()
}
export default registerPaths
