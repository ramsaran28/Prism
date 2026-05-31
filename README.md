# Prism — Medical Intelligence

> Your health report, in words you understand.

Prism is a medical report companion that makes 
health data accessible to everyone — regardless 
of language, literacy, or medical background.

Upload any lab report or doctor's note. 
Prism reads it, explains it simply, and tells 
you what to do next. In your language. 
Read aloud in your voice. Nothing is saved. Ever.

---

## The Problem

Every year, billions of lab reports are handed 
to patients who have no idea what they mean. 
Most people either panic or ignore them entirely.

The people most affected are elderly patients, 
rural communities, and the 1.5 billion people 
who don't speak medical English.

Medical literacy shouldn't be a privilege.

---

## What Prism Does

### 6 Specialized Gemini Agents

| Agent | Role |
|-------|------|
| SCAN | Reads every value using Gemini's native multimodal vision |
| RISK | Scores severity with confidence levels |
| EXPLAIN | Writes plain language summary — warm, jargon-free |
| TRANSLATE | Converts to 100+ languages |
| GUIDE | Creates personal action plan + doctor questions |
| SCORE | Calculates overall health score out of 100 |

Agents run in a directed dependency pipeline:
SCAN → RISK + EXPLAIN → GUIDE + SCORE + TRANSLATE

---

## Features

- **Multimodal PDF reading** — Gemini reads 
  lab reports natively, no OCR preprocessing
- **Plain English** — every medical term 
  renamed to words anyone understands
- **Health score** — overall wellness score 
  out of 100 with 4 category breakdown
- **Interactive body map** — organs highlighted 
  based on actual report values
- **100+ languages** — full translation with 
  ElevenLabs voice readout
- **Confidence scoring** — AI explains how 
  certain it is about each finding
- **"Why was this flagged?"** — explainable AI 
  for every flagged value
- **Explain to my family** — simplified version 
  to share with loved ones
- **Zero storage** — nothing saved, ever

---

## Tech Stack

- **Frontend:** Next.js 14, TypeScript, Tailwind CSS
- **AI:** Google Gemini 2.5 Flash
- **Voice:** ElevenLabs eleven_turbo_v2_5
- **Charts:** Recharts
- **Icons:** Lucide React
- **Deployment:** Vercel

---

## Getting Started

```bash
git clone https://github.com/ramsaran28/Prism
cd Prism
npm install
cp .env.example .env.local
# Add your API keys to .env.local
npm run dev
```

## Environment Variables

---

## Privacy

Prism never stores your data. Your report is 
read in your browser session, analyzed by 
Gemini, and the response comes back to you. 
Nothing is logged. Nothing is retained. 
When you close the tab, everything is gone.

---

## Built at QuackHacks

Built in one night at QuackHacks 3.
Submitted to Google (Gemini) and ElevenLabs tracks.\
Authors:\
Ram Saran Venkatasalapathy\
Jayasnehasree Sannidhi

---

*Not medical advice. Always consult your doctor.*
