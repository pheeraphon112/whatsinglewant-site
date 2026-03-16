// src/routes/survey.ts
// whatsinglewant.com — Survey API Routes

import { Router, Request, Response } from 'express'
import { z } from 'zod'

const router = Router()

// ─── Schemas ─────────────────────────────────────────────────
const SubmitResponseSchema = z.object({
  surveyId: z.string().optional(),
  respondentProfile: z.object({
    ageGroup:      z.enum(['18-24', '25-29', '30-34', '35-39', '40-45', '45+']),
    gender:        z.enum(['male', 'female', 'non_binary', 'prefer_not_to_say']),
    province:      z.string().min(1),
    monthlyIncome: z.string(),
    singleStatus:  z.enum(['thriving', 'content', 'searching']),
  }),
  answers: z.array(z.object({
    questionId: z.string(),
    value:      z.union([z.string(), z.array(z.string()), z.number()]),
  })),
  durationSeconds: z.number().optional(),
})

// ─── GET /api/survey/active ───────────────────────────────────
// Get the current active survey questions
router.get('/active', async (_req: Request, res: Response) => {
  try {
    // TODO: fetch from DB via Prisma
    res.json({
      success: true,
      data: {
        id: 'survey-2026',
        title: 'What Single Want — Annual Survey 2026',
        sections: [
          { id: 'profile',      labelTH: 'ข้อมูลของคุณ',            questionCount: 5 },
          { id: 'lifestyle',    labelTH: 'ไลฟ์สไตล์และการใช้จ่าย',   questionCount: 8 },
          { id: 'social',       labelTH: 'ชีวิตทางสังคม',             questionCount: 6 },
          { id: 'brand',        labelTH: 'มุมมองต่อแบรนด์',           questionCount: 5 },
          { id: 'relationship', labelTH: 'ทัศนคติต่อความโสด',         questionCount: 6 },
        ],
        estimatedMinutes: 8,
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch survey' })
  }
})

// ─── GET /api/survey/questions/:section ──────────────────────
router.get('/questions/:section', async (req: Request, res: Response) => {
  const { section } = req.params
  try {
    // TODO: fetch filtered questions from DB
    res.json({ success: true, data: { section, questions: [] } })
  } catch {
    res.status(500).json({ success: false, error: 'Failed to fetch questions' })
  }
})

// ─── POST /api/survey/response ────────────────────────────────
// Submit completed survey
router.post('/response', async (req: Request, res: Response) => {
  const parsed = SubmitResponseSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: 'Invalid survey data',
      details: parsed.error.flatten()
    })
  }

  try {
    const { respondentProfile, answers, durationSeconds } = parsed.data

    // TODO: save to DB via Prisma
    // await prisma.surveyResponse.create({ data: { ... } })

    // Generate download token for free report
    const downloadToken = Buffer.from(
      JSON.stringify({ ts: Date.now(), profile: respondentProfile.singleStatus })
    ).toString('base64url')

    return res.status(201).json({
      success: true,
      data: {
        message: 'Survey submitted successfully. ขอบคุณมากครับ!',
        responseCount: 1, // TODO: get total from DB
        downloadToken,    // Use to access free report
        reportUrl: `/reports/2026?token=${downloadToken}`,
      }
    })
  } catch {
    return res.status(500).json({ success: false, error: 'Failed to save response' })
  }
})

// ─── GET /api/survey/insights ─────────────────────────────────
// Public aggregated insights (for insights page)
router.get('/insights', async (_req: Request, res: Response) => {
  try {
    // TODO: aggregate from DB
    res.json({
      success: true,
      data: {
        totalResponses: 0,
        lastUpdated: new Date().toISOString(),
        highlights: [
          { stat: '68%', labelTH: 'ของคนโสดรู้สึกว่าแบรนด์ไม่เข้าใจพวกเขา' },
          { stat: '3.2x', labelTH: 'คนโสดใช้จ่ายด้านท่องเที่ยวมากกว่าค่าเฉลี่ย' },
          { stat: '81%', labelTH: 'ไม่ได้โสดเพราะไม่มีตัวเลือก' },
        ]
      }
    })
  } catch {
    res.status(500).json({ success: false, error: 'Failed to fetch insights' })
  }
})

export default router
