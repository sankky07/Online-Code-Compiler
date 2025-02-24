import React, { useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Typography,
  IconButton,
} from "@mui/material";
import { Brightness4, Brightness7 } from "@mui/icons-material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CodeMirror from "@uiw/react-codemirror";
import { java } from "@codemirror/lang-java";
import { cpp } from "@codemirror/lang-cpp";
import { python } from "@codemirror/lang-python";

// Default Hello World programs
const defaultPrograms = {
  Java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,

  "C++": `#include <iostream>
using namespace std;
int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`,

  Python: `print("Hello, World!")`,

  C: `#include <stdio.h>
int main() {
    printf("Hello, World!\\n");
    return 0;
}`,
};

// Supported languages
const languages = {
  Java: { id: 62, extension: java() },
  "C++": { id: 54, extension: cpp() },
  Python: { id: 71, extension: python() },
  C: { id: 50, extension: cpp() }, // Using C++ highlighting for C
};

const Editor = () => {
  const [language, setLanguage] = useState("Java");
  const [code, setCode] = useState(defaultPrograms["Java"]); // Set default code
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, ] = useState(""); // Keeping only state if needed
  const [errorSuggestion, ] = useState("");
  const [darkMode, setDarkMode] = useState(true); // Default: Dark Mode

  // Toggle Dark Mode
  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  const handleRun = async () => {
    try {
        const response = await axios.post("https://online-code-compiler-a6o8.onrender.com", {
            code,
            language,
            input,
        });

        const { output, errorDetails, executionTime, memoryUsage } = response.data;

        let result = `Output: ${output}`;
        if (errorDetails) {
            result += `\nError Details: ${errorDetails}`;
        }
        result += `\nExecution Time: ${executionTime}\nMemory Usage: ${memoryUsage}`;

        setOutput(result);
    } catch (error) {
        console.error("Execution error:", error);
        setOutput("Execution failed.");
    }
};


  // Handle language change
  const handleLanguageChange = (e) => {
    const selectedLang = e.target.value;
    setLanguage(selectedLang);
    setCode(defaultPrograms[selectedLang]); // Set default Hello World program
  };

  // Define Light & Dark Themes
  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
      primary: { main: darkMode ? "#90caf9" : "#1976d2" },
      background: { default: darkMode ? "#282c34" : "#f5f5f5" },
      text: { primary: darkMode ? "#ffffff" : "#000000" },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          display: "flex",
          height: "100vh",
          bgcolor: "background.default",
          color: "text.primary",
        }}
      >
        {/* Left Side - Code Editor */}
        <Box sx={{ flex: 1, padding: 2 }}>
          {/* Dark Mode Toggle Button */}
          <IconButton
            onClick={toggleDarkMode}
            sx={{ position: "absolute", top: 10, right: 10 }}
          >
            {darkMode ? <Brightness7 /> : <Brightness4 />}
          </IconButton>

          <Typography variant="h6" sx={{ marginBottom: 1 }}>
            Code Editor
          </Typography>

          {/* Code Editor inside a Box */}
          <Box
            sx={{
              borderRadius: 2,
              border: "1px solid",
              borderColor: darkMode ? "#ffffff55" : "#00000022",
              padding: 1,
              bgcolor: "background.paper",
            }}
          >
            <CodeMirror
              value={code}
              height="80vh"
              theme={darkMode ? "dark" : "light"}
              extensions={[languages[language].extension]}
              onChange={(newCode) => setCode(newCode)}
            />
          </Box>
        </Box>

        {/* Right Side - Input, Output, and Controls */}
        <Box
          sx={{
            width: "30%",
            padding: 2,
            borderLeft: "2px solid",
            borderColor: darkMode ? "#ffffff22" : "#00000022",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Typography variant="h6" sx={{ marginBottom: 1 }}>
            Settings
          </Typography>

          {/* Language Selection */}
          <TextField
            select
            label="Select Language"
            value={language}
            onChange={handleLanguageChange}
            fullWidth
            sx={{
              marginBottom: 2,
              bgcolor: "background.paper",
            }}
          >
            {Object.keys(languages).map((lang) => (
              <MenuItem key={lang} value={lang}>
                {lang}
              </MenuItem>
            ))}
          </TextField>

          {/* Input Box */}
          <Typography variant="subtitle1">Input</Typography>
          <TextField
            multiline
            rows={3}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter input here..."
            fullWidth
            sx={{ marginBottom: 2, bgcolor: "background.paper" }}
          />

          {/* Run Button */}
          <Button
            variant="contained"
            color="primary"
            onClick={handleRun}
            sx={{ marginBottom: 2 }}
          >
            Run Code
          </Button>

          {/* Output Box */}
          <Typography variant="subtitle1">Output</Typography>
          <TextField
            multiline
            rows={6}
            value={output}
            fullWidth
            InputProps={{ readOnly: true }}
            sx={{ bgcolor: "background.paper" }}
          />

          {/* Error Box */}
          {error && (
            <Box sx={{ marginTop: 2 }}>
              <Typography variant="subtitle1" color="error">
                Error
              </Typography>
              <TextField
                multiline
                rows={3}
                value={error}
                fullWidth
                InputProps={{ readOnly: true }}
                sx={{ bgcolor: "background.paper" }}
              />
              <Typography variant="subtitle1" sx={{ marginTop: 1 }}>
                Possible Fix
              </Typography>
              <TextField
                multiline
                rows={2}
                value={errorSuggestion}
                fullWidth
                InputProps={{ readOnly: true }}
                sx={{ bgcolor: "background.paper" }}
              />
            </Box>
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Editor;
