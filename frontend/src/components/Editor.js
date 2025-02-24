import axios from "axios";

// Define Backend API URL (Use the deployed backend URL)
const BACKEND_URL = "https://online-code-compiler-ljop.onrender.com"; // Replace with your deployed backend URL

export const executeCode = async (code, language, input) => {
    try {
        const response = await axios.post(BACKEND_URL, {
            code,
            language,
            input
        });

        return response.data;
    } catch (error) {
        console.error("Error executing code:", error.response ? error.response.data : error.message);
        return {
            output: "Execution failed",
            errorDetails: error.response ? error.response.data : "Internal Server Error",
            executionTime: null,
            memoryUsage: null,
        };
    }
};
