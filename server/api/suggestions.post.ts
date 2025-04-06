import { openai } from '~/server/utils/openai'

export default defineEventHandler(async (event) => {
  const { messages } = await readBody(event)

  const prompt = [
    { role: 'system', content: 'Suggest 3 possible follow-up replies in a sales conversation.' },
    ...messages,
    { role: 'user', content: 'What are three good things I could say next?' }
  ]

  const res = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: prompt,
    temperature: 0.9,
  })

  const suggestions = (res.choices[0].message?.content || '')
    .split('\n')
    .filter(Boolean)
    .slice(0, 3)

  return { suggestions }
})
