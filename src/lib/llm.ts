/**
 * Claude API integration for LLM-powered features
 * - Theological explanations
 * - Word study synthesis
 * - Question generation
 * - Sermon outline generation
 */

import Anthropic from '@anthropic-ai/sdk';

let anthropicClient: Anthropic | null = null;

/**
 * Get or create Anthropic client instance
 */
function getClient(): Anthropic {
  if (anthropicClient == null) {
    anthropicClient = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return anthropicClient;
}

/**
 * Generate theological explanation for a word study
 */
export async function generateWordStudyExplanation(
  word: string,
  strongsNumber: string,
  definition: string,
  verses: string[]
): Promise<string | null> {
  const client = getClient();

  const prompt = `You are a biblical scholar helping everyday believers understand God's Word more deeply.

Given the following information about a biblical word, provide a clear and accessible explanation of its theological significance:

Original Word: ${word}
Strong's Number: ${strongsNumber}
Definition: ${definition}
Example Verses: ${verses.join('; ')}

Please explain:
1. The range of meaning this word carries
2. How different translations might render it
3. Key theological concepts associated with this word
4. Practical application for Christian life

Keep your response concise (2-3 paragraphs) and accessible to someone without seminary training.`;

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = message.content[0];
    if (content?.type === 'text') {
      return content.text;
    }
    return null;
  } catch (error) {
    console.error('Error generating word study explanation:', error);
    return null;
  }
}

/**
 * Generate sermon outline from a passage
 */
export async function generateSermonOutline(
  passage: string,
  title?: string
): Promise<{
  mainPoints: Array<{ heading: string; subPoints: string[] }>;
  keyThemes: string[];
  crossReferences: string[];
} | null> {
  const client = getClient();

  const prompt = `You are helping a sermon listener prepare for deeper engagement with God's Word.

Given the following passage${title != null ? ` and sermon title` : ''}:
Passage: ${passage}
${title != null ? `Sermon Title: ${title}` : ''}

Generate a PROBABLE expository outline that follows the passage's flow. This is a suggested outline - the actual sermon may differ.

Respond in JSON format:
{
  "mainPoints": [
    { "heading": "Point heading", "subPoints": ["Sub-point 1", "Sub-point 2"] }
  ],
  "keyThemes": ["Theme 1", "Theme 2"],
  "crossReferences": ["Related verse 1", "Related verse 2"]
}

Keep the outline practical and focused on the text's main message.`;

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = message.content[0];
    if (content?.type === 'text') {
      return JSON.parse(content.text) as {
        mainPoints: Array<{ heading: string; subPoints: string[] }>;
        keyThemes: string[];
        crossReferences: string[];
      };
    }
    return null;
  } catch (error) {
    console.error('Error generating sermon outline:', error);
    return null;
  }
}

/**
 * Generate reflection questions for a passage
 */
export async function generateReflectionQuestions(
  passage: string,
  count: number = 5
): Promise<Array<{ question: string; category: string }> | null> {
  const client = getClient();

  const prompt = `Generate ${count} reflection questions for the following Bible passage: ${passage}

Create open-ended questions that help the reader:
1. Observe what the text says (observation)
2. Understand what it means (interpretation)
3. Apply it to their life (application)

Respond in JSON format:
[
  { "question": "Your question here", "category": "observation|interpretation|application" }
]`;

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = message.content[0];
    if (content?.type === 'text') {
      return JSON.parse(content.text) as Array<{ question: string; category: string }>;
    }
    return null;
  } catch (error) {
    console.error('Error generating reflection questions:', error);
    return null;
  }
}
