import { openai } from '~/server/utils/openai'

export default defineEventHandler(async (event) => {
  const { messages } = await readBody(event)

  const chatMessages = [
    { role: 'system', content: 'You are a helpful sales assistant.' },
    ...messages,
  ]

  const res = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: chatMessages,
    temperature: 0.7,
  })

  return res.choices[0].message
})
