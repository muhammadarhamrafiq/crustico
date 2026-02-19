export interface Variant {
    label: string;
    priceModifier: number;
    description?: string;
}

export interface Product {
    id: string
    name: string,
    sku: string,
    slug: string,
    basePrice: string,
    image: string,
    description: string,
    variants: Variant[],
    categories: string[],
    createdAt: string,
    updatedAt?: string | null,
    deletedAt?: string | null,
}

export interface Category {
    name: string,
    description?: string,
    slug: string
}

export type JSONValue = string | number | boolean | JSONObject | JSONArray;
export type JSONArray = JSONValue[];
export type JSONObject = Record<string, JSONValue>;
