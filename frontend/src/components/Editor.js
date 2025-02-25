import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Box, Button, TextField, MenuItem, Typography, IconButton, Tooltip
} from "@mui/material";
import { Brightness4, Brightness7, ContentCopy, CloudDownload, Fullscreen, FullscreenExit } from "@mui/icons-material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CodeMirror from "@uiw/react-codemirror";
import { java } from "@codemirror/lang-java";
import { cpp } from "@codemirror/lang-cpp";
import { python } from "@codemirror/lang-python";

const defaultPrograms = {
  Java: `public class Main { public static void main(String[] args) { System.out.println("Hello, World!"); }}`,
  "C++": `#include <iostream>\nusing namespace std;\nint main() { cout << "Hello, World!"; return 0; }`,
  Python: `print("Hello, World!")`,
  C: `#include <stdio.h>\nint main() { printf("Hello, World!\\n"); return 0; }`,
};

const languages = {
  Java: { id: "java", extension: java() },
  "C++": { id: "cpp", extension: cpp() },
  Python: { id: "python", extension: python() },
  C: { id: "c", extension: cpp() },
};

const Editor = () => {
  const [language, setLanguage] = useState(localStorage.getItem("language") || "Java");
  const [code, setCode] = useState(localStorage.getItem(`code_${language}`) || defaultPrograms[language]);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [executionTime, setExecutionTime] = useState(null);
  const [memoryUsage, setMemoryUsage] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const [fullScreen, setFullScreen] = useState(false);
  const editorRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("language", language);
    localStorage.setItem(`code_${language}`, code);
  }, [language, code]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);
  const toggleFullScreen = () => setFullScreen((prev) => !prev);

  const handleRun = async () => {
    try {
      const startTime = performance.now();

      const response = await axios.post("https://emkc.org/api/v2/piston/execute", {
        language: languages[language].id,
        version: "*",
        files: [{ content: code }],
        stdin: input || "",
      });

      const endTime = performance.now();
      const executionTimeMs = (endTime - startTime).toFixed(2);

      const { run } = response.data;
      let result = `Output: ${run.stdout || "No output"}`;
      if (run.stderr) {
        result += `\nError: ${run.stderr}`;
      }

      setOutput(result);
      setExecutionTime(executionTimeMs);
      setMemoryUsage(run.memory || "N/A");
    } catch (error) {
      console.error("Execution error:", error);
      setOutput("Execution failed.");
    }
  };

  const handleLanguageChange = (e) => {
    const selectedLang = e.target.value;
    setLanguage(selectedLang);
    setCode(localStorage.getItem(`code_${selectedLang}`) || defaultPrograms[selectedLang]);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    alert("Code copied!");
  };

  const handleDownloadCode = () => {
    const blob = new Blob([code], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${language}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const theme = createTheme({
    palette: { mode: darkMode ? "dark" : "light" },
  });

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: "flex", flexDirection: "column", height: "100vh", bgcolor: "background.default", color: "text.primary" }}>
        
        {/* Editor & Settings */}
        <Box sx={{ display: "flex", flex: 1 }}>
          
          {/* Code Editor */}
          <Box sx={{ flex: 1, padding: 2, position: "relative" }}>
            
            <Tooltip title="Toggle Dark Mode">
              <IconButton onClick={toggleDarkMode} sx={{ position: "absolute", top: 10, right: 50 }}>
                {darkMode ? <Brightness7 /> : <Brightness4 />}
              </IconButton>
            </Tooltip>

            <Tooltip title={fullScreen ? "Exit Fullscreen" : "Fullscreen Mode"}>
              <IconButton onClick={toggleFullScreen} sx={{ position: "absolute", top: 10, right: 10 }}>
                {fullScreen ? <FullscreenExit /> : <Fullscreen />}
              </IconButton>
            </Tooltip>

            <CodeMirror
              ref={editorRef}
              value={code}
              height="80vh"
              theme={darkMode ? "dark" : "light"}
              extensions={[languages[language].extension]}
              onChange={(newCode) => setCode(newCode)}
            />
          </Box>

          {/* Settings & Output */}
          <Box sx={{ width: "30%", padding: 2, borderLeft: "1px solid gray", display: "flex", flexDirection: "column" }}>
            
            <TextField select label="Select Language" value={language} onChange={handleLanguageChange} fullWidth sx={{ mb: 2 }}>
              {Object.keys(languages).map((lang) => <MenuItem key={lang} value={lang}>{lang}</MenuItem>)}
            </TextField>

            <Button variant="contained" onClick={handleRun} sx={{ mb: 2 }}>Run Code</Button>

            <Box sx={{ display: "flex", gap: 1 }}>
              <Tooltip title="Copy Code"><IconButton onClick={handleCopyCode}><ContentCopy /></IconButton></Tooltip>
              <Tooltip title="Download Code"><IconButton onClick={handleDownloadCode}><CloudDownload /></IconButton></Tooltip>
            </Box>

            <Typography variant="body2">Execution Time: {executionTime} ms | Memory: {memoryUsage}</Typography>

            <TextField multiline rows={6} value={output} fullWidth InputProps={{ readOnly: true }} />
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Editor;
