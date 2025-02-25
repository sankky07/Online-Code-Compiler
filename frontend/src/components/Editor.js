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
  CircularProgress,
} from "@mui/material";
import { Brightness4, Brightness7, ContentCopy } from "@mui/icons-material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CodeMirror from "@uiw/react-codemirror";
import { java } from "@codemirror/lang-java";
import { cpp } from "@codemirror/lang-cpp";
import { python } from "@codemirror/lang-python";

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

const languages = {
  Java: { id: "java", extension: java() },
  "C++": { id: "cpp", extension: cpp() },
  Python: { id: "python", extension: python() },
  C: { id: "c", extension: cpp() },
};

const Editor = () => {
  const [language, setLanguage] = useState("Java");
  const [code, setCode] = useState(defaultPrograms["Java"]);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  const handleRun = async () => {
    setLoading(true);
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
      setOutput("Execution failed.");
    }
    setLoading(false);
  };

  const handleLanguageChange = (e) => {
    const selectedLang = e.target.value;
    setLanguage(selectedLang);
    setCode(defaultPrograms[selectedLang]);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
  };

  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
      primary: { main: darkMode ? "#90caf9" : "#1976d2" },
      background: { default: darkMode ? "#1e1e1e" : "#ffffff" },
      text: { primary: darkMode ? "#ffffff" : "#000000" },
    },
    typography: {
      fontFamily: "Fira Code, monospace",
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
          padding: 2,
        }}
      >
        {/* Code Editor */}
        <Box sx={{ flex: 1, padding: 2, position: "relative" }}>
          <Tooltip title="Toggle Dark Mode">
            <IconButton
              onClick={toggleDarkMode}
              sx={{ position: "absolute", top: 10, right: 10 }}
            >
              {darkMode ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </Tooltip>

          <Typography variant="h6" sx={{ marginBottom: 1 }}>
            Code Editor
          </Typography>

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
              height="75vh"
              theme={darkMode ? "dark" : "light"}
              extensions={[languages[language].extension]}
              onChange={(newCode) => setCode(newCode)}
            />
          </Box>
        </Box>

        {/* Right Panel */}
        <Box
          sx={{
            width: "30%",
            padding: 2,
            borderLeft: "2px solid",
            borderColor: darkMode ? "#ffffff22" : "#00000022",
            display: "flex",
            flexDirection: "column",
            minWidth: 300,
          }}
        >
          <Typography variant="h6" sx={{ marginBottom: 1 }}>
            Settings
          </Typography>

          <TextField
            select
            label="Select Language"
            value={language}
            onChange={handleLanguageChange}
            fullWidth
            sx={{ marginBottom: 2, bgcolor: "background.paper" }}
          >
            {Object.keys(languages).map((lang) => (
              <MenuItem key={lang} value={lang}>
                {lang}
              </MenuItem>
            ))}
          </TextField>

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

          <Button
            variant="contained"
            color="primary"
            onClick={handleRun}
            sx={{
              marginBottom: 2,
              padding: "10px",
              fontSize: "16px",
              fontWeight: "bold",
              textTransform: "none",
            }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} sx={{ color: "white" }} /> : "Run Code"}
          </Button>

          <Typography variant="subtitle1">Output</Typography>
          <Box sx={{ position: "relative" }}>
            <TextField
              multiline
              rows={6}
              value={output}
              fullWidth
              InputProps={{ readOnly: true }}
              sx={{ bgcolor: "background.paper" }}
            />
            <Tooltip title="Copy Output">
              <IconButton
                onClick={copyToClipboard}
                sx={{ position: "absolute", top: 5, right: 5 }}
              >
                <ContentCopy />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Editor;
