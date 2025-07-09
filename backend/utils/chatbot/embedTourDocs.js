import mongoose from "mongoose";
import connectDB from "../../config/db.js";
import Tour from "../../models/tour.js";
import { OpenAIEmbeddings } from "@langchain/openai";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import { Document } from "@langchain/core/documents";
import dotenv from "dotenv";
import { htmlToText } from "html-to-text";

dotenv.config();

await connectDB();

const tourData = await Tour.find();
const db = mongoose.connection;

const collection = db.collection("tour_vectors");
await collection.deleteMany({});
const embedder = new OpenAIEmbeddings({
    modelName: "text-embedding-3-small",
});

for (const record of tourData) {
    const cleanExperiences = htmlToText(record.experiences || "", {
        wordwrap: false,
        ignoreHref: true,
        ignoreImage: true,
    });
    const pageContent = `${record.name}. Location: ${record.location}. Experiences: ${cleanExperiences}`;
    const metadata = {
        _id: record._id.toString(),
        name: record.name,
        price: record.fromPrice,
        category: record.category,
        img: record.images[0],
        location: record.location,
    };

    await MongoDBAtlasVectorSearch.fromDocuments(
        [new Document({ pageContent, metadata })],
        embedder,
        {
            collection,
            indexName: "vector_index",
            textKey: "embedding_text",
            embeddingKey: "embedding",
        }
    );

    console.log("Processed tour:", metadata.name);
}

mongoose.disconnect();
