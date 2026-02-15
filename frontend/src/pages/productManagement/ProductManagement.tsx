import Layout from "@/components/Layout";
import { ChevronRight } from "lucide-react";
import { Outlet, useLocation, Link } from "react-router";

interface Breadcrumb {
    name: string;
    path: string;
}

const breadcrumbMap: Record<string, string> = {
    'product-management': 'Product Management',
    'products': 'Products',
    'categories': 'Categories',
    'deals': 'Deals'
};

const ProductManagement = () => {
    const location = useLocation();
    
    const generateBreadcrumbs = () => {
        const paths = location.pathname.split('/').filter(Boolean);
        const breadcrumbs: Array<Breadcrumb> = [];
        
        let currentPath = '';
        paths.forEach((path) => {
            currentPath += `/${path}`;
            const name = breadcrumbMap[path] || 
                path.split('-')
                    .map(word => word.charAt(0).toUpperCase().replace('-', ' ') + word.slice(1))
                    .join(' ');
            
            breadcrumbs.push({
                name,
                path: currentPath
            });
        });

        return breadcrumbs.slice(0, 3);
    };
    
    const breadcrumbs = generateBreadcrumbs();

    return (
        <Layout>
            {/* Breadcrumb Navigation */}
            <nav aria-label="Breadcrumb" className="flex items-center text-sm py-1">
                {breadcrumbs.map((crumb, index) => (
                    <div key={crumb.path} className="flex items-center">
                        <Link to={crumb.path} className="hover:underline">
                            {crumb.name}
                        </Link>
                        {
                            index < breadcrumbs.length - 1 && (
                                <ChevronRight className="mx-2 text-gray-400" size={16} />
                            )
                        }
                    </div>
                ))}
            </nav>
            <div>
                <Outlet />
            </div>
        </Layout>
    );
};

export default ProductManagement;