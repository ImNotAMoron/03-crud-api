import {ProductManager} from "./modules/products";
import {Server} from "./modules/server";
import {config} from "dotenv";

config();

if(process.env.PORT === undefined || isNaN(Number(process.env.PORT))) throw "Port must be a number";

const products = new ProductManager();

const server = new Server(
    Number(process.env.PORT), products,
);

void server.run();