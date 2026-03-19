import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const DESIGNS_DIR = process.env.DESIGNS_DIR ?? './designs';

/**
 * Uses Claude Code CLI with the Pencil MCP server to create wireframes.
  *
   * Prerequisites:
    *  - Pencil extension running in VS Code / Cursor (starts MCP server automatically)
     *  - Claude Code CLI authenticated: run `claude` once to log in
      *
       * @param taskSpec  Full task description in markdown (saved as task-spec.md)
        * @param screens   List of screen names to design, e.g. ["login", "dashboard"]
         */
         export async function designScreens(
           taskSpec: string,
             screens: string[]
             ): Promise<string> {
               fs.mkdirSync(DESIGNS_DIR, { recursive: true });

                 // Save task spec so Claude Code can read it as context
                   const specPath = path.resolve(DESIGNS_DIR, 'task-spec.md');
                     fs.writeFileSync(specPath, taskSpec, 'utf-8');

                       const results: string[] = [];

                         for (const screenName of screens) {
                             const penPath = path.resolve(DESIGNS_DIR, `${screenName}.pen`);

                                 // Pencil CLI requires the .pen file to already exist
                                     if (!fs.existsSync(penPath)) {
                                           fs.writeFileSync(penPath, JSON.stringify({ version: '1', children: [] }), 'utf-8');
                                               }

                                                   const prompt = `
                                                   You are a UX designer. Using the Pencil MCP tools available to you, create a wireframe for the screen: "${screenName}".

                                                   Read the task specification from: ${specPath}
                                                   Write the design directly to the Pencil file: ${penPath}

                                                   Design requirements:
                                                   - Create a clear, functional layout that covers everything in the spec for this screen
                                                   - Use frame, text, rectangle and other Pencil elements appropriately
                                                   - Apply proper spacing, visual hierarchy and grouping
                                                   - Name the root frame "${screenName}"
                                                   - After creating, call get_screenshot to verify the output
                                                   `.trim();

                                                       try {
                                                             execSync(
                                                                     `claude -p "${prompt.replace(/"/g, '\\"')}" --allowedTools "mcp__pencil__batch_design,mcp__pencil__batch_get,mcp__pencil__get_screenshot,mcp__pencil__snapshot_layout"`,
                                                                             { cwd: path.resolve(DESIGNS_DIR), stdio: 'inherit' }
                                                                                   );
                                                                                         results.push(`[OK] ${screenName} -> ${penPath}`);
                                                                                             } catch (err) {
                                                                                                   results.push(`[ERROR] ${screenName}: ${String(err)}`);
                                                                                                       }
                                                                                                         }
                                                                                                         
                                                                                                           return results.join('\n');
                                                                                                           }
