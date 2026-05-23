import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const client = new MongoClient(process.env.MONGO_URL || "mongodb://localhost:27017");

await client.connect();

const db = client.db("Front_RAG");
export const embeddingsCollection = db.collection("embeddings");