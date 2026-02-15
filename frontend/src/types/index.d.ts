export interface Variant {
    label: string;
    priceModifier: number;
    description?: string;
}

export type JSONValue = string | number | boolean | JSONObject | JSONArray;
export type JSONArray = JSONValue[];
export interface JSONObject {
    [key: string]: JSONValue;
}
