import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import axios from "axios";
import "./Editor.css";

import {
  Box,
  Button,
  Chip,
  IconButton,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import {
  Brightness4,
  Brightness7,
  Clear,
  ContentCopy,
  Download,
  PlayArrow,
  RestartAlt,
} from "@mui/icons-material";

import {
  createTheme,
  ThemeProvider,
} from "@mui/material/styles";

import CodeMirror from "@uiw/react-codemirror";

import { java } from "@codemirror/lang-java";
import { cpp } from "@codemirror/lang-cpp";
import { python } from "@codemirror/lang-python";
import { javascript } from "@codemirror/lang-javascript";

import {
  githubDark,
  dracula,
  eclipse,
} from "@uiw/codemirror-themes-all";

const BACKEND_URL =
  "https://online-code-compiler-ljop.onrender.com";

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

  C: `#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}`,

  Python: `print("Hello, World!")`,

  JavaScript: `console.log("Hello, World!");`,
};

const languages = {
  Java: {
    extension: java(),
    extensionName: "java",
  },

  "C++": {
    extension: cpp(),
    extensionName: "cpp",
  },

  C: {
    extension: cpp(),
    extensionName: "c",
  },

  Python: {
    extension: python(),
    extensionName: "py",
  },

  JavaScript: {
    extension: javascript(),
    extensionName: "js",
  },
};

const themes = {
  "GitHub Dark": githubDark,
  Dracula: dracula,
  Eclipse: eclipse,
};

const getStatusType = (status) => {
  if (!status) {
    return "default";
  }

  const value = status.toLowerCase();

  if (value === "accepted") {
    return "success";
  }

  if (
    value.includes("error") ||
    value.includes("failed") ||
    value.includes("time limit") ||
    value.includes("memory limit")
  ) {
    return "error";
  }

  if (
    value.includes("queue") ||
    value.includes("processing") ||
    value.includes("running")
  ) {
    return "warning";
  }

  return "default";
};

