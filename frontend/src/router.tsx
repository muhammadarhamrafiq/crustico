import { createBrowserRouter } from "react-router";
import Home from "./pages/Home";
import { CreateProduct, ProductManagement, Products } from "./pages/productManagement";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Home />
    },
    {
        path: "/product-management/*",
        element: <ProductManagement />,
        children: [
            {
                path: "products/",
                children: [
                    {
                        index: true,
                        element: <Products />
                    },
                    {
                        path: "create-product",
                        element: <CreateProduct />
                    }
                ]
            },
            {
                path: "categories",
                element: <div>Categories</div>,
            },
            {
                path: "deals",
                element: <div>Deals</div>,
            }
        ]   
    }
])