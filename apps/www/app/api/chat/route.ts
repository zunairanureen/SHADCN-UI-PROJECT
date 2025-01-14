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
    messages: convertToCoreMessages(messages),
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
