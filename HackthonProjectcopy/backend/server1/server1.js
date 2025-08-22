import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// --- Ensure GEMINI_API_KEY is loaded ---
if (!process.env.GEMINI_API_KEY) {
  console.error("❌ ERROR: GEMINI_API_KEY is NOT loaded. Check your .env file!");
  process.exit(1);
} else {
  console.log("✅ GEMINI_API_KEY loaded successfully.");
}

// --- Initialize Gemini client ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- Optional: Test Gemini key on startup ---
const testGeminiKey = async () => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent("Hello Gemini");
    const answer = result.response.text();
    console.log("✅ Gemini key works. Test response:", answer);
  } catch (error) {
    console.error("❌ Gemini key test failed:", error.message || error);
  }
};

testGeminiKey();

// --- Main API route ---
app.post("/api/gpt", async (req, res) => {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ answer: "Query required" });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(query);
    const answer = result.response.text();

    console.log(`Query: "${query}" → Response: ${answer}`);

    res.json({ answer });
  } catch (error) {
    console.error("❌ Gemini API error:", error.message || error);

    if (error.message.includes("API_KEY")) {
      res.status(401).json({ answer: "Invalid or missing Gemini API key." });
    } else if (error.message.includes("quota")) {
      res.status(429).json({ answer: "Gemini API quota exceeded." });
    } else if (error.message.includes("model")) {
      res.status(400).json({ answer: "Invalid Gemini model name." });
    } else {
      res.status(500).json({ answer: "Error fetching from Gemini API." });
    }
  }
});

// --- Start server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`✅ Gemini backend running on http://localhost:${PORT}`)
);
