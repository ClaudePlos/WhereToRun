/**
 * Optional Claude-powered discovery source.
 *
 * Runs only when ANTHROPIC_API_KEY is set. Claude searches the web for notable
 * upcoming races that the free APIs miss (Asia, Africa, South America, unusual
 * formats) and returns them as JSON, which then goes through the same
 * normalisation, validation and merge path as every other source.
 */

import Anthropic from '@anthropic-ai/sdk';

export const id = 'ai-discovery';

const MODEL = process.env.ANTHROPIC_MODEL ?? 'claude-opus-5';

const SYSTEM = `You research running events for a bilingual (English/Polish) race portal.
Use web search to find genuinely notable upcoming running events worldwide: iconic city
marathons, famous ultras and trail races, and unusual or extreme races worth travelling for.

Rules:
- Only include events with a date in the future.
- Only include facts you found in search results. Never invent fees, dates or coordinates.
- Coordinates must be the START location of the race, in decimal degrees.
- If you cannot verify a start coordinate, omit the event entirely.
- Mark dateStatus "confirmed" only when the organiser or a reliable source states the exact
  date for that edition; otherwise use "estimated".
- Mark a fee "indicative": true unless the exact current price was stated by the organiser.
- Write short original descriptions. Do not copy marketing text verbatim.`;

const OUTPUT_CONTRACT = `Return ONLY a fenced \`\`\`json code block containing an array of events.
Each event object:
{
  "name": string,
  "date": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD" | null,
  "dateStatus": "confirmed" | "estimated",
  "type": "road" | "trail" | "ultra" | "stage" | "obstacle" | "track" | "other",
  "distances": string[],
  "tags": string[],
  "location": { "city": string, "country": string, "countryCode": "ISO-3166-1 alpha-2" },
  "start": { "lat": number, "lon": number, "name": string | null },
  "fees": [{ "amount": number, "currency": "ISO-4217", "indicative": boolean,
             "label": { "en": string, "pl": string } }],
  "website": string | null,
  "registrationUrl": string | null,
  "links": [{ "url": string, "label": { "en": string, "pl": string } }],
  "content": { "en": { "summary": string, "description": string },
               "pl": { "summary": string, "description": string } }
}
"summary" is one sentence, "description" is 2-4 sentences. The Polish text must be natural
Polish written for Polish runners, not a literal translation.`;

export function extractJsonArray(text) {
  const fenced = /```(?:json)?\s*([\s\S]*?)```/.exec(text);
  const payload = (fenced ? fenced[1] : text).trim();
  const start = payload.indexOf('[');
  const end = payload.lastIndexOf(']');
  if (start === -1 || end === -1 || end < start) return [];
  try {
    const parsed = JSON.parse(payload.slice(start, end + 1));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function responseText(message) {
  return (message.content ?? [])
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('\n');
}

export async function fetchEvents({ client, limit = 8, known = [], today = new Date() } = {}) {
  if (!process.env.ANTHROPIC_API_KEY) return [];
  const anthropic = client ?? new Anthropic();
  const now = new Date().toISOString();
  const knownList = known.slice(0, 200).join(', ');

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 16000,
    system: SYSTEM,
    tools: [{ type: 'web_search_20260209', name: 'web_search', max_uses: 8 }],
    messages: [
      {
        role: 'user',
        content: `Today is ${today.toISOString().slice(0, 10)}. Find up to ${limit} interesting upcoming running events that are NOT already in this list:

${knownList || '(the portal is empty)'}

Favour geographic variety and events that a runner would plan a trip around. ${OUTPUT_CONTRACT}`,
      },
    ],
  });

  if (message.stop_reason === 'refusal') {
    throw new Error(`Claude declined the discovery request: ${message.stop_details?.explanation ?? 'no explanation'}`);
  }

  return extractJsonArray(responseText(message)).map((event) => ({
    ...event,
    tags: [...(event.tags ?? []), 'ai-discovered'],
    source: { id, url: event.website ?? null, ref: null, fetchedAt: now },
  }));
}
