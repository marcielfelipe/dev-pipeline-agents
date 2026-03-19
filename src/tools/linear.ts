import { LinearClient } from '@linear/sdk';
import * as dotenv from 'dotenv';

dotenv.config();

const linear = new LinearClient({
  apiKey: process.env.LINEAR_API_KEY!,
  });

  const TEAM_ID = process.env.LINEAR_TEAM_ID!;

  /**
   * Creates a card (issue) in Linear with the given title and description.
    * Returns the URL of the created issue.
     */
     export async function createLinearCard(
       title: string,
         description: string
         ): Promise<string> {
           try {
               const result = await linear.createIssue({
                     teamId: TEAM_ID,
                           title,
                                 description,
                                     });

                                         const issue = await result.issue;

                                             if (!issue) {
                                                   return 'Error: issue was not created.';
                                                       }

                                                           return `Card created successfully!\nTitle: ${issue.title}\nURL: ${issue.url}\nID: ${issue.identifier}`;
                                                             } catch (err) {
                                                                 return `Error creating Linear card: ${String(err)}`;
                                                                   }
                                                                   }
