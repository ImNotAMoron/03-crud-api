import type {CreateProduct, Product} from "./product.js";

export class ProductManager {
    private products;
    addProduct(product: Product): Product {
        this.products.set(product.id, product);
        return product;
    }
    getProduct(id: string): Product | undefined {
        return this.products.get(id);
    }
    hasProduct(id: string): boolean {
        return this.products.has(id);
    }
    getAllProducts(): Product[] {
        return Array.from(this.products.values());
    }
    setProduct(id: string, product: CreateProduct) {
        this.products.set(id, {id: id, ...product});
    }
    deleteProduct(id: string) {
        return this.products.delete(id);
    }
    constructor() {
        this.products = new Map<string, Product>();
    }
}