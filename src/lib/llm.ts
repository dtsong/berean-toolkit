/**
 * Claude API integration for LLM-powered features
 * - Theological explanations
 * - Word study synthesis
 * - Question generation
 * - Sermon outline generation
 */

import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';

let anthropicClient: Anthropic | null = null;

const INPUT_LIMITS = {
  passage: 500,
  title: 200,
  word: 100,
  strongsNumber: 10,
  definition: 500,
  verse: 300,
  maxVerses: 10,
} as const;

const SermonOutlineSchema = z.object({
  mainPoints: z.array(
    z.object({
      heading: z.string(),
      subPoints: z.array(z.string()),
    })
  ),
  keyThemes: z.array(z.string()),
  crossReferences: z.array(z.string()),
});

const ReflectionQuestionSchema = z.object({
  question: z.string(),
  category: z.enum(['observation', 'interpretation', 'application']),
});

const ReflectionQuestionsSchema = z.array(ReflectionQuestionSchema);

export type SermonOutlineResponse = z.infer<typeof SermonOutlineSchema>;
export type ReflectionQuestion = z.infer<typeof ReflectionQuestionSchema>;
export type ReflectionQuestionsResponse = z.infer<typeof ReflectionQuestionsSchema>;

function sanitizeInput(input: string, maxLength: number): string {
  return input.slice(0, maxLength).replace(/[<>]/g, '').trim();
}

function sanitizeStrongsNumber(input: string): string {
  const match = input.toUpperCase().match(/^[HG]\d{1,4}$/);
  return match ? match[0] : '';
}

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

  const safeWord = sanitizeInput(word, INPUT_LIMITS.word);
  const safeStrongsNumber = sanitizeStrongsNumber(strongsNumber);
  const safeDefinition = sanitizeInput(definition, INPUT_LIMITS.definition);
  const safeVerses = verses
    .slice(0, INPUT_LIMITS.maxVerses)
    .map(v => sanitizeInput(v, INPUT_LIMITS.verse));

  if (!safeWord || !safeStrongsNumber) {
    return null;
  }

  const systemPrompt = `You are a biblical scholar helping everyday believers understand God's Word more deeply. You will receive information about a biblical word inside <word_data> tags. Provide a clear and accessible explanation of its theological significance.

Please explain:
1. The range of meaning this word carries
2. How different translations might render it
3. Key theological concepts associated with this word
4. Practical application for Christian life

Keep your response concise (2-3 paragraphs) and accessible to someone without seminary training.`;

  const userMessage = `<word_data>
Original Word: ${safeWord}
Strong's Number: ${safeStrongsNumber}
Definition: ${safeDefinition}
Example Verses: ${safeVerses.join('; ')}
</word_data>`;

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
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
): Promise<SermonOutlineResponse | null> {
  const client = getClient();

  const safePassage = sanitizeInput(passage, INPUT_LIMITS.passage);
  const safeTitle = title ? sanitizeInput(title, INPUT_LIMITS.title) : null;

  if (!safePassage) {
    return null;
  }

  const systemPrompt = `You are helping a sermon listener prepare for deeper engagement with God's Word. You will receive a Bible passage reference inside <passage_data> tags.

Generate a PROBABLE expository outline that follows the passage's flow. This is a suggested outline - the actual sermon may differ.

Respond ONLY with valid JSON in this exact format (no markdown, no explanation):
{
  "mainPoints": [
    { "heading": "Point heading", "subPoints": ["Sub-point 1", "Sub-point 2"] }
  ],
  "keyThemes": ["Theme 1", "Theme 2"],
  "crossReferences": ["Related verse 1", "Related verse 2"]
}

Keep the outline practical and focused on the text's main message.`;

  const userMessage = `<passage_data>
Passage: ${safePassage}${safeTitle ? `\nSermon Title: ${safeTitle}` : ''}
</passage_data>`;

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    });

    const content = message.content[0];
    if (content?.type === 'text') {
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return null;
      }

      const parsed = JSON.parse(jsonMatch[0]);
      const result = SermonOutlineSchema.safeParse(parsed);

      if (!result.success) {
        console.error('Invalid sermon outline response:', result.error.format());
        return null;
      }

      return result.data;
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
): Promise<ReflectionQuestionsResponse | null> {
  const client = getClient();

  const safePassage = sanitizeInput(passage, INPUT_LIMITS.passage);
  const safeCount = Math.min(Math.max(1, count), 10);

  if (!safePassage) {
    return null;
  }

  const systemPrompt = `You will receive a Bible passage reference inside <passage_data> tags. Generate reflection questions for it.

Create open-ended questions that help the reader:
1. Observe what the text says (observation)
2. Understand what it means (interpretation)
3. Apply it to their life (application)

Respond ONLY with valid JSON array in this exact format (no markdown, no explanation):
[
  { "question": "Your question here", "category": "observation" }
]

Valid categories: observation, interpretation, application`;

  const userMessage = `<passage_data>
Passage: ${safePassage}
Number of questions: ${safeCount}
</passage_data>`;

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    });

    const content = message.content[0];
    if (content?.type === 'text') {
      const jsonMatch = content.text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        return null;
      }

      const parsed = JSON.parse(jsonMatch[0]);
      const result = ReflectionQuestionsSchema.safeParse(parsed);

      if (!result.success) {
        console.error('Invalid reflection questions response:', result.error.format());
        return null;
      }

      return result.data;
    }
    return null;
  } catch (error) {
    console.error('Error generating reflection questions:', error);
    return null;
  }
}
