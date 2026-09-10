.compiler-app {
  height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--compiler-background);
}

.compiler-header {
  min-height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  border-bottom: 1px solid rgba(128, 128, 128, 0.2);
  background: var(--compiler-surface);
  flex-shrink: 0;
}

.brand-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 13px;
  background: #1976d2;
  color: white;
}

.brand-title {
  font-size: 15px !important;
  font-weight: 700 !important;
}

.brand-subtitle {
  font-size: 11px !important;
  opacity: 0.6;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.language-select,
.theme-select {
  min-width: 125px;
}

.compiler-main {
  flex: 1;
  min-height: 0;
  display: flex;
  gap: 1px;
  background: rgba(128, 128, 128, 0.2);
}

.editor-panel {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  background: var(--compiler-surface);
}

.panel-header {
  height: 46px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(128, 128, 128, 0.15);
  flex-shrink: 0;
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.panel-title p {
  font-size: 12px;
  opacity: 0.8;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #4caf50;
}

.editor-actions {
  display: flex;
  align-items: center;
}

.code-editor {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.code-editor .cm-editor {
  height: 100%;
  font-size: 14px;
}

.code-editor .cm-scroller {
  overflow: auto;
}

.editor-footer {
  height: 30px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid rgba(128, 128, 128, 0.15);
  opacity: 0.65;
  flex-shrink: 0;
}

.side-panel {
  width: 380px;
  max-width: 40%;
  display: flex;
  flex-direction: column;
  background: var(--compiler-surface);
  min-height: 0;
}

.side-section {
  padding: 14px;
  flex-shrink: 0;
}

.section-header,
.result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 9px;
}

.section-title {
  font-size: 13px !important;
  font-weight: 700 !important;
}

.section-hint {
  opacity: 0.5;
}

.run-controls {
  display: flex;
  gap: 8px;
  padding: 0 14px 14px;
}

.run-button {
  height: 42px;
  font-weight: 700 !important;
  text-transform: none !important;
}

.clear-button {
  height: 42px;
  min-width: 90px;
  text-transform: none !important;
}

.result-header {
  padding: 14px 14px 8px;
  margin: 0;
  border-top: 1px solid rgba(128, 128, 128, 0.15);
}

.output-container {
  flex: 1;
  min-height: 150px;
  margin: 0 14px 14px;
  padding: 14px;
  overflow: auto;
  border-radius: 8px;
  background: rgba(128, 128, 128, 0.08);
  border: 1px solid rgba(128, 128, 128, 0.15);
}

.empty-output {
  height: 100%;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 6px;
  opacity: 0.5;
}

.output-block {
  margin-bottom: 14px;
}

.output-label {
  font-size: 10px !important;
  font-weight: 800 !important;
  letter-spacing: 0.8px;
  opacity: 0.6;
  margin-bottom: 6px !important;
}

.output-block pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: "Consolas", "Monaco", monospace;
  font-size: 13px;
  line-height: 1.6;
}

.error-block {
  padding: 10px;
  border-radius: 6px;
  background: rgba(244, 67, 54, 0.08);
  border-left: 3px solid #f44336;
}

.metrics {
  display: flex;
  gap: 16px;
  padding: 0 14px 12px;
  opacity: 0.65;
}

@media (max-width: 900px) {
  .side-panel {
    width: 320px;
  }
}

@media (max-width: 768px) {
  .compiler-app {
    height: auto;
    min-height: 100vh;
    overflow: auto;
  }

  .compiler-header {
    min-height: auto;
    padding: 12px;
    gap: 12px;
    flex-wrap: wrap;
  }

  .header-controls {
    width: 100%;
    justify-content: flex-end;
  }

  .compiler-main {
    flex-direction: column;
    min-height: calc(100vh - 100px);
  }

  .editor-panel {
    min-height: 55vh;
  }

  .side-panel {
    width: 100%;
    max-width: none;
    min-height: 600px;
  }

  .language-select,
  .theme-select {
    flex: 1;
  }
}
