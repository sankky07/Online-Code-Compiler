import React, { useState, useEffect, useRef } from "react";
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
import { Brightness4, Brightness7, FileDownload, ContentCopy, PlayArrow } from "@mui/icons-material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CodeMirror from "@uiw/react-codemirror";
import { java } from "@codemirror/lang-java";
import { cpp } from "@codemirror/lang-cpp";
import { python } from "@codemirror/lang-python";
import { useHotkeys } from "react-hotkeys-hook"; // For keyboard shortcuts

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
  Java: { id: "java", extension: java(), fileExt: ".java" },
  "C++": { id: "cpp", extension: cpp(), fileExt: ".cpp" },
  Python: { id: "python", extension: python(), fileExt: ".py" },
  C: { id: "c", extension: cpp(), fileExt: ".c" }, // Using C++ highlighting for C
};

const Editor = () => {
  const [language, setLanguage] = useState("Java");
  const [code, setCode] = useState(localStorage.getItem("savedCode") || defaultPrograms["Java"]);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [darkMode, setDarkMode] = useState(true);
  const outputRef = useRef(null);

  // Auto-save code
  useEffect(() => {
    localStorage.setItem("savedCode", code);
  }, [code]);

  // Keyboard Shortcut: Run code with Ctrl + Enter
  useHotkeys("ctrl+enter", () => handleRun());

  // Toggle Dark Mode
  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  // Handle code execution
  const handleRun = async () => {
    try {
      const response = await axios.post("https://emkc.org/api/v2/piston/execute", {
        language: languages[language].id,
        version: "*",
        files: [{ content: code }],
        stdin: input || "",
      });

      const { run } = response.data;
      setOutput(run.stdout || run.stderr || "No output");
    } catch (error) {
      console.error("Execution error:", error);
      setOutput("Execution failed.");
    }
  };

  // Handle language change
  const handleLanguageChange = (e) => {
    const selectedLang = e.target.value;
    setLanguage(selectedLang);
    setCode(defaultPrograms[selectedLang]);
  };

  // Download Code File
  const handleDownload = () => {
    const blob = new Blob([code], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `code${languages[language].fileExt}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy Output to Clipboard
  const handleCopyOutput = () => {
    navigator.clipboard.writeText(output);
  };

  // Theme Settings
  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
      primary: { main: darkMode ? "#90caf9" : "#1976d2" },
      background: { default: darkMode ? "#1e1e1e" : "#f5f5f5" },
      text: { primary: darkMode ? "#ffffff" : "#000000" },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: "flex", height: "100vh", bgcolor: "background.default", color: "text.primary" }}>
        {/* Code Editor */}
        <Box sx={{ flex: 2, padding: 2 }}>
          {/* Dark Mode Toggle & Language Selection */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6">Code Editor</Typography>
            <Box>
              <TextField select value={language} onChange={handleLanguageChange} sx={{ width: "120px", mr: 2 }}>
                {Object.keys(languages).map((lang) => (
                  <MenuItem key={lang} value={lang}>
                    {lang}
                  </MenuItem>
                ))}
              </TextField>
              <Tooltip title="Toggle Dark Mode">
                <IconButton onClick={toggleDarkMode}>{darkMode ? <Brightness7 /> : <Brightness4 />}</IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Code Editor with Glass Effect */}
          <Box sx={{ borderRadius: 3, bgcolor: "background.paper", padding: 1.5 }}>
            <CodeMirror value={code} height="70vh" theme={darkMode ? "dark" : "light"} extensions={[languages[language].extension]} onChange={(newCode) => setCode(newCode)} />
          </Box>
        </Box>

        {/* Controls & Output */}
        <Box sx={{ width: "30%", padding: 2, borderLeft: "2px solid", borderColor: darkMode ? "#ffffff22" : "#00000022", display: "flex", flexDirection: "column" }}>
          <Typography variant="h6">Settings</Typography>

          {/* Input */}
          <TextField multiline rows={3} value={input} onChange={(e) => setInput(e.target.value)} placeholder="Enter input here..." fullWidth sx={{ my: 2 }} />

          {/* Buttons */}
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button variant="contained" color="primary" startIcon={<PlayArrow />} onClick={handleRun}>
              Run (Ctrl + Enter)
            </Button>
            <Tooltip title="Download Code">
              <IconButton onClick={handleDownload}><FileDownload /></IconButton>
            </Tooltip>
          </Box>

          {/* Output */}
          <TextField multiline rows={6} value={output} fullWidth inputRef={outputRef} InputProps={{ readOnly: true }} sx={{ my: 2 }} />
          <Button variant="outlined" color="secondary" startIcon={<ContentCopy />} onClick={handleCopyOutput}>
            Copy Output
          </Button>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Editor;
