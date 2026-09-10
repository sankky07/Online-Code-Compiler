const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();

app.use(
cors({
origin: "*",
methods: ["GET", "POST"],
})
);

app.use(express.json({ limit: "1mb" }));

const PORT = process.env.PORT || 5000;
const JUDGE0_API_URL =
process.env.JUDGE0_API_URL || "https://ce.judge0.com";

const languageMapping = {
C: 50,
"C++": 54,
Java: 62,
Python: 71,
JavaScript: 63,
};

app.get("/", (req, res) => {
res.json({
success: true,
message: "Online Code Compiler API is running",
});
});

app.get("/health", (req, res) => {
res.json({
success: true,
status: "healthy",
service: "online-code-compiler-backend",
});
});

app.post("/execute", async (req, res) => {
const { code, language, input = "" } = req.body;

if (!code || typeof code !== "string") {
return res.status(400).json({
success: false,
error: "Code is required",
});
}

if (!languageMapping[language]) {
return res.status(400).json({
success: false,
error: `Unsupported language: ${language}`,
});
}

try {
const submission = await axios.post(
`${JUDGE0_API_URL}/submissions?base64_encoded=false&wait=true`,
{
source_code: code,
language_id: languageMapping[language],
stdin: input,
},
{
headers: {
"Content-Type": "application/json",
},
timeout: 30000,
}
);


const result = submission.data;

res.json({
  success: true,
  status: result.status?.description || "Unknown",
  output: result.stdout || "",
  error: result.stderr || "",
  compileOutput: result.compile_output || "",
  executionTime: result.time || null,
  memoryUsage: result.memory || null,
  exitCode: result.exit_code ?? null,
});


} catch (error) {
console.error("Execution error:", error.message);


if (error.response) {
  console.error("Judge0 response:", error.response.data);
}

res.status(500).json({
  success: false,
  error: "Code execution service is currently unavailable",
  details:
    process.env.NODE_ENV === "development"
      ? error.message
      : undefined,
});


}
});

app.listen(PORT, () => {
console.log(`✅ Server running on port ${PORT}`);
console.log(`🌐 Judge0 API: ${JUDGE0_API_URL}`);
});
