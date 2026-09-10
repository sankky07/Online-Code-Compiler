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
  Divider,
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
  Fullscreen,
  FullscreenExit,
  PlayArrow,
  RestartAlt,
  ZoomIn,
  ZoomOut,
  WrapText,
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

const STORAGE_KEY =
  "online-code-compiler";

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
  const [language, setLanguage] =
    useState("Java");

  const [code, setCode] = useState(
    defaultPrograms.Java
  );

  const [input, setInput] =
    useState("");

  const [output, setOutput] =
    useState("");

  const [errorOutput, setErrorOutput] =
    useState("");

  const [compileOutput, setCompileOutput] =
    useState("");

  const [status, setStatus] =
    useState("");

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

  const [fontSize, setFontSize] =
    useState(14);

  const [wordWrap, setWordWrap] =
    useState(false);

  const [isFullscreen, setIsFullscreen] =
    useState(false);

  const [saveState, setSaveState] =
    useState("Saved");

  const [panelWidth, setPanelWidth] =
    useState(380);

  const outputRef =
    useRef(null);

  const resizeState =
    useRef(null);

  /* =========================
     LOAD SAVED STATE
  ========================= */

  useEffect(() => {
    try {
      const saved =
        localStorage.getItem(
          STORAGE_KEY
        );

      if (!saved) {
        return;
      }

      const parsed =
        JSON.parse(saved);

      if (
        parsed.language &&
        languages[parsed.language]
      ) {
        setLanguage(
          parsed.language
        );
      }

      if (
        typeof parsed.code ===
        "string"
      ) {
        setCode(parsed.code);
      }

      if (
        typeof parsed.input ===
        "string"
      ) {
        setInput(parsed.input);
      }

      if (
        typeof parsed.darkMode ===
        "boolean"
      ) {
        setDarkMode(
          parsed.darkMode
        );
      }

      if (
        parsed.theme &&
        themes[parsed.theme]
      ) {
        setTheme(parsed.theme);
      }

      if (
        typeof parsed.fontSize ===
        "number"
      ) {
        setFontSize(
          parsed.fontSize
        );
      }

      if (
        typeof parsed.wordWrap ===
        "boolean"
      ) {
        setWordWrap(
          parsed.wordWrap
        );
      }
    } catch (error) {
      console.error(
        "Failed to restore saved state:",
        error
      );
    }
  }, []);

  /* =========================
     AUTOSAVE
  ========================= */

  useEffect(() => {
    setSaveState("Saving...");

    const timer = setTimeout(() => {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            language,
            code,
            input,
            darkMode,
            theme,
            fontSize,
            wordWrap,
          })
        );

        setSaveState("Saved");
      } catch (error) {
        console.error(
          "Autosave failed:",
          error
        );

        setSaveState("Not saved");
      }
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [
    language,
    code,
    input,
    darkMode,
    theme,
    fontSize,
    wordWrap,
  ]);

  /* =========================
     THEME
  ========================= */

  const muiTheme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode
            ? "dark"
            : "light",

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

  /* =========================
     CLEAR RESULTS
  ========================= */

  const clearResults =
    useCallback(() => {
      setOutput("");
      setErrorOutput("");
      setCompileOutput("");
      setStatus("");
      setExecutionTime(null);
      setMemoryUsage(null);
    }, []);

  /* =========================
     LANGUAGE
  ========================= */

  const handleLanguageChange =
    (event) => {
      const selectedLanguage =
        event.target.value;

      setLanguage(
        selectedLanguage
      );

      setCode(
        defaultPrograms[
          selectedLanguage
        ]
      );

      clearResults();
    };

  /* =========================
     RUN CODE
  ========================= */

  const handleRun =
    useCallback(async () => {
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
        const response =
          await axios.post(
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

        const data =
          response.data;

        setStatus(
          data.status ||
            "Finished"
        );

        setOutput(
          data.output || ""
        );

        setErrorOutput(
          data.error || ""
        );

        setCompileOutput(
          data.compileOutput ||
            ""
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

        setStatus(
          "Backend Error"
        );

        if (error.response) {
          setErrorOutput(
            error.response.data
              ?.error ||
              `Backend error (${error.response.status})`
          );
        } else if (
          error.request
        ) {
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
    }, [
      code,
      language,
      input,
    ]);

  /* =========================
     COPY CODE
  ========================= */

  const handleCopyCode =
    async () => {
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

  /* =========================
     COPY OUTPUT
  ========================= */

  const handleCopyOutput =
    async () => {
      const combinedOutput =
        [
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

  /* =========================
     DOWNLOAD
  ========================= */

  const handleDownloadCode =
    () => {
      const blob = new Blob(
        [code],
        {
          type: "text/plain;charset=utf-8",
        }
      );

      const url =
        URL.createObjectURL(
          blob
        );

      const anchor =
        document.createElement(
          "a"
        );

      anchor.href = url;

      anchor.download =
        `main.${languages[language].extensionName}`;

      document.body.appendChild(
        anchor
      );

      anchor.click();

      document.body.removeChild(
        anchor
      );

      URL.revokeObjectURL(
        url
      );
    };

  /* =========================
     RESET
  ========================= */

  const handleResetCode =
    () => {
      setCode(
        defaultPrograms[language]
      );

      clearResults();
    };

  /* =========================
     FULLSCREEN
  ========================= */

  const toggleFullscreen =
    useCallback(() => {
      setIsFullscreen(
        (previous) =>
          !previous
      );
    }, []);

  /* =========================
     FONT SIZE
  ========================= */

  const increaseFontSize =
    () => {
      setFontSize(
        (size) =>
          Math.min(
            size + 1,
            24
          )
      );
    };

  const decreaseFontSize =
    () => {
      setFontSize(
        (size) =>
          Math.max(
            size - 1,
            10
          )
      );
    };

  /* =========================
     RESIZE START
  ========================= */

  const startResize =
    (event) => {
      event.preventDefault();

      resizeState.current = {
        startX: event.clientX,
        startWidth: panelWidth,
      };

      document.body.style.cursor =
        "col-resize";

      document.body.style.userSelect =
        "none";

      window.addEventListener(
        "mousemove",
        handleResize
      );

      window.addEventListener(
        "mouseup",
        stopResize
      );
    };

  /* =========================
     RESIZE MOVE
  ========================= */

  const handleResize =
    (event) => {
      if (!resizeState.current) {
        return;
      }

      const difference =
        resizeState.current.startX -
        event.clientX;

      const newWidth =
        resizeState.current.startWidth +
        difference;

      setPanelWidth(
        Math.min(
          Math.max(
            newWidth,
            300
          ),
          600
        )
      );
    };

  /* =========================
     RESIZE STOP
  ========================= */

  const stopResize =
    () => {
      resizeState.current =
        null;

      document.body.style.cursor =
        "";

      document.body.style.userSelect =
        "";

      window.removeEventListener(
        "mousemove",
        handleResize
      );

      window.removeEventListener(
        "mouseup",
        stopResize
      );
    };

  /* =========================
     RESIZE CLEANUP
  ========================= */

  useEffect(() => {
    return () => {
      resizeState.current =
        null;

      document.body.style.cursor =
        "";

      document.body.style.userSelect =
        "";

      window.removeEventListener(
        "mousemove",
        handleResize
      );

      window.removeEventListener(
        "mouseup",
        stopResize
      );
    };
  }, []);

  /* =========================
     KEYBOARD SHORTCUTS
  ========================= */

  useEffect(() => {
    const handleKeyboardShortcut =
      (event) => {
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

        if (
          (event.ctrlKey ||
            event.metaKey) &&
          event.key === "s"
        ) {
          event.preventDefault();
        }

        if (
          event.key === "F11"
        ) {
          event.preventDefault();

          toggleFullscreen();
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
  }, [
    handleRun,
    isRunning,
    toggleFullscreen,
  ]);

  /* =========================
     AUTO SCROLL
  ========================= */

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop =
        outputRef.current
          .scrollHeight;
    }
  }, [
    output,
    errorOutput,
    compileOutput,
  ]);

  /* =========================
     CODE STATISTICS
  ========================= */

  const lineCount =
    code.length === 0
      ? 0
      : code.split("\n").length;

  const characterCount =
    code.length;

  const hasResult =
    Boolean(output) ||
    Boolean(errorOutput) ||
    Boolean(compileOutput);

  return (
    <ThemeProvider
      theme={muiTheme}
    >
      <Box
        className={`compiler-app ${
          isFullscreen
            ? "compiler-fullscreen"
            : ""
        }`}
      >

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
              {Object.keys(
                themes
              ).map(
                (themeName) => (
                  <MenuItem
                    key={themeName}
                    value={
                      themeName
                    }
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

          {/* EDITOR */}

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

                <Chip
                  label={
                    saveState
                  }
                  size="small"
                  variant="outlined"
                  className="save-chip"
                />

              </Box>

              <Box className="editor-actions">

                <Tooltip
                  title={
                    wordWrap
                      ? "Disable word wrap"
                      : "Enable word wrap"
                  }
                >
                  <IconButton
                    size="small"
                    onClick={() =>
                      setWordWrap(
                        (value) =>
                          !value
                      )
                    }
                  >
                    <WrapText fontSize="small" />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Decrease font size">
                  <IconButton
                    size="small"
                    onClick={
                      decreaseFontSize
                    }
                  >
                    <ZoomOut fontSize="small" />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Increase font size">
                  <IconButton
                    size="small"
                    onClick={
                      increaseFontSize
                    }
                  >
                    <ZoomIn fontSize="small" />
                  </IconButton>
                </Tooltip>

                <Tooltip
                  title={
                    copied
                      ? "Copied!"
                      : "Copy code"
                  }
                >
                  <IconButton
                    size="small"
                    onClick={
                      handleCopyCode
                    }
                  >
                    <ContentCopy fontSize="small" />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Reset code">
                  <IconButton
                    size="small"
                    onClick={
                      handleResetCode
                    }
                  >
                    <RestartAlt fontSize="small" />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Download code">
                  <IconButton
                    size="small"
                    onClick={
                      handleDownloadCode
                    }
                  >
                    <Download fontSize="small" />
                  </IconButton>
                </Tooltip>

                <Tooltip
                  title={
                    isFullscreen
                      ? "Exit fullscreen"
                      : "Fullscreen"
                  }
                >
                  <IconButton
                    size="small"
                    onClick={
                      toggleFullscreen
                    }
                  >
                    {isFullscreen ? (
                      <FullscreenExit fontSize="small" />
                    ) : (
                      <Fullscreen fontSize="small" />
                    )}
                  </IconButton>
                </Tooltip>

              </Box>

            </Box>

            <Box
              className={`code-editor ${
                wordWrap
                  ? "word-wrap-enabled"
                  : ""
              }`}
              style={{
                fontSize: `${fontSize}px`,
              }}
            >
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

              <Box className="footer-left">

                <Typography variant="caption">
                  {language}
                </Typography>

                <Divider
                  orientation="vertical"
                  flexItem
                />

                <Typography variant="caption">
                  {lineCount} lines
                </Typography>

                <Divider
                  orientation="vertical"
                  flexItem
                />

                <Typography variant="caption">
                  {characterCount} chars
                </Typography>

              </Box>

              <Box className="footer-right">

                <Typography variant="caption">
                  Ctrl + Enter
                </Typography>

                <Typography variant="caption">
                  Run
                </Typography>

              </Box>

            </Box>

          </Box>

          {/* RESIZE HANDLE */}

          <Box
            className="resize-handle"
            onMouseDown={
              startResize
            }
          />

          {/* SIDE PANEL */}

          <Box
            className="side-panel"
            style={{
              width: `${panelWidth}px`,
            }}
          >

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

            {/* RUN */}

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

            {/* TERMINAL */}

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

            {/* OUTPUT */}

            <Box
              className="output-container"
              ref={outputRef}
            >

              {!hasResult &&
                !isRunning && (
                  <Box className="empty-output">

                    <Box className="terminal-symbol">
                      {">_"}
                    </Box>

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
