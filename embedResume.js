import fs from "fs";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

let openai
try {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
} catch (error) {
  console.error("Error initializing OpenAI:", error);
}

export async function embedResume() {
  const resume = fs.readFileSync("Julian Davies - Resume.txt", "utf-8");

  const chunks = resume.match(/.{1,500}/g);
  const embeddings = [];

  for (const chunk of chunks) {
    const normalizedChunk = chunk.replace(/\n/g, "\\n")
    const response = await openai.embeddings.create({
      model: "text-embedding-3-large",
      input: normalizedChunk,
    });

    embeddings.push({
      text: normalizedChunk,
      vector: response.data[0].embedding,
    });
  }

  return embeddings;
}