const Editor = () => {
  const [language, setLanguage] = useState("Java");

  const [code, setCode] = useState(
    defaultPrograms.Java
  );

  const [input, setInput] = useState("");

  const [output, setOutput] = useState("");
  const [errorOutput, setErrorOutput] = useState("");
  const [compileOutput, setCompileOutput] =
    useState("");

  const [status, setStatus] = useState("");

  const [executionTime, setExecutionTime] =
    useState(null);

  const [memoryUsage, setMemoryUsage] =
    useState(null);

  const [isRunning, setIsRunning] =
    useState(false);

  const [darkMode, setDarkMode] =
    useState(true);

  const [theme, setTheme] =
    useState("GitHub Dark");

  const [copied, setCopied] =
    useState(false);

  const outputRef = useRef(null);

  const muiTheme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? "dark" : "light",

          primary: {
            main: darkMode
              ? "#58a6ff"
              : "#1976d2",
          },

          background: {
            default: darkMode
              ? "#0d1117"
              : "#f5f7fa",

            paper: darkMode
              ? "#161b22"
              : "#ffffff",
          },
        },

        shape: {
          borderRadius: 10,
        },
      }),
    [darkMode]
  );

  const clearResults = useCallback(() => {
    setOutput("");
    setErrorOutput("");
    setCompileOutput("");
    setStatus("");
    setExecutionTime(null);
    setMemoryUsage(null);
  }, []);

  const handleLanguageChange = (event) => {
    const selectedLanguage =
      event.target.value;

    setLanguage(selectedLanguage);

    setCode(
      defaultPrograms[selectedLanguage]
    );

    clearResults();
  };

  const handleRun = useCallback(async () => {
    if (!code.trim()) {
      setStatus("No Code");

      setOutput(
        "Please enter some code before running."
      );

      return;
    }

    setIsRunning(true);

    setStatus("Running");

    setOutput("");
    setErrorOutput("");
    setCompileOutput("");

    setExecutionTime(null);
    setMemoryUsage(null);

    try {
      const response = await axios.post(
        `${BACKEND_URL}/execute`,
        {
          code,
          language,
          input: input || "",
        },
        {
          timeout: 60000,
        }
      );

      const data = response.data;

      setStatus(
        data.status || "Finished"
      );

      setOutput(
        data.output || ""
      );

      setErrorOutput(
        data.error || ""
      );

      setCompileOutput(
        data.compileOutput || ""
      );

      setExecutionTime(
        data.executionTime
      );

      setMemoryUsage(
        data.memoryUsage
      );
    } catch (error) {
      console.error(
        "Execution error:",
        error
      );

      setStatus("Backend Error");

      if (error.response) {
        setErrorOutput(
          error.response.data?.error ||
            `Backend error (${error.response.status})`
        );
      } else if (error.request) {
        setErrorOutput(
          "Could not connect to the backend. Please try again."
        );
      } else {
        setErrorOutput(
          error.message ||
            "Unknown execution error."
        );
      }
    } finally {
      setIsRunning(false);
    }
  }, [code, language, input]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(
        code
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch (error) {
      console.error(
        "Copy failed:",
        error
      );
    }
  };

  const handleCopyOutput = async () => {
    const combinedOutput = [
      output,
      compileOutput,
      errorOutput,
    ]
      .filter(Boolean)
      .join("\n\n");

    if (!combinedOutput) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        combinedOutput
      );
    } catch (error) {
      console.error(
        "Copy output failed:",
        error
      );
    }
  };

  const handleDownloadCode = () => {
    const blob = new Blob(
      [code],
      {
        type: "text/plain;charset=utf-8",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const anchor =
      document.createElement("a");

    anchor.href = url;

    anchor.download =
      `main.${languages[language].extensionName}`;

    document.body.appendChild(anchor);

    anchor.click();

    document.body.removeChild(anchor);

    URL.revokeObjectURL(url);
  };

  const handleResetCode = () => {
    setCode(
      defaultPrograms[language]
    );

    clearResults();
  };

  useEffect(() => {
    const handleKeyboardShortcut = (
      event
    ) => {
      if (
        (event.ctrlKey ||
          event.metaKey) &&
        event.key === "Enter"
      ) {
        event.preventDefault();

        if (!isRunning) {
          handleRun();
        }
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyboardShortcut
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyboardShortcut
      );
    };
  }, [handleRun, isRunning]);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop =
        outputRef.current.scrollHeight;
    }
  }, [
    output,
    errorOutput,
    compileOutput,
  ]);

  const hasResult =
    Boolean(output) ||
    Boolean(errorOutput) ||
    Boolean(compileOutput);

  return (
    <ThemeProvider theme={muiTheme}>
      <Box className="compiler-app">

        {/* HEADER */}

        <Box className="compiler-header">

          <Box className="brand-section">

            <Box className="brand-icon">
              {"</>"}
            </Box>

            <Box>
              <Typography className="brand-title">
                Online Code Compiler
              </Typography>

              <Typography className="brand-subtitle">
                Write • Run • Experiment
              </Typography>
            </Box>

          </Box>

          <Box className="header-controls">

            <Select
              value={language}
              onChange={
                handleLanguageChange
              }
              size="small"
              className="language-select"
            >
              {Object.keys(
                languages
              ).map((lang) => (
                <MenuItem
                  key={lang}
                  value={lang}
                >
                  {lang}
                </MenuItem>
              ))}
            </Select>

            <Select
              value={theme}
              onChange={(event) =>
                setTheme(
                  event.target.value
                )
              }
              size="small"
              className="theme-select"
            >
              {Object.keys(themes).map(
                (themeName) => (
                  <MenuItem
                    key={themeName}
                    value={themeName}
                  >
                    {themeName}
                  </MenuItem>
                )
              )}
            </Select>

            <Tooltip
              title={
                darkMode
                  ? "Light mode"
                  : "Dark mode"
              }
            >
              <IconButton
                onClick={() =>
                  setDarkMode(
                    (previous) =>
                      !previous
                  )
                }
              >
                {darkMode ? (
                  <Brightness7 />
                ) : (
                  <Brightness4 />
                )}
              </IconButton>
            </Tooltip>

          </Box>

        </Box>

        {/* MAIN */}

        <Box className="compiler-main">

          {/* CODE EDITOR */}

          <Box className="editor-panel">

            <Box className="panel-header">

              <Box className="panel-title">

                <span className="status-dot" />

                <Typography>
                  main.
                  {
                    languages[
                      language
                    ].extensionName
                  }
                </Typography>

              </Box>

              <Box className="editor-actions">

                <Tooltip
                  title={
                    copied
                      ? "Copied!"
                      : "Copy code"
                  }
                >
                  <IconButton
                    onClick={
                      handleCopyCode
                    }
                  >
                    <ContentCopy fontSize="small" />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Reset code">
                  <IconButton
                    onClick={
                      handleResetCode
                    }
                  >
                    <RestartAlt fontSize="small" />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Download code">
                  <IconButton
                    onClick={
                      handleDownloadCode
                    }
                  >
                    <Download fontSize="small" />
                  </IconButton>
                </Tooltip>

              </Box>

            </Box>

            <Box className="code-editor">

              <CodeMirror
                value={code}
                height="100%"
                theme={
                  themes[theme]
                }
                extensions={[
                  languages[
                    language
                  ].extension,
                ]}
                onChange={(value) =>
                  setCode(value)
                }
                basicSetup={{
                  lineNumbers: true,
                  foldGutter: true,
                  dropCursor: true,
                  allowMultipleSelections:
                    true,
                  indentOnInput: true,
                  bracketMatching: true,
                  closeBrackets: true,
                  autocompletion: true,
                  highlightSelectionMatches:
                    true,
                }}
              />

            </Box>

            <Box className="editor-footer">

              <Typography variant="caption">
                {language}
              </Typography>

              <Typography variant="caption">
                Ctrl + Enter to run
              </Typography>

            </Box>

          </Box>

          {/* RIGHT PANEL */}

          <Box className="side-panel">

            {/* INPUT */}

            <Box className="side-section">

              <Box className="section-header">

                <Typography className="section-title">
                  Input
                </Typography>

                <Typography
                  variant="caption"
                  className="section-hint"
                >
                  stdin
                </Typography>

              </Box>

              <TextField
                multiline
                minRows={4}
                maxRows={7}
                fullWidth
                value={input}
                onChange={(event) =>
                  setInput(
                    event.target.value
                  )
                }
                placeholder="Enter program input..."
              />

            </Box>

            {/* RUN CONTROLS */}

            <Box className="run-controls">

              <Button
                variant="contained"
                startIcon={
                  <PlayArrow />
                }
                onClick={
                  handleRun
                }
                disabled={
                  isRunning
                }
                fullWidth
                className="run-button"
              >
                {isRunning
                  ? "Running..."
                  : "Run Code"}
              </Button>

              <Button
                variant="outlined"
                startIcon={
                  <Clear />
                }
                onClick={
                  clearResults
                }
                disabled={
                  isRunning
                }
                className="clear-button"
              >
                Clear
              </Button>

            </Box>

            {/* TERMINAL HEADER */}

            <Box className="result-header">

              <Box className="terminal-title">

                <Typography className="section-title">
                  Terminal
                </Typography>

                {status && (
                  <Chip
                    label={status}
                    size="small"
                    color={getStatusType(
                      status
                    )}
                  />
                )}

              </Box>

              {hasResult && (
                <Tooltip title="Copy output">
                  <IconButton
                    size="small"
                    onClick={
                      handleCopyOutput
                    }
                  >
                    <ContentCopy fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}

            </Box>

            {/* TERMINAL */}

            <Box
              className="output-container"
              ref={outputRef}
            >

              {!hasResult &&
                !isRunning && (
                  <Box className="empty-output">

                    <Typography>
                      Terminal is ready
                    </Typography>

                    <Typography variant="caption">
                      Run your program to see the output
                    </Typography>

                  </Box>
                )}

              {isRunning && (
                <Box className="running-state">

                  <Box className="spinner" />

                  <Typography>
                    Executing{" "}
                    {language}...
                  </Typography>

                  <Typography variant="caption">
                    Judge0 is processing your program
                  </Typography>

                </Box>
              )}

              {output && (
                <Box className="output-block">

                  <Typography className="output-label">
                    STDOUT
                  </Typography>

                  <pre>
                    {output}
                  </pre>

                </Box>
              )}

              {compileOutput && (
                <Box className="output-block error-block">

                  <Typography className="output-label">
                    COMPILATION ERROR
                  </Typography>

                  <pre>
                    {compileOutput}
                  </pre>

                </Box>
              )}

              {errorOutput && (
                <Box className="output-block error-block">

                  <Typography className="output-label">
                    STDERR
                  </Typography>

                  <pre>
                    {errorOutput}
                  </pre>

                </Box>
              )}

            </Box>

            {/* METRICS */}

            {(executionTime ||
              memoryUsage) && (
              <Box className="metrics">

                {executionTime && (
                  <Typography variant="caption">
                    ⚡{" "}
                    {executionTime}s
                  </Typography>
                )}

                {memoryUsage && (
                  <Typography variant="caption">
                    ◈{" "}
                    {memoryUsage} KB
                  </Typography>
                )}

              </Box>
            )}

          </Box>

        </Box>

      </Box>
    </ThemeProvider>
  );
};

export default Editor;
