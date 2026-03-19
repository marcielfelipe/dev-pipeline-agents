import 'dotenv/config';
import { LlmAgent, SequentialAgent } from '@google/adk/agents';
import { FunctionTool } from '@google/adk/tools';

import { createLinearCard } from './tools/linear';
import { designScreens } from './tools/pencil';
import { implementTask } from './tools/dev';

// ─── TOOLS ────────────────────────────────────────────────────────────────────

const linearTool = new FunctionTool({
    name: 'create_linear_card',
    description: 'Creates a card (issue) in Linear with the given title and description.',
    parameters: {
          type: 'object',
          properties: {
                  title: { type: 'string', description: 'Issue title' },
                  description: { type: 'string', description: 'Issue description in markdown with acceptance criteria' },
          },
          required: ['title', 'description'],
    },
    execute: async ({ title, description }: { title: string; description: string }) =>
          createLinearCard(title, description),
});

const pencilTool = new FunctionTool({
    name: 'design_screens',
    description: 'Uses Claude Code + Pencil MCP to create wireframes for the listed screens.',
    parameters: {
          type: 'object',
          properties: {
                  taskSpec: { type: 'string', description: 'Full task description in markdown' },
                  screens: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'List of screen names to design, e.g. ["login", "dashboard"]',
                  },
          },
          required: ['taskSpec', 'screens'],
    },
    execute: async ({ taskSpec, screens }: { taskSpec: string; screens: string[] }) =>
          designScreens(taskSpec, screens),
});

const devTool = new FunctionTool({
    name: 'implement_task',
    description: 'Uses Claude Code to implement the feature, reading wireframes via Pencil MCP.',
    parameters: {
          type: 'object',
          properties: {
                  taskSpec: { type: 'string', description: 'Full task description in markdown' },
                  screenNames: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'List of screen names that were designed',
                  },
          },
          required: ['taskSpec', 'screenNames'],
    },
    execute: async ({ taskSpec, screenNames }: { taskSpec: string; screenNames: string[] }) =>
          implementTask(taskSpec, screenNames),
});

// ─── AGENTS ───────────────────────────────────────────────────────────────────

const poAgent = new LlmAgent({
    name: 'PO_Agent',
    model: 'claude-sonnet-4-5',
    description: 'Product Owner: writes tasks and creates Linear cards.',
    instruction: `
    You are an experienced Product Owner.

    Given a feature request, you must:
    1. Write a complete task with: title, detailed description in markdown, and acceptance criteria
    2. Identify all screens/UI that will need to be designed (list simple names like "login", "dashboard")
    3. Create the card in Linear using the create_linear_card tool

    Save to output:
    - The full task spec (title + description + acceptance criteria)
    - The list of screen names (e.g. ["login", "dashboard"])

    Always respond in the same language as the user's request.
      `.trim(),
    tools: [linearTool],
    outputKey: 'po_output',
});

const uxAgent = new LlmAgent({
    name: 'UX_Agent',
    model: 'claude-sonnet-4-5',
    description: 'UX Designer: creates wireframes in Pencil using Claude Code + MCP.',
    instruction: `
    You are an experienced UX Designer.

    Read the PO output from {po_output}.

    Extract:
    - taskSpec: the full task description (title + description + acceptance criteria)
    - screens: the list of screen names to design

    Then call design_screens with those values.

    Claude Code will automatically use the Pencil MCP server to create the .pen wireframe files.

    Report which screens were designed and confirm their file paths.
      `.trim(),
    tools: [pencilTool],
    outputKey: 'ux_output',
});

const devAgent = new LlmAgent({
    name: 'DEV_Agent',
    model: 'claude-sonnet-4-5',
    description: 'Developer: implements the feature using Claude Code, reading wireframes via Pencil MCP.',
    instruction: `
    You are a senior software developer.

    Read the context:
    - PO output: {po_output}
    - UX output: {ux_output}

    Extract:
    - taskSpec: the full task description
    - screenNames: the list of screen names that were designed

    Then call implement_task with those values.

    Claude Code will use the Pencil MCP server to read the wireframes and implement the feature.

    Report the implementation result.
      `.trim(),
    tools: [devTool],
    outputKey: 'dev_output',
});

// ─── PIPELINE ─────────────────────────────────────────────────────────────────

export const rootAgent = new SequentialAgent({
    name: 'DevPipeline',
    description: 'Full development pipeline: PO writes task -> UX designs screens -> DEV implements.',
    subAgents: [poAgent, uxAgent, devAgent],
});
