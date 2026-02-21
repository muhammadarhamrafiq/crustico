import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DeleteIcon, Edit2Icon, PlusCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Confirm from "@/components/Confirm";
import API from "@/utils/api";
import DealSheet from "./DealSheet";

import type { Deal, DealItem, Product } from "@/types";

const Deals = () => {
    const [deals, setDeals] = useState<Deal[]>([]);
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState<Product[]>([]);
    const [productsLoading, setProductsLoading] = useState(true);
    const [refetchTrigger, setRefetchTrigger] = useState(0);

    useEffect(() => {
        const fetchDeals = async () => {
            setLoading(true);
            const res = await API.get("/deals").send();
            if (!res.success) {
                toast.error(res.message || "Failed to fetch deals");
                setLoading(false);
                return;
            }
            setDeals(res.data || []);
            setLoading(false);
        };

        fetchDeals();
    }, [refetchTrigger]);

    useEffect(() => {
        const fetchProducts = async () => {
            setProductsLoading(true);
            const res = await API.get("/product").query({ page: 1, limit: 200 }).send();
            if (!res.success) {
                toast.error(res.message || "Failed to fetch products");
                setProductsLoading(false);
                return;
            }
            setProducts(res.data?.products || []);
            setProductsLoading(false);
        };

        fetchProducts();
    }, []);

    const refetch = () => setRefetchTrigger((prev) => prev + 1);

    const handleCreate = async (data: {
        name: string;
        slug: string;
        description?: string;
        startDate?: string;
        endDate?: string | null;
        priceModifier: number;
        items?: DealItem[];
    }) => {
        const res = await API.post("/deals/add", data).send();
        if (!res.success) {
            toast.error(res.message || "Failed to create deal");
            return false;
        }
        toast.message(res.message || "Deal created");
        refetch();
        return true;
    };

    const handleUpdate = async (data: {
        name: string;
        slug: string;
        description?: string;
        startDate?: string;
        endDate?: string | null;
        priceModifier: number;
    }, dealId?: string) => {
        if (!dealId) return false;
        const res = await API.patch(`/deals/${dealId}/update`, data).send();
        if (!res.success) {
            toast.error(res.message || "Failed to update deal");
            return false;
        }
        toast.message(res.message || "Deal updated");
        refetch();
        return true;
    };

    const handleDelete = async (dealId: string) => {
        const res = await API.delete(`/deals/${dealId}`).send();
        if (!res.success) {
            toast.error(res.message || "Failed to delete deal");
            return;
        }
        toast.message(res.message || "Deal deleted");
        refetch();
    };

    const handleFetchDeal = async (dealId: string) => {
        const res = await API.get(`/deals/${dealId}`).send();
        if (!res.success) {
            toast.error(res.message || "Failed to fetch deal");
            return null;
        }
        return res.data as Deal;
    };

    const handleAddItems = async (dealId: string, items: DealItem[]) => {
        const res = await API.patch(`/deals/${dealId}/add-items`, { items }).send();
        if (!res.success) {
            toast.error(res.message || "Failed to add deal items");
            return false;
        }
        toast.message(res.message || "Items added");
        refetch();
        return true;
    };

    const handleRemoveItem = async (dealId: string, item: DealItem) => {
        const res = await API.delete(`/deals/${dealId}/remove-item`)
            .query({
                productId: item.productId,
                productVariantId: item.productVariantId || "",
                confirmed: true,
            })
            .send();
        if (!res.success) {
            toast.error(res.message || "Failed to remove deal item");
            return false;
        }
        toast.message(res.message || "Item removed");
        refetch();
        return true;
    };

    if (loading || productsLoading) {
        return (
            <div className="flex flex-col items-center justify-center gap-2 mt-10">
                <p className="text-muted-foreground">Loading deals...</p>
            </div>
        );
    }

    return (
        <>
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold mb-4">Deals</h1>
                </div>
                <div className="flex items-center gap-2">
                    <DealSheet
                        mode="create"
                        title="Create Deal"
                        description="Fill the following details to create a new deal"
                        products={products}
                        onSubmit={handleCreate}
                    >
                        <Button className="cursor-pointer">
                            <PlusCircle />
                        </Button>
                    </DealSheet>
                </div>
            </div>

            {deals.length > 0 ? (
                <div className="rounded-lg border border-muted overflow-hidden mt-2">
                    <Table className="bg-background w-full">
                        <TableHeader>
                            <TableRow className="bg-muted/50 hover:bg-muted/50">
                                <TableHead className="w-40">Name</TableHead>
                                <TableHead className="w-40">Slug</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="w-28 text-right">Price</TableHead>
                                <TableHead className="w-32 text-right" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {deals.map((deal) => (
                                <TableRow key={deal.id} className="transition-colors hover:bg-muted/40">
                                    <TableCell className="font-medium">{deal.name}</TableCell>
                                    <TableCell className="text-muted-foreground">{deal.slug}</TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {deal.description || "No description"}
                                    </TableCell>
                                    <TableCell className="text-right">{deal.priceModifier}$</TableCell>
                                    <TableCell>
                                        <div className="flex justify-end gap-1">
                                            <DealSheet
                                                mode="edit"
                                                title="Edit Deal"
                                                description="Update deal details and items"
                                                value={deal}
                                                products={products}
                                                onSubmit={handleUpdate}
                                                onFetchDeal={handleFetchDeal}
                                                onAddItems={handleAddItems}
                                                onRemoveItem={handleRemoveItem}
                                            >
                                                <Button size="icon-sm" variant="ghost" className="cursor-pointer">
                                                    <Edit2Icon className="h-4 w-4" />
                                                </Button>
                                            </DealSheet>

                                            <Confirm
                                                heading="Delete Deal"
                                                message={`Are you sure you want to delete "${deal.name}"? This action cannot be undone.`}
                                                onConfirm={() => handleDelete(deal.id)}
                                            >
                                                <Button size="icon-sm" variant="ghost" className="cursor-pointer">
                                                    <DeleteIcon className="h-4 w-4" />
                                                </Button>
                                            </Confirm>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center gap-2 mt-10">
                    <p className="text-muted-foreground">No deals found</p>
                </div>
            )}
        </>
    );
};

export default Deals;
