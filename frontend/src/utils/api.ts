import type { JSONValue } from "@/types";

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
type Params = { [key: string]: string | number | boolean };
type Body = FormData | JSONValue | undefined;

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1";


class API {
    url: string;
    params: Params
    method: Method
    body?: Body
    headers: HeadersInit

    constructor(method: Method) {
        this.url = baseURL;
        this.params = {}
        this.method = method;
        this.headers = {}
    }

    static get(endPoint: string) {
        const instance = new API("GET");
        instance.url += endPoint;
        return instance;
    }

    static post(endPoint: string, data: JSONValue | FormData) {
        const instance = new API("POST");
        instance.url += endPoint;
        instance.body = data;
        return instance;
    }

    static put(endPoint: string, data: JSONValue | FormData) {
        const instance = new API("PUT");
        instance.url += endPoint;
        instance.body = data;
        return instance;
    }

    static patch(endPoint: string, data: JSONValue | FormData) {
        const instance = new API("PATCH");
        instance.url += endPoint;
        instance.body = data;
        return instance;
    }

    static delete(endPoint: string) {
        const instance = new API("DELETE");
        instance.url += endPoint;
        return instance;
    }

    query(params: Params){
        this.params = params;
        return this;
    }

    async send() {
        try {
            const url = new URL(this.url);
            for(const key in this.params){
                url.searchParams.append(key, String(this.params[key]))
            }

            const options: RequestInit = {
                method: this.method,
                headers: this.headers
            }

            if(this.body){
                if(this.body instanceof FormData){
                    options.body = this.body;
                }else{
                    options.body = JSON.stringify(this.body);
                    options.headers = {
                        ...options.headers,
                        'Content-Type': 'application/json'
                    }
                }
            }
            const response = await fetch(url.toString(), options)
            const data = await response.json();
            return data;
        }
        catch {
            return {
                success: false,
                message: "Something went wrong"
            }
        } 
    }
}

export default API;