import cluster from "node:cluster";
import { availableParallelism } from 'node:os';
import {ProductManager} from "./modules/products";
import {IpcProductManager} from "./modules/products/ipc-manager";
import type {IpcRequest, IpcResponse} from "./modules/products/ipc-manager";
import {config} from "dotenv";
import {Server} from "./modules/server";
import fastify from "fastify";
import proxy from "@fastify/http-proxy";

if(cluster.isPrimary) {
    config();
    const defaultPort = Number(process.env.PORT);
    if(isNaN(defaultPort)) throw "Port must be a number";

    const productManager = new ProductManager();

    cluster.on('message', async (worker, msg: IpcRequest) => {
        if (!msg.reqId || !msg.type) return;

        let result: unknown;
        switch (msg.type) {
            case 'ADD_PRODUCT':
                result = await productManager.addProduct(msg.payload as Parameters<ProductManager['addProduct']>[0]);
                break;
            case 'GET_PRODUCT':
                result = await productManager.getProduct(msg.payload as string);
                break;
            case 'HAS_PRODUCT':
                result = await productManager.hasProduct(msg.payload as string);
                break;
            case 'GET_ALL_PRODUCTS':
                result = await productManager.getAllProducts();
                break;
            case 'SET_PRODUCT': {
                const { id, product } = msg.payload as Parameters<ProductManager['setProduct']> extends [infer I, infer P] ? { id: I, product: P } : never;
                result = await productManager.setProduct(id, product);
                break;
            }
            case 'DELETE_PRODUCT':
                result = await productManager.deleteProduct(msg.payload as string);
                break;
        }

        worker.send({ reqId: msg.reqId, result } satisfies IpcResponse);
    });

    const numCPUs = availableParallelism() - 1;
    for(let i = 0; i < numCPUs; i++) {
        cluster.fork({PORT: defaultPort + i + 1});
    }

    const server = fastify({
        logger: false
    });

    let currentCPU = 1;
    server.register(proxy, {
        prefix: "/api",
        rewritePrefix: "/api",
        upstream: "",
        replyOptions: {
            getUpstream: function (original, base) {
                const host = original.host.split(":")[0]!;
                const result = `http://${host}:${defaultPort + currentCPU}${original.originalUrl}`;
                currentCPU++;
                if(currentCPU > numCPUs) currentCPU = 1;
                return result;
            },
        }
    })

    void server.listen({port: defaultPort});
}
else if(cluster.isWorker) {
    const defaultPort = Number(process.env.PORT);
    if(isNaN(defaultPort)) throw "Port must be a number";
    const server = new Server(defaultPort, new IpcProductManager());
    void server.run();
}
