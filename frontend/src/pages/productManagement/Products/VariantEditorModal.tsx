import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";

import type { Variant } from "@/types";

interface VariantEditorModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    variant: Variant | null;
    onSave: (variant: Variant) => void;
    className?: string;
}

const VariantEditorModal = (props: VariantEditorModalProps) => {
    const { open, onOpenChange, onSave, variant } = props;

    const [label, setLabel] = useState("");
    const [priceModifier, setPriceModifier] = useState("");
    const [description, setDescription] = useState("");
    const [errors, setErrors] = useState({
        label: undefined as string | undefined,
        priceModifier: undefined as string | undefined,
        description: undefined as string | undefined,
    });

    useEffect(() => {
        if (open && variant) {
            setLabel(variant.label || "");
            setPriceModifier(String(variant.priceModifier ?? ""));
            setDescription(variant.description || "");
        }
    }, [open, variant]);

    const validate = () => ({
        label: !label.trim() ? "Variant name is required" : undefined,
        priceModifier:
            priceModifier === ""
                ? "Price modifier is required"
                : isNaN(Number(priceModifier)) || Number(priceModifier) < 0
                    ? "Price modifier must be a positive number"
                    : undefined,
        description:
            description && description.trim().length > 0 && description.trim().length < 10
                ? "Description must be at least 10 characters if provided"
                : undefined,
    });

    const handleSave = () => {
        const validationErrors = validate();
        setErrors(validationErrors);
        if (Object.values(validationErrors).some((e) => e)) return;

        if (!variant?.id) return;

        onSave({
            id: variant.id,
            label: label.trim(),
            priceModifier: Number(priceModifier),
            description: description.trim() ? description.trim() : undefined,
        });

        handleClose(false);
    };

    const handleClose = (nextOpen: boolean) => {
        if (!nextOpen) {
            setLabel("");
            setPriceModifier("");
            setDescription("");
            setErrors({
                label: undefined,
                priceModifier: undefined,
                description: undefined,
            });
        }
        onOpenChange(nextOpen);
    };

    return (
        <div className={`w-full ${props.className || ""}`}>
            {open && (
                <div className="p-4">
                    <div className="flex gap-2 items-center">
                        <Field>
                            <FieldLabel htmlFor="label" className="sr-only">
                                variant label
                            </FieldLabel>
                            <Input
                                id="label"
                                placeholder="Enter label"
                                value={label}
                                onChange={(e) => setLabel(e.target.value)}
                                aria-describedby={errors.label ? "label-error" : undefined}
                            />
                            {errors.label && <FieldError>{errors.label}</FieldError>}
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="priceModifier" className="sr-only">
                                Price Modifier
                            </FieldLabel>
                            <Input
                                id="priceModifier"
                                placeholder="Price Modifier"
                                type="number"
                                value={priceModifier}
                                onChange={(e) => setPriceModifier(e.target.value)}
                                className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                aria-describedby={errors.priceModifier ? "priceModifier-error" : undefined}
                            />
                            {errors.priceModifier && (
                                <FieldError id="priceModifier-error">{errors.priceModifier}</FieldError>
                            )}
                        </Field>
                    </div>
                    <Field>
                        <FieldLabel htmlFor="description" className="sr-only">
                            Variant Description
                        </FieldLabel>
                        <Textarea
                            placeholder="Variant Description (optional)"
                            className="mt-2"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            aria-describedby={errors.description ? "description-error" : undefined}
                        />
                        {errors.description && (
                            <FieldError id="description-error">{errors.description}</FieldError>
                        )}
                    </Field>
                    <div className="flex justify-end mt-2 gap-2">
                        <Button className="hover:cursor-pointer" variant="ghost" onClick={() => handleClose(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave}>Save</Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VariantEditorModal;
