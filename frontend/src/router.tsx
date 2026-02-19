import { createBrowserRouter } from "react-router";
import Home from "./pages/Home";
import { Category, CreateProduct, ProductManagement, Products } from "./pages/productManagement";

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
                element: <Category />,
            },
            {
                path: "deals",
                element: <div>Deals</div>,
            }
        ]   
    }
])