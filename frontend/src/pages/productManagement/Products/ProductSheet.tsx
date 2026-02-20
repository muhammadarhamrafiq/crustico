import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Field, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useMemo, useState } from "react";
import { DeleteIcon, Edit2Icon, PlusCircleIcon } from "lucide-react";
import ImageUploader from "@/components/ImageUploader";
import VariantModal from "./VariantModal";
import VariantEditorModal from "./VariantEditorModal";
import Confirm from "@/components/Confirm";
import { toast } from "sonner";

import type { Category, Product, Variant } from "@/types";
import CategorySelector from "./CategorySelector";

interface ProductSheetPayload {
    name: string;
    sku: string;
    slug: string;
    basePrice: number;
    description?: string;
    image?: File | null;
    variants?: Variant[];
    categoryIds?: string[];
}

interface ProductSheetProps {
    title: string;
    description?: string;
    mode: "create" | "edit";
    value?: Product | null;
    categories: Category[];
    onSubmit: (data: ProductSheetPayload, productId?: string) => Promise<boolean>;
    onFetchProduct?: (productId: string) => Promise<Product | null>;
    onAddVariant?: (productId: string, variant: Variant) => Promise<Variant[] | null>;
    onUpdateVariant?: (variant: Variant) => Promise<boolean>;
    onDeleteVariant?: (variantId: string) => Promise<boolean>;
    onAddCategory?: (productId: string, categoryId: string) => Promise<Category[] | null>;
    onRemoveCategory?: (productId: string, categoryId: string) => Promise<Category[] | null>;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children?: React.ReactNode;
}

