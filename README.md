# dev-pipeline-agents

Multi-agent development pipeline using **Google ADK** + **Claude Code** + **Linear** + **Pencil**.

## How it works

A single prompt triggers a full pipeline:

```
User prompt
  └── PO Agent     → writes task spec + creates card in Linear
  └── UX Agent     → Claude Code uses Pencil MCP to design wireframes (.pen files)
  └── DEV Agent    → Claude Code reads wireframes via Pencil MCP + implements the feature
```

## Stack

- **[Google ADK](https://google.github.io/adk-docs/)** (TypeScript) — multi-agent orchestration
- - **[Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code)** — AI coding + MCP client
  - - **[Pencil](https://docs.pencil.dev/)** — design tool with local MCP server
    - - **[Linear SDK](https://developers.linear.app/docs/sdk/getting-started)** — issue tracking
     
      - ## Prerequisites
     
      - 1. **Node.js** 20+
        2. 2. **Claude Code CLI** installed and authenticated
           3.    ```bash
                    npm install -g @anthropic-ai/claude-code-cli
                    claude   # login via browser
                    ```
                 3. **Pencil** extension installed in VS Code or Cursor (starts MCP server automatically)
                 4. 4. **Linear** account with a Personal API Key
                   
                    5. ## Setup
                   
                    6. ```bash
                       # 1. Clone the repo
                       git clone https://github.com/marcielfelipe/dev-pipeline-agents.git
                       cd dev-pipeline-agents

                       # 2. Install dependencies
                       npm install

                       # 3. Configure environment
                       cp .env.example .env
                       # Edit .env with your ANTHROPIC_API_KEY, LINEAR_API_KEY, LINEAR_TEAM_ID

                       # 4. Open the project in VS Code or Cursor (starts the Pencil MCP server)
                       code .
                       ```

                       ## Running

                       ```bash
                       # Web UI (recommended)
                       npx adk web

                       # Or terminal mode
                       npx adk run src/agent.ts
                       ```

                       Open http://localhost:8000 and send a feature request, e.g.:

                       > "Create a login screen with email/password and a dashboard with sidebar and metric cards"
                       >
                       > ## Project structure
                       >
                       > ```
                       > dev-pipeline-agents/
                       > ├── src/
                       > │   ├── agent.ts          # Main pipeline (SequentialAgent: PO -> UX -> DEV)
                       > │   └── tools/
                       > │       ├── linear.ts     # Creates cards in Linear via SDK
                       > │       ├── pencil.ts     # Calls Claude Code to design screens via Pencil MCP
                       > │       └── dev.ts        # Calls Claude Code to implement the feature
                       > ├── designs/              # Generated .pen files and task-spec.md (auto-created)
                       > ├── .env.example
                       > ├── package.json
                       > └── tsconfig.json
                       > ```
                       >
                       > ## Environment variables
                       >
                       > | Variable | Description |
                       > |---|---|
                       > | `ANTHROPIC_API_KEY` | Anthropic API key (for ADK LlmAgents) |
                       > | `LINEAR_API_KEY` | Linear Personal API Key |
                       > | `LINEAR_TEAM_ID` | Linear Team UUID (Cmd+K → "Copy model UUID") |
                       > | `DESIGNS_DIR` | Directory for .pen files (default: `./designs`) |
                       > | `PROJECT_DIR` | Your project source directory (default: `./src`) |
