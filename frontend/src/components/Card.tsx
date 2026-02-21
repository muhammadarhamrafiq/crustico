import type { Product } from "@/types";
import { Button } from "@/components/ui/button";
import Confirm from "@/components/Confirm";
import { Link } from "react-router";
import { DeleteIcon, Edit2Icon } from "lucide-react";

interface CardProps {
    product: Product
    editLink?: string
    onEdit?: () => void
    onDelete?: (id: string) => void
}

const Card = ({ product, editLink, onEdit, onDelete }: CardProps) => {
    return (
        <article className="w-full">
            {
                <div className="w-full aspect-square flex items-center justify-center border border-foreground text-center relative">
                    {
                        product.image ? <img src={import.meta.env.VITE_RESOURCE_URL + product.image} alt={product.image} className="w-full h-full object-cover" /> :
                        <span className="text-md">No Image</span>
                    }
                    {(editLink || onEdit || onDelete) && (
                        <div className="absolute top-2 right-2 flex gap-1">
                            {onEdit && (
                                <Button size="icon-sm" variant="secondary" className="cursor-pointer" onClick={onEdit}>
                                    <Edit2Icon className="h-4 w-4" />
                                </Button>
                            )}
                            {!onEdit && editLink && (
                                <Button size="icon-sm" variant="secondary" className="cursor-pointer" asChild>
                                    <Link to={editLink}>
                                        <Edit2Icon className="h-4 w-4" />
                                    </Link>
                                </Button>
                            )}
                            {onDelete && (
                                <Confirm
                                    heading="Delete Product"
                                    message={`Are you sure you want to delete "${product.name}"? This action cannot be undone.`}
                                    onConfirm={() => onDelete(product.id)}
                                >
                                    <Button size="icon-sm" variant="secondary" className="cursor-pointer">
                                        <DeleteIcon className="h-4 w-4" />
                                    </Button>
                                </Confirm>
                            )}
                        </div>
                    )}
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