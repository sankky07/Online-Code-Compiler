import React, { useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Typography,
  IconButton,
  Tooltip,
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
  Java: { id: "java", extension: java() },
  "C++": { id: "cpp", extension: cpp() },
  Python: { id: "python", extension: python() },
  C: { id: "c", extension: cpp() }, // Using C++ highlighting for C
};

const Editor = () => {
  const [language, setLanguage] = useState("Java");
  const [code, setCode] = useState(defaultPrograms["Java"]); // Set default code
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [darkMode, setDarkMode] = useState(true); // Default: Dark Mode

  // Toggle Dark Mode
  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  const handleRun = async () => {
    try {
      const response = await axios.post(
        "https://emkc.org/api/v2/piston/execute",
        {
          language: languages[language].id,
          version: "*",
          files: [{ content: code }],
          stdin: input || "",
        }
      );

      const { run } = response.data;
      let result = `Output: ${run.stdout || "No output"}`;
      if (run.stderr) {
        result += `\nError Details: ${run.stderr}`;
      }

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
          flexDirection: "column",
          height: "100vh",
          bgcolor: "background.default",
          color: "text.primary",
        }}
      >
        <Box sx={{ display: "flex", flex: 1 }}>
          {/* Left Side - Code Editor */}
          <Box sx={{ flex: 1, padding: 2 }}>
            <Typography variant="h6" sx={{ marginBottom: 1 }}>
              Code Editor
            </Typography>

            {/* Code Editor Box */}
            <Box
              sx={{
                borderRadius: 2,
                border: "1px solid",
                borderColor: darkMode ? "#ffffff55" : "#00000022",
                padding: 1,
                bgcolor: "background.paper",
                boxShadow: darkMode
                  ? "0px 4px 10px rgba(255, 255, 255, 0.1)"
                  : "0px 4px 10px rgba(0, 0, 0, 0.1)",
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

            {/* Dark Mode Toggle Button */}
            <Tooltip title="Toggle Dark Mode">
              <IconButton
                onClick={toggleDarkMode}
                sx={{ alignSelf: "flex-end", marginBottom: 2 }}
              >
                {darkMode ? <Brightness7 /> : <Brightness4 />}
              </IconButton>
            </Tooltip>

            {/* Language Selection */}
            <TextField
              select
              label="Select Language"
              value={language}
              onChange={handleLanguageChange}
              fullWidth
              variant="outlined"
              sx={{ marginBottom: 2, bgcolor: "background.paper" }}
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
              variant="outlined"
              sx={{ marginBottom: 2, bgcolor: "background.paper" }}
            />

            {/* Run Button */}
            <Button
              variant="contained"
              color="primary"
              onClick={handleRun}
              sx={{
                marginBottom: 2,
                padding: "10px",
                fontWeight: "bold",
                borderRadius: "8px",
                "&:hover": { backgroundColor: darkMode ? "#1e88e5" : "#1565c0" },
              }}
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
              variant="outlined"
              InputProps={{ readOnly: true }}
              sx={{ bgcolor: "background.paper" }}
            />
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Editor;
