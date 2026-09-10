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
  JavaScript: 63,
  Python: 71,
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

  const languageId = languageMapping[language];

  if (!languageId) {
    return res.status(400).json({
      success: false,
      error: `Unsupported language: ${language}`,
    });
  }

  try {
    console.log(`Executing ${language} code...`);

    const submissionResponse = await axios.post(
      `${JUDGE0_API_URL}/submissions?base64_encoded=false&wait=false`,
      {
        source_code: code,
        language_id: languageId,
        stdin: input,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 15000,
      }
    );

    const token = submissionResponse.data.token;

    if (!token) {
      return res.status(500).json({
        success: false,
        error: "Judge0 did not return a submission token",
      });
    }

    console.log(`Submission created: ${token}`);

    let result = null;

   for (let attempt = 0; attempt < 30; attempt++) {
  const delay = Math.min(200 + attempt * 100, 1000);

  await new Promise((resolve) => setTimeout(resolve, delay));

  const resultResponse = await axios.get(
    `${JUDGE0_API_URL}/submissions/${token}?base64_encoded=false`,
    {
      timeout: 5000,
    }
  );

  result = resultResponse.data;

  if (result.status && result.status.id > 2) {
    break;
  }
}

    if (!result || !result.status) {
      return res.status(504).json({
        success: false,
        error: "Execution timed out",
      });
    }

    res.json({
      success: true,
      status: result.status.description || "Unknown",
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
      console.error(
        "Judge0 response:",
        error.response.status,
        error.response.data
      );
    }

    res.status(500).json({
      success: false,
      error: "Code execution service is currently unavailable",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Judge0: ${JUDGE0_API_URL}`);
});
