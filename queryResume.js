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

function cosineSimilarity(a, b) {
  let dot = 0;
  let mA = 0;
  let mB = 0;
  for (let i = 0; i < a.length; i++){
    dot += a[i] * b[i]
    mA += a[i] * a[i]
    mB += b[i] * b[i]
  }
  mA = Math.sqrt(mA)
  mB = Math.sqrt(mB)
  return dot / (mA * mB);
}


import fs from "fs";

export async function answerQuestion(question, vectors) {
  // Original chunked vector search functionality
  let completion;
  try {
    const questionEmbedding = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: question,
    });

    const qVector = questionEmbedding.data[0].embedding;

    const relevant = vectors
      .map(v => ({
        ...v,
        score: cosineSimilarity(qVector, v.vector),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 15)
      .map(v => v.text)
      .join("\n");

    completion = await openai.responses.create({
      model: "gpt-5-mini",
      input: [
        {
          role: "system",
          content:
            "1. You are a friendly resume assistant. You have a resume and will answer ONLY using the provided resume context. " +
            "2. If you do not know, simply respond with a message similiar to: 'I do not know. Can you rephrase the query to simpler terms?' " +
            "3. Always start the response with a cheerful manner. " +
            "4. When asked for a summary, do not include volunteer experience. " +
            "5. Add a message similar to the following in the response: 'Note: This chatbot is still a WIP and may produce invalid or incomplete responses. " +
            "6. Always be positive and do not include any negative comments or areas to improve in your response.",
        },
        {
          role: "user",
          content: `Resume:\n${relevant}\n\nQuestion: ${question}`,
        },
      ],
    });
  } catch (error) {
    console.error("Error generating answer:", error);
    return "An error occurred while generating the answer.";
  }
  return completion.output_text;
}

// New function: answer using the entire resume file
export async function answerQuestionFullResume(question, resumePath = "Julian Davies - Resume.txt") {
  let completion;
  try {
    const resume = fs.readFileSync(resumePath, "utf-8");
    completion = await openai.responses.create({
      model: "gpt-5-mini",
      input: [
        {
          role: "system",
          content:
            "1. You are a friendly resume assistant. You have a resume and will answer ONLY using the provided resume context. " +
            "2. If you do not know, simply respond with a message similiar to: 'I do not know. Can you rephrase the query to simpler terms?' " +
            "3. Always start the response with a cheerful manner. " +
            "4. When asked for a summary, do not include volunteer experience. " +
            "5. Add a message similar to the following in the response: 'Note: This chatbot is still a WIP and may produce invalid or incomplete responses. " +
            "6. Always be positive and do not include any negative comments or areas to improve in your response.",
        },
        {
          role: "user",
          content: `Resume:\n${resume}\n\nQuestion: ${question}`,
        },
      ],
    });
  } catch (error) {
    console.error("Error generating answer (full resume):", error);
    return "An error occurred while generating the answer.";
  }
  return completion.output_text;
}
