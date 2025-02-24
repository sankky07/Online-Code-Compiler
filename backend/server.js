const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

const PISTON_API = "https://emkc.org/api/v2/piston/execute"; // Piston API

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
        const output = run.stdout || "No output";
        const errorDetails = run.stderr || "";

        res.json({
            output,
            errorDetails
        });
    } catch (error) {
        console.error("Execution error:", error);
        res.status(500).json({ output: "Execution failed", errorDetails: error.message });
    }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
