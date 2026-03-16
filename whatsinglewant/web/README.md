# 🔍 whatsinglewant.com — Web
## Next.js 14 | Research & Survey Platform

---

## Claude Code — อ่านก่อนทำงาน

**Domain role:** Research platform — survey คนโสด + publish insights  
**Tone:** Clean, data-driven, trustworthy — เหมือน research institute  
**Design:** ดู `../design/BRAND.md`  
**Colors/Fonts:** `../../_shared/brand-tokens.ts` → `whatSingleWant`  
**Types:** `../../_shared/types/index.ts` → `SurveyQuestion`, `ResearchReport`

---

## Pages & Routes

```
app/
├── page.tsx                → Homepage (hero + latest report + survey CTA)
├── survey/
│   ├── page.tsx            → Survey landing / intro
│   ├── [surveyId]/
│   │   ├── page.tsx        → Survey questions (multi-step)
│   │   └── complete/page.tsx → Thank you + get free report
├── reports/
│   ├── page.tsx            → All reports listing
│   └── [year]/page.tsx     → Full report page (free + paid)
├── insights/
│   ├── page.tsx            → Key insights / data viz
│   └── [slug]/page.tsx     → Single insight article
└── api/
    ├── survey/response/route.ts   → Submit survey answers
    └── reports/download/route.ts  → Generate download link
```

---

## Key Components

| Component | Description |
|-----------|-------------|
| `SurveyProgress` | Step indicator (Section A → E) |
| `QuestionRenderer` | Renders any QuestionType dynamically |
| `DataChart` | Chart.js wrapper for insight visualization |
| `ReportCard` | Report listing card (free / paid badge) |
| `StatHighlight` | Big number callout for data points |
| `InsightGrid` | Masonry grid for key findings |

---

## Survey Flow Logic

```typescript
// State machine:
// idle → intro → section_a → section_b → ... → complete → download

// Each section:
// - Profile (A): demographics
// - Lifestyle (B): spending, activities
// - Social (C): community, loneliness
// - Brand (D): brand perception
// - Relationship (E): attitude to singlehood
```

---

## Setup

```bash
npx create-next-app@latest . --typescript --tailwind --app
npm install chart.js react-chartjs-2
npm install @prisma/client
npm install zustand
npm install lucide-react
```

---

## Priority Build Order

1. `app/page.tsx` — Homepage with stat callouts
2. `app/survey/page.tsx` — Survey intro
3. `app/survey/[surveyId]/page.tsx` — Multi-step survey
4. `components/QuestionRenderer.tsx` — Core survey engine
5. `app/reports/page.tsx` — Reports listing
6. `app/insights/page.tsx` — Data viz page
