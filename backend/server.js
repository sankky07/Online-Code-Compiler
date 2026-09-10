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
const JUDGE0_API_URL = process.env.JUDGE0_API_URL;
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY;

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

if (!JUDGE0_API_URL) {
return res.status(500).json({
success: false,
error: "Judge0 API is not configured",
});
}

try {
const headers = {
"Content-Type": "application/json",
};


if (JUDGE0_API_KEY) {
  headers["X-Auth-Token"] = JUDGE0_API_KEY;
}

// Create submission
const submissionResponse = await axios.post(
  `${JUDGE0_API_URL}/submissions?base64_encoded=false&wait=false`,
  {
    source_code: code,
    language_id: languageMapping[language],
    stdin: input,
  },
  {
    headers,
    timeout: 15000,
  }
);

const token = submissionResponse.data.token;

// Poll for result
let result = null;

for (let attempt = 0; attempt < 20; attempt++) {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const resultResponse = await axios.get(
    `${JUDGE0_API_URL}/submissions/${token}?base64_encoded=false`,
    {
      headers,
      timeout: 10000,
    }
  );

  result = resultResponse.data;

  if (result.status && result.status.id > 2) {
    break;
  }
}

if (!result) {
  return res.status(504).json({
    success: false,
    error: "Execution timed out",
  });
}

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
console.error("Judge0 execution error:", error.message);


if (error.response) {
  console.error("Judge0 response:", error.response.data);
}

res.status(500).json({
  success: false,
  error: "Code execution service is unavailable",
});


}
});

app.listen(PORT, () => {
console.log(`Server running on port ${PORT}`);
});
