import express from "express";
import cors from "cors";
import { embedResume } from "./embedResume.js";
import { answerQuestion } from "./queryResume.js";

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
  try{
    const { message } = req.body;

    if (!resumeEmbedded) {
      return res.json({
        reply: "Resume is still being processed. Please try again later.",
      });
    }

    const reply = await answerQuestion(message, vectors);
    res.json({ reply });
  } catch (error) {
    console.error("Error handling /chat request:", error);
    res.json({ reply: "An error occurred while processing your request.", error: error.message});
  };
})
app.listen(3000, () => {
  console.log("Server running on port 3000");
});
