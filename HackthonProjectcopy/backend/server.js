import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize GitHub Models client
const openai = new OpenAI({
  baseURL: "https://models.github.ai/inference",
  apiKey: process.env.GITHUB_TOKEN,
});

// --- Debug: check if API key is loaded ---
if (!process.env.GITHUB_TOKEN) {
  console.error("❌ GITHUB_TOKEN is NOT loaded. Check your .env file.");
} else {
  console.log("✅ GITHUB_TOKEN loaded successfully.");
}

// Optional: Test the API key immediately by making a small request
const testGitHubKey = async () => {
  if (!process.env.GITHUB_TOKEN) return;
  try {
    const response = await openai.chat.completions.create({
      model: "openai/gpt-4o",
      messages: [{ role: "user", content: "Hello" }],
      max_tokens: 10,
    });
    console.log("✅ GITHUB_TOKEN is valid. Test response:", response.choices?.[0]?.message?.content);
  } catch (error) {
    console.error("❌ GITHUB_TOKEN test failed:", error.response?.data || error.message || error);
  }
};

// Call the test function
testGitHubKey();

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

    // Debug: log full GitHub Models response
    console.log("GitHub Models response for query:", query, "\n", answer);

    res.json({ answer });
  } catch (error) {
    console.error("❌ GitHub Models API error:", error.response?.data || error.message || error);
    res.status(500).json({ answer: "Error fetching from GitHub Models" });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`✅ GitHub Models backend running on port ${PORT}`));