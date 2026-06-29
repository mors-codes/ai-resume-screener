import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import { GoogleGenAI } from '@google/genai'

const app = express()
const PORT = process.env.PORT || 3001

const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

app.use(cors())
app.use(express.json())

app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.post('/api/screen', async (req, res) => {
  const { jobDescription, resume } = req.body

  if (!jobDescription || !resume) {
    return res.status(400).json({ error: 'Job description and resume are both required.' })
  }

  const prompt = `You are an expert technical recruiter. Compare this resume against this job description and respond with ONLY a JSON object — no markdown, no code fences, no explanation text before or after.

JOB DESCRIPTION:
${jobDescription}

RESUME:
${resume}

Respond with exactly this JSON shape:
{
  "score": <number 0-100>,
  "recommendation": "<strong | maybe | weak>",
  "summary": "<2-3 sentence summary of overall fit>",
  "matches": ["<requirement the candidate meets>", "..."],
  "gaps": ["<requirement the candidate is missing>", "..."],
  "interviewQuestions": ["<suggested question>", "..."]
}`

  const callGemini = async () => {
    const response = await genai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    })
    return response.text
  }

  const parseResult = (text) => {
    const cleaned = text.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '')
    const parsed = JSON.parse(cleaned)

    const requiredFields = ['score', 'recommendation', 'summary', 'matches', 'gaps', 'interviewQuestions']
    const missing = requiredFields.filter((field) => !(field in parsed))
    if (missing.length > 0) {
      throw new Error(`Missing fields: ${missing.join(', ')}`)
    }

    return parsed
  }

  try {
    const firstAttempt = await callGemini()

    try {
      const result = parseResult(firstAttempt)
      return res.json(result)
    } catch (parseErr) {
      console.warn('First parse failed, retrying:', parseErr.message)
      const secondAttempt = await callGemini()
      const result = parseResult(secondAttempt)
      return res.json(result)
    }
  } catch (err) {
    console.error('Screen candidate failed:', err.message)
    res.status(500).json({ error: 'Failed to screen candidate. Please try again.' })
  }
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})