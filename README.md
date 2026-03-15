# 🔍 Veritas AI: Agentic News Claim Verifier

An advanced, real-time agentic AI news verifier. This application checks news claims, headlines, and statements against live web search results using the Gemini 2.5 Flash model with built-in search tool capabilities, returning structured verdicts (True, Likely False, Misleading, or Unverified), confidence levels, key findings, checked sources, and potential red flags.

---

## 🚀 Key Features

*   **Agentic AI Verification**: Uses the Gemini API with active Google Search tool integration to query, browse, and synthesize real-time information from across the web.
*   **Structured Verdicts**: Provides clear, color-coded outcomes: `VERIFIED TRUE`, `LIKELY FALSE`, `MISLEADING`, and `UNVERIFIED`.
*   **Confidence Meter**: Includes a visual transition-enabled confidence bar showing the certainty score of the verdict.
*   **Deep Analysis Breakdown**:
    *   **Key Findings**: Key facts extracted from web search.
    *   **Red Flags**: Potential discrepancies, missing context, or biases found.
    *   **Sources Checked**: Highlighting the outlets verified (e.g. BBC, Reuters, etc.).
    *   **Actionable Advice**: Tailored guidance on how to read and interpret the claim.
*   **Interactive UI**:
    *   One-click example chips to test standard claims.
    *   Recent verification history tracker.
    *   CMD + Enter keyboard shortcuts.

---

## 🛠️ Tech Stack

*   **Frontend**: React (v19) + Vite (v8) + Vanilla CSS (Aesthetic glassmorphism, responsive grid layouts, and custom keyframe animations)
*   **Backend**: Node.js & Express (acting as a secure API key proxy/handler)
*   **AI Integration**: Gemini 2.5 Flash (`google_search` tools integration)

---

## 📥 Setup & Installation

### 1. Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).

### 2. Clone and Clean Install Dependencies
Run the following commands in your terminal:
```bash
# Clean install npm dependencies
npm install
```

### 3. macOS/Linux Executable Permissions (Troubleshooting)
If you run `npm run dev` and encounter a `Permission denied` error like:
```
sh: node_modules/.bin/concurrently: Permission denied
```
This means the npm package binaries in the local `node_modules` lost their executable bits. Fix this by granting executable permissions:
```bash
chmod +x node_modules/.bin/concurrently node_modules/.bin/vite node_modules/.bin/eslint node_modules/.bin/conc node_modules/.bin/tree-kill
```

### 4. Configuration (`.env`)
The backend server requires a Gemini API key. 
1. Copy the template file:
   ```bash
   cp .env.example .env
   ```
2. Open the new `.env` file and insert your API key:
   ```env
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   ```
   *(Alternatively, you can input your API key directly in the UI Settings Panel if configured).*

---

## 🏃 Running the Project

To start both the React frontend and the Express backend simultaneously, run:
```bash
npm run dev
```

*   **Frontend Dev Server**: Defaults to `http://localhost:5173` (or `http://localhost:5174` if port 5173 is occupied)
*   **Backend Proxy Server**: Runs on `http://localhost:3001`

---

## 📂 Project Structure

```
├── .env.example           # Template for environment variables
├── .env                   # Local configuration (Git ignored)
├── package.json           # Scripts and dependencies
├── vite.config.js         # Vite configuration with API Proxy setup
├── server.js              # Express backend API server (Gemini proxy)
├── index.html             # Entry HTML document
├── src/
│   ├── main.jsx          # Entry Javascript loader
│   ├── App.jsx           # Main application shell
│   ├── App.css           # Styling rules
│   ├── NewsVerifier.jsx  # Main interactive fact-checker component
│   └── index.css         # Styling system & global styles
```
