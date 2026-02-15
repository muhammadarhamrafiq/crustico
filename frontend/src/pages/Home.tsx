import Layout from "@/components/Layout"
import { Link } from "react-router"

const Home = () => {
    return (
        <Layout>
                <h1 className="text-2xl font-bold">Crustico</h1>
                <p>
                    A comprehensive platform designed for firm management, currently focused underdevelopment. The platform offers a range of features to streamline operations, enhance productivity, and provide valuable insights for businesses. With a user-friendly interface and robust functionality, Crustico aims to be the go-to solution for firms looking to optimize their management processes.
                </p>
                <h2 className="mt-4 text-md font-bold">Product Management</h2>
                <ul className="px-8 border-l-2 border-accent">
                    <li><Link to={'product-management/products'}>Products</Link></li>
                    <li><Link to={'product-management/categories'}>Categories</Link></li>
                    <li><Link to={'product-management/deals'}>Deals</Link></li>
                </ul>
        </Layout>
    )
}

export default Home