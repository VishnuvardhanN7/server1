import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import OpenAI from "openai";

// --- Load the correct .env file for server1 ---
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// --- Ensure GITHUB_TOKEN is loaded ---
if (!process.env.GITHUB_TOKEN) {
  console.error("❌ ERROR: GITHUB_TOKEN is NOT loaded. Check server1/.env file!");
  process.exit(1); // Stop the server if token is missing
} else {
  console.log("✅ GITHUB_TOKEN loaded successfully.");
}

// --- Initialize GitHub Models client ---
const openai = new OpenAI({
  baseURL: "https://models.github.ai/inference",
  apiKey: process.env.GITHUB_TOKEN, // use GitHub token as API key
});

// --- Optional: Test GitHub Models key on startup ---
const testGitHubKey = async () => {
  try {
    const response = await openai.chat.completions.create({
      model: "openai/gpt-4o",
      messages: [{ role: "user", content: "Hello" }],
      max_tokens: 10,
    });
    console.log("✅ GitHub Models key works. Test response:", response.choices?.[0]?.message?.content);
  } catch (error) {
    console.error("❌ GitHub Models key test failed:", error.response?.data || error.message || error);
  }
};

testGitHubKey();

// --- Main API route ---
app.post("/api/gpt", async (req, res) => {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ answer: "Query required" });
  }

  try {
    const response = await openai.chat.completions.create({
      model: "openai/gpt-4o",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: query },
      ],
      max_tokens: 500,
    });

    const answer = response.choices?.[0]?.message?.content || "No response";
    console.log(`Query: "${query}" → Response: ${answer}`);

    res.json({ answer });
  } catch (error) {
    console.error("❌ GitHub Models API error:", error.response?.data || error.message || error);
    res.status(500).json({ answer: "Error fetching from GitHub Models" });
  }
});

// --- Start server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`✅ Server1 running on http://localhost:${PORT}`)
);
