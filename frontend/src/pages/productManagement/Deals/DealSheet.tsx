import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useMemo, useState } from "react";
import { PlusCircleIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import type { Deal, DealItem, Product } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DealSheetProps {
    title: string;
    description?: string;
    mode: "create" | "edit";
    value?: Deal | null;
    products: Product[];
    onSubmit: (data: {
        name: string;
        slug: string;
        description?: string;
        startDate?: string;
        endDate?: string | null;
        priceModifier: number;
        items?: DealItem[];
    }, dealId?: string) => Promise<boolean>;
    onFetchDeal?: (dealId: string) => Promise<Deal | null>;
    onAddItems?: (dealId: string, items: DealItem[]) => Promise<boolean>;
    onRemoveItem?: (dealId: string, item: DealItem) => Promise<boolean>;
    children: React.ReactNode;
}

const formatDateInput = (value?: string | null) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toISOString().split("T")[0];
};

const DealSheet = (props: DealSheetProps) => {
    const { title, description: sheetDescription, mode, value, products, onSubmit, onFetchDeal, onAddItems, onRemoveItem, children } = props;

    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingDeal, setLoadingDeal] = useState(false);

    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [description, setDescription] = useState("");
    const [priceModifier, setPriceModifier] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const [items, setItems] = useState<DealItem[]>([]);
    const [selectedProductId, setSelectedProductId] = useState("");
    const [selectedVariantId, setSelectedVariantId] = useState("none");
    const [quantity, setQuantity] = useState("1");

    const isEdit = mode === "edit";

    const selectedProduct = useMemo(() => {
        return products.find((product) => product.id === selectedProductId);
    }, [products, selectedProductId]);

    useEffect(() => {
        if (!open) return;

        const hydrate = async () => {
            if (isEdit && value?.id && onFetchDeal) {
                setLoadingDeal(true);
                const deal = await onFetchDeal(value.id);
                setLoadingDeal(false);
                if (deal) {
                    setName(deal.name || "");
                    setSlug(deal.slug || "");
                    setDescription(deal.description || "");
                    setPriceModifier(String(deal.priceModifier ?? ""));
                    setStartDate(formatDateInput(deal.startDate));
                    setEndDate(formatDateInput(deal.endDate));
                    setItems(deal.dealItems || []);
                    return;
                }
            }

            if (value) {
                setName(value.name || "");
                setSlug(value.slug || "");
                setDescription(value.description || "");
                setPriceModifier(String(value.priceModifier ?? ""));
                setStartDate(formatDateInput(value.startDate));
                setEndDate(formatDateInput(value.endDate));
                setItems(value.dealItems || []);
            } else {
                const today = new Date().toISOString().split("T")[0];
                setName("");
                setSlug("");
                setDescription("");
                setPriceModifier("0");
                setStartDate(today);
                setEndDate("");
                setItems([]);
            }
        };

        hydrate();
    }, [open, isEdit, value, onFetchDeal]);

    const resetItemFields = () => {
        setSelectedProductId("");
        setSelectedVariantId("none");
        setQuantity("1");
    };

    const findItemLabel = (item: DealItem) => {
        const product = products.find((p) => p.id === item.productId);
        const variant = product?.variants?.find((v) => v.id === item.productVariantId);
        return {
            productName: product?.name || item.productId,
            variantName: variant?.label || "Default",
        };
    };

    const handleAddItem = async () => {
        if (!selectedProductId) {
            toast.error("Select a product");
            return;
        }
        const qty = Number(quantity);
        if (!qty || qty < 1) {
            toast.error("Quantity must be at least 1");
            return;
        }
        const variantId = selectedVariantId === "none" ? null : selectedVariantId;
        const newItem: DealItem = {
            productId: selectedProductId,
            productVariantId: variantId,
            quantity: qty,
        };

        if (items.some((item) => item.productId === newItem.productId && item.productVariantId === newItem.productVariantId)) {
            toast.error("This item is already in the deal");
            return;
        }

        if (isEdit) {
            if (!value?.id || !onAddItems) return;
            const success = await onAddItems(value.id, [newItem]);
            if (!success) return;
            setItems((prev) => [...prev, newItem]);
            resetItemFields();
            return;
        }

        setItems((prev) => [...prev, newItem]);
        resetItemFields();
    };

    const handleRemoveItem = async (item: DealItem) => {
        if (isEdit) {
            if (!value?.id || !onRemoveItem) return;
            const success = await onRemoveItem(value.id, item);
            if (!success) return;
        }
        setItems((prev) =>
            prev.filter((i) => !(i.productId === item.productId && i.productVariantId === item.productVariantId))
        );
    };

    const handleSubmit = async () => {
        if (!name.trim() || name.trim().length < 3) {
            toast.error("Name must contain at least 3 characters");
            return;
        }
        if (!slug.trim() || slug.trim().length < 2) {
            toast.error("Slug must contain at least 2 characters");
            return;
        }
        if (priceModifier === "" || isNaN(Number(priceModifier))) {
            toast.error("Price modifier is required");
            return;
        }
        if (!startDate) {
            toast.error("Start date is required");
            return;
        }
        if (!isEdit && items.length === 0) {
            toast.error("Add at least one item to create a deal");
            return;
        }

        setLoading(true);
        const payload = {
            name: name.trim(),
            slug: slug.trim(),
            description: description.trim() ? description.trim() : undefined,
            startDate,
            endDate: endDate ? endDate : undefined,
            priceModifier: Number(priceModifier),
            items: isEdit ? undefined : items,
        };

        const success = await onSubmit(payload, value?.id);
        setLoading(false);
        if (success) setOpen(false);
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>{children}</SheetTrigger>
            <SheetContent className="overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>{title}</SheetTitle>
                    {sheetDescription && <SheetDescription>{sheetDescription}</SheetDescription>}
                </SheetHeader>

                {loadingDeal && isEdit ? (
                    <div className="py-6 text-sm text-muted-foreground">Loading deal...</div>
                ) : (
                    <div className="grid w-full items-center gap-4 py-4 px-2">
                        <Field>
                            <FieldLabel className="sr-only">name</FieldLabel>
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter deal name"
                                aria-describedby={name.trim().length < 3 ? "name-err" : undefined}
                                aria-invalid={name.trim().length < 3}
                            />
                            {name.trim().length < 3 && <FieldError id="name-err">Name must contain at least 3 characters.</FieldError>}
                        </Field>

                        <Field>
                            <FieldLabel className="sr-only">slug</FieldLabel>
                            <Input
                                value={slug}
                                onChange={(e) => setSlug(e.target.value)}
                                placeholder="Enter slug"
                                aria-describedby={slug.trim().length < 2 ? "slug-err" : undefined}
                                aria-invalid={slug.trim().length < 2}
                            />
                            {slug.trim().length < 2 && <FieldError id="slug-err">Slug must contain at least 2 characters.</FieldError>}
                        </Field>

                        <Field>
                            <FieldLabel className="sr-only">description</FieldLabel>
                            <Textarea
                                className="h-28 resize-none"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Enter description"
                            />
                        </Field>

                        <div className="grid grid-cols-2 gap-2">
                            <Field>
                                <FieldLabel className="sr-only">start date</FieldLabel>
                                <Input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </Field>
                            <Field>
                                <FieldLabel className="sr-only">end date</FieldLabel>
                                <Input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </Field>
                        </div>

                        <Field>
                            <FieldLabel className="sr-only">price modifier</FieldLabel>
                            <Input
                                type="number"
                                value={priceModifier}
                                onChange={(e) => setPriceModifier(e.target.value)}
                                placeholder="Price modifier"
                            />
                        </Field>

                        <div className="border-t border-muted pt-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold">Deal Items</h3>
                                <Button size="sm" className="cursor-pointer" onClick={handleAddItem}>
                                    <PlusCircleIcon className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="mt-3 grid gap-2">
                                <Field>
                                    <FieldLabel className="sr-only">product</FieldLabel>
                                    <Select value={selectedProductId} onValueChange={(p) => {
                                        setSelectedProductId(p);
                                        setSelectedVariantId("none");
                                    }} >
                                        <SelectTrigger >
                                            <SelectValue placeholder="Select product" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {products.map((product) => (
                                            <SelectItem value={product.id} key={product.id}>
                                                {product.name}
                                            </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </Field>

                                <Field>
                                    <FieldLabel className="sr-only">variant</FieldLabel>
                                    <Select value={selectedVariantId} onValueChange={(v) => {
                                        setSelectedVariantId(v);
                                    }} >
                                        <SelectTrigger >
                                            <SelectValue placeholder="Select Variant" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='none'>
                                                Select Variant
                                            </SelectItem>
                                            {selectedProduct?.variants?.map((variant) => (
                                            <SelectItem value={variant.id!} key={variant.id}>
                                                {variant.label}
                                            </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </Field>

                                <Field>
                                    <FieldLabel className="sr-only">quantity</FieldLabel>
                                    <Input
                                        type="number"
                                        min={1}
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        placeholder="Quantity"
                                    />
                                </Field>
                            </div>

                            {items.length > 0 && (
                                <div className="mt-4 space-y-2">
                                    {items.map((item) => {
                                        const label = findItemLabel(item);
                                        return (
                                            <div
                                                key={`${item.productId}-${item.productVariantId || "default"}`}
                                                className="flex items-center justify-between rounded-md border border-muted px-3 py-2 text-sm"
                                            >
                                                <div>
                                                    <p className="font-medium">{label.productName}</p>
                                                    <p className="text-xs text-muted-foreground">{label.variantName} x {item.quantity}</p>
                                                </div>
                                                <Button
                                                    size="icon-sm"
                                                    variant="ghost"
                                                    className="cursor-pointer"
                                                    onClick={() => handleRemoveItem(item)}
                                                >
                                                    <Trash2Icon className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <SheetFooter>
                    <Button className="cursor-pointer" onClick={handleSubmit} disabled={loading}>
                        {isEdit ? "Update Deal" : "Create Deal"}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
};

export default DealSheet;
