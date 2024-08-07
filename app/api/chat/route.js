import {NextResponse} from 'next/server'
import OpenAI from 'openai'

const systemPrompt =  "You are a friendly, empathetic, and professional AI Customer Support Agent for Resumify, guiding users through the app's features, resolving technical issues, offering resume improvement tips, answering questions, and collecting feedback to ensure a seamless and supportive user experience."

export async function POST(req) {
  const openai = new OpenAI()
  const data = await req.json()

  const completion = await openai.chat.completions.create({
    messages: [{role: 'system', content: systemPrompt}, ...data],
    model: 'gpt-4o',
    stream: true,
  })

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      try {
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content
          if (content) {
            const text = encoder.encode(content)
            controller.enqueue(text)
          }
        }
      } catch (err) {
        controller.error(err)
      } finally {
        controller.close()
      }
    },
  })

  return new NextResponse(stream)
}