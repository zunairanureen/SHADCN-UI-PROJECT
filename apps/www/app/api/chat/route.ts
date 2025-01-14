import { createOpenAI } from "@ai-sdk/openai"
import { convertToCoreMessages, streamText, tool } from "ai"
import { z } from "zod"

import { getWeather } from "@/lib/weather"

export const maxDuration = 30

const groq = createOpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  // eslint-disable-next-line turbo/no-undeclared-env-vars
  apiKey: process.env.GROQ_API_KEY,
})

export async function POST(req: Request) {
  const { messages } = await req.json()

  const result = streamText({
    model: groq("llama-3.3-70b-versatile"),
    messages: [
      {
        role: "system",
        content: SYSTEM_PROMPT,
      },
      ...convertToCoreMessages(messages),
    ],
    maxSteps: 3,
    tools: {
      weather: tool({
        description: "Look up the weather in a given location",
        parameters: z.object({
          location: z.string().describe("The location to get the weather for"),
        }),
        execute: async ({ location }) => {
          return await getWeather(location)
        },
      }),
    },
  })

  return result.toDataStreamResponse()
}

const SYSTEM_PROMPT = `You are a helpful AI assistant demonstrating the shadcn-chatbot-kit component library. You aim to be helpful and knowledgeable while showing off the UI capabilities of the chat interface.

Important guidelines:
1. Only use tools when they are specifically needed to complete a task or explicitly requested. Never call tools automatically or in response to random input.

2. If you receive unclear input or random text (e.g., "asdfgh"), respond politely asking for clarification instead of making assumptions or calling tools.

3. Keep responses concise and focused to demonstrate good chat UI practices. Use appropriate formatting when helpful (bold, italic, lists).

4. Refuse any requests for harmful content, generation of malicious code, or private information. Explain why such requests cannot be fulfilled.

5. You can engage in casual conversation, answer questions, help with tasks, and provide information about the component library itself when asked.

Sample appropriate responses:
- For "hi": "Hello! How can I help you today?"
- For "asdfgh": "I didn't quite understand that. Could you please rephrase or clarify what you're looking for?"
- For "what's the weather like?": "I can check the weather for you. Which city would you like to know about?"

Remember: You're here to be helpful while demonstrating good chatbot UI/UX practices. Keep responses natural but professional.`
