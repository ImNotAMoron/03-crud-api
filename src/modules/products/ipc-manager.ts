import type {CreateProduct, Product} from "./product.js";
import {ProductManager} from "./manager.js";

export type IpcRequest = {
    reqId: string;
    type: 'ADD_PRODUCT' | 'GET_PRODUCT' | 'HAS_PRODUCT' | 'GET_ALL_PRODUCTS' | 'SET_PRODUCT' | 'DELETE_PRODUCT';
    payload?: unknown;
};

export type IpcResponse = {
    reqId: string;
    result: unknown;
};

export class IpcProductManager extends ProductManager {
    private send<T>(type: IpcRequest['type'], payload?: unknown): Promise<T> {
        return new Promise((resolve) => {
            const reqId = crypto.randomUUID();
            const handler = (msg: IpcResponse) => {
                if (msg.reqId === reqId) {
                    process.off('message', handler);
                    resolve(msg.result as T);
                }
            };
            process.on('message', handler);
            process.send!({ reqId, type, payload } satisfies IpcRequest);
        });
    }

    async addProduct(product: Product): Promise<Product> {
        return this.send<Product>('ADD_PRODUCT', product);
    }

    async getProduct(id: string): Promise<Product | undefined> {
        return this.send<Product | undefined>('GET_PRODUCT', id);
    }

    async hasProduct(id: string): Promise<boolean> {
        return this.send<boolean>('HAS_PRODUCT', id);
    }

    async getAllProducts(): Promise<Product[]> {
        return this.send<Product[]>('GET_ALL_PRODUCTS');
    }

    async setProduct(id: string, product: CreateProduct): Promise<void> {
        return this.send<void>('SET_PRODUCT', { id, product });
    }

    async deleteProduct(id: string): Promise<boolean> {
        return this.send<boolean>('DELETE_PRODUCT', id);
    }

    constructor() {
        super();
    }
}
