import type {CreateProduct, Product} from "./product.js";

export class ProductManager {
    protected products;
    async addProduct(product: Product): Promise<Product> {
        this.products.set(product.id, product);
        return product;
    }
    async getProduct(id: string): Promise<Product | undefined> {
        return this.products.get(id);
    }
    async hasProduct(id: string): Promise<boolean> {
        return this.products.has(id);
    }
    async getAllProducts(): Promise<Product[]> {
        return Array.from(this.products.values());
    }
    async setProduct(id: string, product: CreateProduct): Promise<void> {
        this.products.set(id, {id: id, ...product});
    }
    async deleteProduct(id: string): Promise<boolean> {
        return this.products.delete(id);
    }
    constructor() {
        this.products = new Map<string, Product>();
    }
}