const ProductSheet = (props: ProductSheetProps) => {
    const {
        title,
        description: sheetDescription,
        mode,
        value,
        categories,
        onSubmit,
        onFetchProduct,
        onAddVariant,
        onUpdateVariant,
        onDeleteVariant,
        onAddCategory,
        onRemoveCategory,
        open,
        onOpenChange,
        children,
    } = props;

    const isEdit = mode === "edit";
    const isControlled = typeof open === "boolean";

    const [localOpen, setLocalOpen] = useState(false);
    const sheetOpen = isControlled ? open : localOpen;
    const setSheetOpen = isControlled ? onOpenChange || (() => {}) : setLocalOpen;

    const [image, setImage] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [name, setName] = useState("");
    const [sku, setSku] = useState("");
    const [slug, setSlug] = useState("");
    const [basePrice, setBasePrice] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [loadingProduct, setLoadingProduct] = useState(false);
    const [showVariantModal, setShowVariantModal] = useState(false);
    const [variants, setVariants] = useState<Variant[]>([]);
    const [editingVariant, setEditingVariant] = useState<Variant | null>(null);
    const [productCategories, setProductCategories] = useState<Category[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState("");

    const [interacted, setInteracted] = useState({
        name: false,
        sku: false,
        slug: false,
        basePrice: false,
        description: false,
    });

    const [errors, setErrors] = useState({
        name: undefined as string | undefined,
        sku: undefined as string | undefined,
        slug: undefined as string | undefined,
        basePrice: undefined as string | undefined,
        description: undefined as string | undefined,
    });

    const previewUrl = useMemo(() => {
        return imageUrl ? `${import.meta.env.VITE_RESOURCE_URL}${imageUrl}` : null;
    }, [imageUrl]);

    const onlyAlphanumeric = (str: string) => str.replace(/[^a-zA-Z0-9-]/g, "");

    const validateField = (field: string, value: string) => {
        switch (field) {
            case "name":
                if (!value.trim()) return "Name is required";
                if (value.trim().length < 3) return "Name must contain at least 3 characters";
                return undefined;
            case "sku":
                if (!value.trim()) return "SKU is required";
                if (value.trim().length < 6) return "SKU must contain at least 6 characters";
                return undefined;
            case "slug":
                if (!value.trim()) return "Slug is required";
                if (value.trim().length < 2) return "Slug must contain at least 2 characters";
                return undefined;
            case "basePrice":
                if (value === "") return "Base price is required";
                if (isNaN(Number(value)) || Number(value) < 0) {
                    return "Base price must be a non-negative number";
                }
                return undefined;
            case "description":
                if (value && value.trim().length > 0 && value.trim().length < 10) {
                    return "Description must contain at least 10 characters";
                }
                return undefined;
            default:
                return undefined;
        }
    };

    const validateAll = () => {
        const newErrors = {
            name: validateField("name", name),
            sku: validateField("sku", sku),
            slug: validateField("slug", slug),
            basePrice: validateField("basePrice", basePrice),
            description: validateField("description", description),
        };
        setErrors(newErrors);
        return Object.values(newErrors).every((e) => !e);
    };

    useEffect(() => {
        if (!sheetOpen) return;

        const hydrate = async () => {
            if (isEdit && value?.id && onFetchProduct) {
                setLoadingProduct(true);
                const product = await onFetchProduct(value.id);
                setLoadingProduct(false);
                if (product) {
                    setName(product.name || "");
                    setSku(product.sku || "");
                    setSlug(product.slug || "");
                    setBasePrice(String(product.basePrice ?? ""));
                    setDescription(product.description || "");
                    setImageUrl(product.image || null);
                    setVariants(product.variants || []);
                    setProductCategories(product.categories || []);
                    setImage(null);
                    return;
                }
            }

            if (value) {
                setName(value.name || "");
                setSku(value.sku || "");
                setSlug(value.slug || "");
                setBasePrice(String(value.basePrice ?? ""));
                setDescription(value.description || "");
                setImageUrl(value.image || null);
                setVariants(value.variants || []);
                setProductCategories(value.categories || []);
                setImage(null);
            } else {
                setName("");
                setSku("");
                setSlug("");
                setBasePrice("");
                setDescription("");
                setImageUrl(null);
                setVariants([]);
                setProductCategories([]);
                setImage(null);
            }
            setEditingVariant(null);
            setShowVariantModal(false);
            setSelectedCategoryId("");
        };

        hydrate();
    }, [sheetOpen, isEdit, value, onFetchProduct]);

    const addVariant = async (variant: Variant) => {
        if (variants.some((v) => v.label.toLowerCase() === variant.label.toLowerCase())) {
            toast.error("Variant with this name already exists");
            return;
        }

        if (isEdit) {
            if (!value?.id || !onAddVariant) return;
            const updated = await onAddVariant(value.id, variant);
            if (updated) {
                setVariants(updated);
            } else {
                setVariants((prev) => [...prev, variant]);
            }
            return;
        }

        setVariants((prev) => [...prev, variant]);
    };

    const updateVariant = async (variant: Variant) => {
        if (!isEdit || !onUpdateVariant || !variant.id) return;
        const success = await onUpdateVariant(variant);
        if (!success) return;
        setVariants((prev) => prev.map((v) => (v.id === variant.id ? { ...v, ...variant } : v)));
    };

    const deleteVariant = async (variantId?: string) => {
        if (!variantId) return;
        if (isEdit && onDeleteVariant) {
            const success = await onDeleteVariant(variantId);
            if (!success) return;
        }
        setVariants((prev) => prev.filter((v) => v.id !== variantId && v.label !== variantId));
    };

    const handleAddCategory = async () => {
        if (!selectedCategoryId) {
            toast.error("Select a category");
            return;
        }
        if (productCategories.some((cat) => cat.id === selectedCategoryId)) {
            toast.error("Category already added");
            return;
        }
        const selected = categories.find((cat) => cat.id === selectedCategoryId);
        if (!selected) {
            toast.error("Category not found");
            return;
        }

        if (isEdit) {
            if (!value?.id || !onAddCategory) return;
            const updated = await onAddCategory(value.id, selectedCategoryId);
            if (updated) {
                setProductCategories(updated);
            } else {
                setProductCategories((prev) => [...prev, selected]);
            }
            return;
        }

        setProductCategories((prev) => [...prev, selected]);
        setSelectedCategoryId("")
    };

    const handleRemoveCategory = async (categoryId?: string) => {
        if (!categoryId) return;
        if (isEdit) {
            if (!value?.id || !onRemoveCategory) return;
            const updated = await onRemoveCategory(value.id, categoryId);
            if (updated) {
                setProductCategories(updated);
                return;
            }
        }
        setProductCategories((prev) => prev.filter((cat) => cat.id !== categoryId));
    };

    const handleSubmit = async () => {
        setInteracted({
            name: true,
            sku: true,
            slug: true,
            basePrice: true,
            description: true,
        });

        if (!validateAll()) return;

        setLoading(true);
        const payload: ProductSheetPayload = {
            name: name.trim(),
            sku: sku.trim(),
            slug: slug.trim(),
            basePrice: Number(basePrice),
            description: description.trim() ? description.trim() : undefined,
            image,
            variants: isEdit ? undefined : variants,
            categoryIds: isEdit ? undefined : productCategories.map((cat) => cat.id || "").filter(Boolean),
        };

        const success = await onSubmit(payload, value?.id);
        setLoading(false);
        if (success) setSheetOpen(false);
    };

    return (
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            {children && <SheetTrigger asChild>{children}</SheetTrigger>}
            <SheetContent className="overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>{title}</SheetTitle>
                    {sheetDescription && <SheetDescription>{sheetDescription}</SheetDescription>}
                </SheetHeader>

                {loadingProduct && isEdit ? (
                    <div className="py-6 text-sm text-muted-foreground">Loading product...</div>
                ) : (
                    <div className="grid w-full items-center gap-4 py-4 px-2">
                        <ImageUploader
                            name="product-image"
                            value={image}
                            previewUrl={previewUrl}
                            onChange={(file: File) => setImage(file)}
                        />

                        <div className="w-full flex gap-2">
                            <Field aria-label="Name" className="w-full">
                                <Input
                                    id="name"
                                    placeholder="Enter product name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    onBlur={() => {
                                        setInteracted((prev) => ({ ...prev, name: true }));
                                        setErrors((prev) => ({
                                            ...prev,
                                            name: validateField("name", name),
                                        }));
                                    }}
                                    minLength={3}
                                    aria-invalid={!!(errors.name && interacted.name)}
                                    aria-describedby={errors.name && interacted.name ? "name-error" : undefined}
                                    required
                                />
                                {interacted.name && errors.name && (
                                    <FieldError id="name-error" role="alert">
                                        {errors.name}
                                    </FieldError>
                                )}
                            </Field>

                            <Field aria-label="SKU" className="w-full">
                                <Input
                                    id="sku"
                                    placeholder="Enter product SKU"
                                    value={sku}
                                    onChange={(e) => setSku(onlyAlphanumeric(e.target.value).toUpperCase())}
                                    onBlur={() => {
                                        setInteracted((prev) => ({ ...prev, sku: true }));
                                        setErrors((prev) => ({ ...prev, sku: validateField("sku", sku) }));
                                    }}
                                    minLength={6}
                                    aria-invalid={!!(errors.sku && interacted.sku)}
                                    aria-describedby={errors.sku && interacted.sku ? "sku-error" : undefined}
                                    required
                                />
                                {interacted.sku && errors.sku && (
                                    <FieldError id="sku-error" role="alert">
                                        {errors.sku}
                                    </FieldError>
                                )}
                            </Field>
                        </div>

                        <div className="w-full flex gap-2">
                            <Field aria-label="Slug" className="w-full">
                                <Input
                                    id="slug"
                                    placeholder="Enter slug"
                                    value={slug}
                                    onChange={(e) => setSlug(onlyAlphanumeric(e.target.value).toLowerCase())}
                                    onBlur={() => {
                                        setInteracted((prev) => ({ ...prev, slug: true }));
                                        setErrors((prev) => ({ ...prev, slug: validateField("slug", slug) }));
                                    }}
                                    minLength={2}
                                    aria-invalid={!!(errors.slug && interacted.slug)}
                                    aria-describedby={errors.slug && interacted.slug ? "slug-error" : undefined}
                                    required
                                />
                                {interacted.slug && errors.slug && (
                                    <FieldError id="slug-error" role="alert">
                                        {errors.slug}
                                    </FieldError>
                                )}
                            </Field>

                            <Field aria-label="Base Price" className="w-full">
                                <Input
                                    id="basePrice"
                                    type="number"
                                    placeholder="Enter base price"
                                    value={basePrice}
                                    onChange={(e) => setBasePrice(e.target.value)}
                                    onBlur={() => {
                                        setInteracted((prev) => ({ ...prev, basePrice: true }));
                                        setErrors((prev) => ({
                                            ...prev,
                                            basePrice: validateField("basePrice", basePrice),
                                        }));
                                    }}
                                    min={0}
                                    className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                    aria-invalid={!!(errors.basePrice && interacted.basePrice)}
                                    aria-describedby={errors.basePrice && interacted.basePrice ? "basePrice-error" : undefined}
                                    required
                                />
                                {interacted.basePrice && errors.basePrice && (
                                    <FieldError id="basePrice-error" role="alert">
                                        {errors.basePrice}
                                    </FieldError>
                                )}
                            </Field>
                        </div>

                        <Field aria-label="Description" className="w-full">
                            <Textarea
                                id="description"
                                name="description"
                                placeholder="Enter description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                onBlur={() => {
                                    setInteracted((prev) => ({ ...prev, description: true }));
                                    setErrors((prev) => ({
                                        ...prev,
                                        description: validateField("description", description),
                                    }));
                                }}
                                className="resize-none h-32 no-scrollbar"
                            />
                            {interacted.description && errors.description && (
                                <FieldError id="description-error" role="alert">
                                    {errors.description}
                                </FieldError>
                            )}
                        </Field>

                        <div className="border-t border-muted pt-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-sm font-medium">Categories</h2>
                                <Button size={'icon-sm'} onClick={() => handleAddCategory()}>
                                    <PlusCircleIcon />
                                </Button>
                            </div>
                            <div className="mt-3 grid gap-2">
                                <CategorySelector value={selectedCategoryId} onSelect={(id) => setSelectedCategoryId(id)} />
                                {productCategories.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {productCategories.map((category) => (
                                            <div
                                                key={category.id || category.slug}
                                                className="flex items-center gap-1 rounded-full border border-muted px-3 py-1 text-xs"
                                            >
                                                <span>{category.name}</span>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-5 w-5 cursor-pointer"
                                                    onClick={() => handleRemoveCategory(category.id)}
                                                >
                                                    <DeleteIcon className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-between w-full">
                            <h2 className="text-sm font-medium">Variants</h2>
                            <Button
                                className="cursor-pointer"
                                size="sm"
                                onClick={() => setShowVariantModal(true)}
                            >
                                <PlusCircleIcon className="h-4 w-4" />
                            </Button>
                        </div>
                        <VariantModal
                            className="border-b border-foreground"
                            open={showVariantModal}
                            onOpenChange={setShowVariantModal}
                            onAdd={addVariant}
                        />
                        <VariantEditorModal
                            open={!!editingVariant}
                            onOpenChange={(nextOpen) => {
                                if (!nextOpen) setEditingVariant(null);
                            }}
                            variant={editingVariant}
                            onSave={updateVariant}
                        />
                        {variants.length > 0 &&
                            variants.map((variant) => (
                                <article
                                    className="w-full bg-accent p-4 rounded-md"
                                    key={variant.id || variant.label}
                                >
                                    <div className="flex justify-between">
                                        <p>
                                            <span className="text-lg font-bold capitalize">
                                                {variant.label}
                                            </span>{" "}
                                            +{variant.priceModifier}$
                                        </p>
                                        <div className="flex items-center gap-1">
                                            {isEdit && (
                                                <Button
                                                    className="cursor-pointer"
                                                    variant="ghost"
                                                    onClick={() => setEditingVariant(variant)}
                                                >
                                                    <Edit2Icon className="h-4 w-4" />
                                                </Button>
                                            )}
                                            <Confirm
                                                heading="Delete Variant"
                                                message={`Are you sure you want to delete "${variant.label}"? This action cannot be undone.`}
                                                onConfirm={() => deleteVariant(variant.id || variant.label)}
                                            >
                                                <Button className="cursor-pointer" variant="ghost">
                                                    <DeleteIcon />
                                                </Button>
                                            </Confirm>
                                        </div>
                                    </div>
                                    <p>{variant.description}</p>
                                </article>
                            ))}
                    </div>
                )}

                <SheetFooter>
                    <Button className="cursor-pointer" onClick={handleSubmit} disabled={loading}>
                        {isEdit ? "Update Product" : "Create Product"}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
};

export default ProductSheet;
