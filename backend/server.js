const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config(); // Load environment variables from .env

const app = express();
app.use(cors());
app.use(express.json());

const JUDGE0_API = "https://judge0-ce.p.rapidapi.com/submissions";
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY; // Use environment variable

const headers = {
    "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
    "x-rapidapi-key": JUDGE0_API_KEY,
};

const languageMapping = {
    "C": 50,
    "C++": 54,
    "Java": 62,
    "Python": 71,
    "JavaScript": 63,
};

// API Route to execute code
app.post("/execute", async (req, res) => {
    const { code, language, input } = req.body;

    if (!languageMapping[language]) {
        return res.status(400).json({ error: "Unsupported language" });
    }

    try {
        // Submit code to Judge0
        const response = await axios.post(
            `${JUDGE0_API}?base64_encoded=false&wait=true`,
            {
                source_code: code,
                language_id: languageMapping[language],
                stdin: input || "",
            },
            { headers }
        );

        const { stdout, stderr, message, status, time, memory, compile_output } = response.data;

        let outputMessage = "";
        let errorDetails = "";

        if (status && status.id !== 3) {
            // Handle Compilation or Runtime Errors
            if (compile_output) {
                outputMessage = "Compilation Error";
                errorDetails = compile_output;
            } else if (stderr) {
                outputMessage = "Runtime Error";
                errorDetails = stderr;
            } else {
                outputMessage = "Unknown Error";
                errorDetails = message || "Something went wrong.";
            }
        } else {
            outputMessage = stdout || "No output";
        }

        res.json({
            output: outputMessage,
            errorDetails: errorDetails,
            executionTime: time || "N/A",
            memoryUsage: memory || "N/A",
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
