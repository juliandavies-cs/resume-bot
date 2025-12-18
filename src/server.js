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
  vectors = await embedResume();
  console.log("Resume embedded");
  resumeEmbedded = true;
})();

app.post("/chat", async (req, res) => {
  const { message } = req.body;

  if (!resumeEmbedded) {
    return res.json({
      reply: "Resume is still being processed. Please try again later.",
    });
  }

  const reply = await answerQuestion(message, vectors);
  res.json({ reply });
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
