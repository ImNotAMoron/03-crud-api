import {createProductSchema, ProductManager, productSchema} from "../products";
import zod from "zod";
import fastify from "fastify";

type ProductId = {
    Params: {
        productId: string | undefined
    }
};

export class Server {
    products: ProductManager;
    port: number;
    server;
    constructor(port: number, products: ProductManager) {
        this.port = port;
        this.products = products;
        this.server = fastify({
            logger: false
        });

        this.server.get<ProductId>("/api/products/:productId?", async (request, response) => {
            const params = request.params;
            if(params.productId === undefined) return this.products.getAllProducts();
            const {data: productId, success} = zod.uuid().safeParse(params.productId);
            if(!success) return response.status(400).send({error: "ProductID is invalid"});
            const product = await products.getProduct(productId);
            if (product === undefined) return response.status(404).send({error: "Product not found"});
            return product;
        })

        this.server.post("/api/products", async (request, response) => {
            const body = request.body;
            const {error, success, data} = createProductSchema.safeParse(body);
            if (!success) {
                return response.status(400).send({error: error.message, issues: error.issues});
            }
            const newProduct = await products.addProduct({id: crypto.randomUUID(), ...data});
            return response.status(201).send(newProduct)
        });

        this.server.put<ProductId>("/api/products/:productId?", async (request, response) => {
            const params = request.params;
            const body = request.body;
            const {data: productId, success: productIdSuccess} = zod.uuid().safeParse(params.productId);
            if(!productIdSuccess) return response.status(400).send({error: "ProductID is invalid"});
            if(!await this.products.hasProduct(productId)) return response.status(404).send({error: "Product not found"});
            const {data: product, success, error} = createProductSchema.safeParse(body);
            if (!success) return response.status(400).send({error: error.message, issues: error.issues});
            await this.products.setProduct(productId, product);
            return {...product, id: productId};
        })

        this.server.delete<ProductId>("/api/products/:productId?", async (request, response) => {
            const params = request.params;
            const {data: productId, success} = zod.uuid().safeParse(params.productId);
            if(!success) return response.status(400).send({error: "ProductID is invalid"});
            const exist = await this.products.deleteProduct(productId);
            if(exist) return response.status(204).send();
            else return response.status(404).send({error: "A product with this id doesn't exist"});
        })

        this.server.setNotFoundHandler((request, response) => {
            return response.status(404).send({error: `Route ${request.url} not found`});
        })

        this.server.setErrorHandler((error, request, response) => {
            let message = "Unknown error occurred";
            if(error instanceof Error) message = error.message;
            response.status(500).send({error: `Internal server error: ${message}`});
        })

    }
    async run() {
        try {
            await this.server.listen({port: this.port});
        } catch (e) {
            this.server.log.error(e);
        }
    }
}
