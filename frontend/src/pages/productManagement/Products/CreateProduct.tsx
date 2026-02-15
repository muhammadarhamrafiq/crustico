import { Field, FieldError } from "@/components/ui/field";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import ImageUploader from "@/components/ImageUploader";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { DeleteIcon, PlusCircleIcon } from "lucide-react";
import VariantModal from "./VariantModal";

import type { Variant } from "@/types";
import { toast } from "sonner";
import API from "@/utils/api";
import { useNavigate } from "react-router";

const CreateProduct = () => {
  const navigate = useNavigate();

  const [image, setImage] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [slug, setSlug] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [variants, setVariants] = useState<Variant[]>([]);

  // Track whether the user has interacted with each field
  const [interacted, setInteracted] = useState({
    name: false,
    sku: false,
    slug: false,
    basePrice: false,
    description: false,
  });

  // Track field errors
  const [errors, setErrors] = useState({
    name: undefined as string | undefined,
    sku: undefined as string | undefined,
    slug: undefined as string | undefined,
    basePrice: undefined as string | undefined,
    description: undefined as string | undefined,
  });

  const onlyAlphanumeric = (str: string) => str.replace(/[^a-zA-Z0-9-]/g, "");

  // Validate a single field
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
        if (isNaN(Number(value)) || Number(value) < 0) return "Base price must be a non-negative number";
        return undefined;
      case "description":
        if (value && value.trim().length > 0 && value.trim().length < 10)
          return "Description must contain at least 10 characters";
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

  const addVariant = (variant: Variant) => {
    if(variants.some(v => v.label.toLowerCase() === variant.label.toLowerCase())){
      toast.error("Variant with this name already exists");
      return;
    }
    setVariants((prev) => [...prev, variant]);
  }

  const deleteVariant = (label: string) => {
    setVariants(prev => prev.filter(v => v.label !== label))
  }

  // Handle submit
  const handleSubmit = async () => {
    // Mark all fields as interacted for error display
    setInteracted({
      name: true,
      sku: true,
      slug: true,
      basePrice: true,
      description: true,
    });

    if (!validateAll()) return;

    setLoading(true);

    // if has image upload it first
    let imageUrl = ""
    if(image){
      const formData = new FormData();
      formData.append("image", image);
      const response = await API.post("/product/upload-image", formData).send();
      if(!response.success){
        toast.error(response.message);
        setLoading(false);
        return;
      }
      imageUrl = response.data.url;
    }

    // then create product with image url
    const product = {
      name: name.trim(),
      sku: sku.trim(),
      slug: slug.trim(),
      basePrice: Number(basePrice),
      description: description.trim(),
      image: imageUrl,
      variants
    }
    const response = await API.post("/product/add", product).send();
    if(!response.success){
      toast.error(response.message);
      setLoading(false);
      return;
    }

    toast.success("Product created successfully");
    navigate("/product-management/products")
    return
  };

  return (
    <>
      <h1 className="text-xl font-bold">Create New Product</h1>
      <div className="w-80 mx-auto flex flex-col items-center gap-y-4">
        <ImageUploader
          name="product-image"
          value={image}
          onChange={(file: File) => setImage(file)}
        />

        {/* Row 1: Name & SKU */}
        <div className="w-full flex gap-2">
          <Field aria-label="Name" className="w-full">
            <Input
              id="name"
              placeholder="Enter product name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => {
                setInteracted((prev) => ({ ...prev, name: true }));
                setErrors((prev) => ({ ...prev, name: validateField("name", name) }));
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
                setInteracted((prev) => ({ ...prev, sku: true }))
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

        {/* Row 2: Slug & Base Price */}
        <div className="w-full flex gap-2">
          <Field aria-label="Slug" className="w-full">
            <Input
              id="slug"
              placeholder="Enter slug"
              value={slug}
              onChange={(e) => setSlug(onlyAlphanumeric(e.target.value).toLowerCase())}
              onBlur={() => {
                setInteracted((prev) => ({ ...prev, slug: true }))
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
                setInteracted((prev) => ({ ...prev, basePrice: true }))
                setErrors((prev) => ({...prev, basePrice: validateField("basePrice", basePrice) }));
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

        {/* Description */}
        <Field aria-label="Description" className="w-full">
          <Textarea
            id="description"
            name="description"
            placeholder="Enter description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={() => {
                setInteracted((prev) => ({ ...prev, description: true }))
                setErrors((prev) => ({...prev, description: validateField("description", description) }))
            }}
            className="resize-none h-40 no-scrollbar"
          />
          {interacted.description && errors.description && (
            <FieldError id="description-error" role="alert">
              {errors.description}
            </FieldError>
          )}
        </Field>

        {/* Add variants Component */}
        <div className="flex items-center justify-between w-full">
            <h2 className="text-lg font-medium">Variants</h2>
            <Button className="cursor-pointer" size="sm" onClick={() => setShowVariantModal(true)}><PlusCircleIcon/></Button>
        </div>
        <VariantModal className='border-b border-foreground' open={showVariantModal} onOpenChange={setShowVariantModal} onAdd={addVariant}/>
        {
          variants.length > 0 && variants.map((variant) => (
            <article className="w-full bg-accent p-4 rounded-md" key={variant.label}>
              <div className="flex justify-between">
                <p><span className="text-lg font-bold capitalize">{variant.label}</span> +{variant.priceModifier}$</p>
                <Button className="cursor-pointer" variant='ghost' onClick={()=>deleteVariant(variant.label)} ><DeleteIcon/></Button>
              </div>
              <p>{variant.description}</p>
            </article>
          ))
        }
        <Button
          className="w-full cursor-pointer"
          disabled={loading}
          onClick={handleSubmit}
        >
          Create Product
        </Button>
      </div>
    </>
  );
};

export default CreateProduct;
