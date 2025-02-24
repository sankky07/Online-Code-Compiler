const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config(); // Load environment variables from .env

const app = express();
app.use(cors());
app.use(express.json());

const PISTON_API = "https://emkc.org/api/v2/piston/execute";

const languageMapping = {
    "C": "c",
    "C++": "cpp",
    "Java": "java",
    "Python": "python",
    "JavaScript": "javascript",
};

// API Route to execute code
app.post("/execute", async (req, res) => {
    const { code, language, input } = req.body;

    if (!languageMapping[language]) {
        return res.status(400).json({ error: "Unsupported language" });
    }

    try {
        // Submit code to Piston API
        const response = await axios.post(PISTON_API, {
            language: languageMapping[language],
            version: "*",
            files: [{ content: code }],
            stdin: input || "",
        });

        const { run } = response.data;
        const { stdout, stderr } = run;

        let outputMessage = stdout || "No output";
        let errorDetails = stderr ? stderr : "";

        res.json({
            output: outputMessage,
            errorDetails: errorDetails,
            executionTime: "N/A",
            memoryUsage: "N/A",
        });
    } catch (error) {
        console.error("Execution error:", error.response ? error.response.data : error.message);
        res.status(500).json({
            output: "Execution failed",
            errorDetails: error.response ? error.response.data : "Internal Server Error",
            executionTime: null,
            memoryUsage: null,
        });
    }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
