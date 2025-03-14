import React, { useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Typography,
  IconButton,
  Select,
  useMediaQuery,
} from "@mui/material";
import { Brightness4, Brightness7, FileCopy, GetApp } from "@mui/icons-material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CodeMirror from "@uiw/react-codemirror";
import { java } from "@codemirror/lang-java";
import { cpp } from "@codemirror/lang-cpp";
import { python } from "@codemirror/lang-python";
import { githubDark, dracula, eclipse } from "@uiw/codemirror-themes-all";

// Default Programs
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

// Supported Languages
const languages = {
  Java: { id: "java", extension: java() },
  "C++": { id: "cpp", extension: cpp() },
  Python: { id: "python", extension: python() },
  C: { id: "c", extension: cpp() }, // Using C++ highlighting for C
};

// CodeMirror Themes
const themes = {
  "GitHub Dark": githubDark,
  Dracula: dracula,
  Eclipse: eclipse,
};

const Editor = () => {
  const [language, setLanguage] = useState("Java");
  const [code, setCode] = useState(defaultPrograms["Java"]);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [darkMode, setDarkMode] = useState(true);
  const [theme, setTheme] = useState("GitHub Dark");

  // Check if the screen is small (mobile view)
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Toggle Dark Mode
  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  // Handle Theme Change
  const handleThemeChange = (event) => setTheme(event.target.value);

  // Run Code using Piston API
  const handleRun = async () => {
    try {
      const response = await axios.post("https://emkc.org/api/v2/piston/execute", {
        language: languages[language].id,
        version: "*",
        files: [{ content: code }],
        stdin: input || "",
      });

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

  // Handle Language Change
  const handleLanguageChange = (e) => {
    const selectedLang = e.target.value;
    setLanguage(selectedLang);
    setCode(defaultPrograms[selectedLang]);
  };

  // Copy Code to Clipboard
  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    alert("Code copied to clipboard!");
  };

  // Download Code as a File
  const handleDownloadCode = () => {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `code.${language.toLowerCase()}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Define Light & Dark Themes
  const muiTheme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
      primary: { main: darkMode ? "#90caf9" : "#1976d2" },
      background: { default: darkMode ? "#282c34" : "#f5f5f5" },
      text: { primary: darkMode ? "#ffffff" : "#000000" },
    },
  });

  return (
    <ThemeProvider theme={muiTheme}>
      <Box
        sx={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          height: "100vh",
          bgcolor: "background.default",
          color: "text.primary",
          padding: 2,
        }}
      >
        {/* Code Editor Section */}
        <Box sx={{ flex: 1, minHeight: isMobile ? "50vh" : "auto", padding: 2 }}>
          {/* Dark Mode & Theme Selector */}
          <Box sx={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
            <IconButton onClick={toggleDarkMode}>
              {darkMode ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
            <Select value={theme} onChange={handleThemeChange} size="small" sx={{ bgcolor: "background.paper" }}>
              {Object.keys(themes).map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </Select>
          </Box>

          <Typography variant="h6">Code Editor</Typography>
          <Box sx={{ border: "1px solid", borderColor: darkMode ? "#ffffff55" : "#00000022", padding: 1, bgcolor: "background.paper" }}>
            <CodeMirror
              value={code}
              height={isMobile ? "40vh" : "70vh"}
              theme={themes[theme]}
              extensions={[languages[language].extension]}
              onChange={(newCode) => setCode(newCode)}
            />
          </Box>

          {/* Buttons */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", marginTop: 1 }}>
            <Button startIcon={<FileCopy />} onClick={handleCopyCode} variant="contained" sx={{ marginRight: 1 }}>
              Copy
            </Button>
            <Button startIcon={<GetApp />} onClick={handleDownloadCode} variant="contained" color="secondary">
              Download
            </Button>
          </Box>
        </Box>

        {/* Settings & Output Section */}
        <Box
          sx={{
            width: isMobile ? "100%" : "30%",
            padding: 2,
            borderLeft: isMobile ? "none" : "2px solid",
            borderColor: darkMode ? "#ffffff22" : "#00000022",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Typography variant="h6">Settings</Typography>
          <TextField select label="Select Language" value={language} onChange={handleLanguageChange} fullWidth sx={{ marginBottom: 2, bgcolor: "background.paper" }}>
            {Object.keys(languages).map((lang) => (
              <MenuItem key={lang} value={lang}>
                {lang}
              </MenuItem>
            ))}
          </TextField>

          <Typography variant="subtitle1">Input</Typography>
          <TextField multiline rows={3} value={input} onChange={(e) => setInput(e.target.value)} fullWidth sx={{ marginBottom: 2, bgcolor: "background.paper" }} />

          <Button variant="contained" color="primary" onClick={handleRun} sx={{ marginBottom: 2 }}>
            Run Code
          </Button>

          <Typography variant="subtitle1">Output</Typography>
          <TextField multiline rows={6} value={output} fullWidth InputProps={{ readOnly: true }} sx={{ bgcolor: "background.paper" }} />
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Editor;
