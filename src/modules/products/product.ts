import z from "zod";

const productSchema = z.object({
    id: z.uuid(),
    name: z.string(),
    description: z.string(),
    price: z.number().positive(),
    category: z.union([z.literal("electronics"), z.literal("books"), z.literal("clothing")]),
    inStock: z.boolean(),
})

const createProductSchema = productSchema.omit({id: true});

type Product = z.infer<typeof productSchema>;
type CreateProduct = z.infer<typeof createProductSchema>;

export {productSchema, createProductSchema};
export type {Product, CreateProduct};