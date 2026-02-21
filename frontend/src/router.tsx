import { createBrowserRouter } from "react-router";
import Home from "./pages/Home";
import { Category, ProductManagement, Products, Deals } from "./pages/productManagement";

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
                element: <Products />,
            },
            {
                path: "categories",
                element: <Category />,
            },
            {
                path: "deals",
                element: <Deals />,
            }
        ]   
    }
])