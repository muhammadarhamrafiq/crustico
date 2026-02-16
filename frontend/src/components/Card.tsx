import type { Product } from "@/types";

interface CardProps {
    product: Product
}

const Card = ({ product }: CardProps) => {
    return (
        <article className="w-full cursor-pointer">
            {
                <div className="w-full aspect-8/9 flex items-center justify-center border border-foreground text-center">
                    {
                        product.image ? <img src={import.meta.env.VITE_RESOURCE_URL + product.image} alt={product.image} className="w-full h-full object-cover" /> :
                        <span className="text-md">No Image</span>
                    }
                </div>
            }
            <div className="flex items-center justify-between mt-2">
                <h3 className="text-lg capitalize font-semibold">{product.name}</h3>
                <p>{product.basePrice}$</p>
            </div>
            <p className="text-sm">{product.description ? product.description.substring(0, 30) + "..."  : 'NO DESCRIPTION AVAILABLE'}</p>
            <div className="w-full flex flex-wrap gap-1 mt-2">
                {
                    product.variants?.map(v => (
                        <span className="bg-foreground px-2 py-1 rounded text-background text-xs" key={v.label} >{v.label}</span>
                    ))
                }
            </div>
        </article>
    )
}

export default Card;