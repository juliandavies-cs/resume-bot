import express from "express";
import cors from "cors";
import { embedResume } from "./embedResume.js";
import { answerQuestionFullResume } from "./queryResume.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

let vectors = [];
let resumeEmbedded = false;

(async () => {
  try{
  vectors = await embedResume();
  console.log("Resume embedded");
  resumeEmbedded = true;
  } catch (error) {
    console.error("Error embedding resume:", error);
  }
})();

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    // Optionally, you can keep the resumeEmbedded check if you want to ensure the file is available
    // For now, we assume the resume file is always available

    const reply = await answerQuestionFullResume(message);
    res.json({ reply });
  } catch (error) {
    console.error("Error handling /chat request:", error);
    res.json({ reply: "An error occurred while processing your request." });
  }
});

app.get("/status", (req, res) => {
  res.json({ ready: resumeEmbedded });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
