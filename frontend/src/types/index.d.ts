export interface Variant {
    id?: string;
    label: string;
    priceModifier: number;
    description?: string;
}

export interface Product {
    id: string
    name: string,
    sku: string,
    slug: string,
    basePrice: number,
    image?: string | null,
    description?: string,
    variants: Variant[],
    categories: Category[],
    createdAt: string,
    updatedAt?: string | null,
    deletedAt?: string | null,
}

export interface Category {
    id?: string,
    name: string,
    description?: string,
    slug: string
}

export interface DealItem {
    productId: string,
    productVariantId: string | null,
    quantity: number,
}

export interface Deal {
    id: string,
    name: string,
    slug: string,
    description?: string,
    priceModifier: number,
    startDate: string,
    endDate?: string | null,
    dealItems?: DealItem[],
}

export type JSONValue = string | number | boolean | JSONObject | JSONArray;
export type JSONArray = JSONValue[];
export type JSONObject = Record<string, JSONValue>;
