import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const PROJECT_DIR = process.env.PROJECT_DIR ?? './src';
const DESIGNS_DIR = process.env.DESIGNS_DIR ?? './designs';

/**
 * Uses Claude Code CLI to implement a feature.
  * Claude Code reads the .pen wireframes via the Pencil MCP server
   * and generates the corresponding code.
    *
     * Prerequisites:
      *  - Pencil extension running in VS Code / Cursor (MCP server active)
       *  - Claude Code CLI authenticated
        *
         * @param taskSpec    Full task description in markdown
          * @param screenNames List of screen names that were designed (e.g. ["login", "dashboard"])
           */
export async function implementTask(
    taskSpec: string,
    screenNames: string[]
  ): Promise<string> {
    fs.mkdirSync(PROJECT_DIR, { recursive: true });

    const specPath = path.resolve(DESIGNS_DIR, 'task-spec.md');
    const penFilesList = screenNames
          .map((name) => `- ${path.resolve(DESIGNS_DIR, `${name}.pen`)}`)
          .join('\n');

    const prompt = `
      You are a senior software developer. Implement the following feature based on the task specification and UX wireframes.

      Task specification: ${specPath}

  Wireframe files (use Pencil MCP tools to read and understand the designs):
  ${penFilesList}

  Instructions:
  1. Read the task spec to understand requirements and acceptance criteria
    2. Use mcp__pencil__batch_get to read each wireframe and understand the UI structure
    3. Use mcp__pencil__get_screenshot to visually verify the designs
    4. Implement the feature following the existing project patterns and tech stack
    5. Write clean, typed, maintainable code
      6. Add unit tests for the main business logic
      7. Ensure the implementation matches the wireframes exactly

      Work inside: ${path.resolve(PROJECT_DIR)}
  `.trim();

      try {
        execSync(
                `claude -p "${prompt.replace(/"/g, '\\"')}" --allowedTools "mcp__pencil__batch_get,mcp__pencil__get_screenshot,Bash,Read,Write,Edit,MultiEdit"`,
          { cwd: path.resolve(PROJECT_DIR), stdio: 'inherit' }
              );
        return `Implementation complete. Files written to ${path.resolve(PROJECT_DIR)}`;
  } catch (err) {
        return `Implementation error: ${String(err)}`;
  }
}
