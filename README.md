# ⟁ Prism — Medical Intelligence

> **Your health report, in words you understand.**

**Live app:** https://prism-sigma-five.vercel.app

---

## The Problem We're Solving

Every year, over **2 billion lab reports** are handed to patients who have no idea what they mean.

Most people stare at abbreviations like HbA1c, eGFR, LDL, MCHC — and either panic or put the paper in a drawer. The worry stays. The confusion stays. The questions never get asked.

**The people most affected:**
- 👵 Elderly patients who didn't grow up with medical literacy
- 🌍 1.5 billion people who don't speak medical English
- 🏘️ Rural communities with limited access to follow-up care
- 👨‍👩‍👧 Immigrant families navigating foreign healthcare systems
- 💰 Anyone who can't afford a second opinion

Doctor appointments are 12 minutes long. There's no time to explain every value. Patients leave with more questions than answers — and nowhere to go.

**Medical literacy has always been a privilege. Prism changes that.**

---

## What Prism Does

Upload any lab report or doctor's note — PDF, image, or photo of a handwritten note. In under 15 seconds, Prism:

- ✅ Reads every value using Gemini's native multimodal vision
- ✅ Explains everything in warm, plain everyday language
- ✅ Shows you a health score out of 100
- ✅ Highlights which organs and body systems are affected
- ✅ Tells you exactly what to do next
- ✅ Translates everything into your language and reads it aloud
- ✅ Generates questions to bring to your next doctor's appointment
- ✅ Deletes everything when you close the tab

**Zero jargon. Zero storage. Zero fear.**

---

## How It Works — The 6-Agent Gemini Pipeline

Prism doesn't make one API call. It runs **six specialized Gemini agents in a directed dependency pipeline** — each with one job, done well.

```
SCAN ──→ RISK ──→ GUIDE
              └──→ SCORE  
         EXPLAIN ──→ TRANSLATE
```

| # | Agent | Role | What it produces |
|---|-------|------|-----------------|
| 01 | **SCAN** | Reads every value, unit, and reference range from the report using Gemini's native multimodal vision — PDFs, images, even handwritten notes. No OCR. No preprocessing. | Structured JSON of all lab values |
| 02 | **RISK** | Identifies flagged values, scores severity, and calculates a confidence level based on correlated markers. 3 cardiovascular markers flagged together = 94% confidence. | Risk assessment with confidence scores |
| 03 | **EXPLAIN** | Writes a plain language summary — warm, honest, jargon-free. Always starts with what's good. Every medical term replaced with plain English. | Human-readable health summary |
| 04 | **TRANSLATE** | Converts the summary into any of 100+ languages while keeping the same caring tone. | Translated summary in chosen language |
| 05 | **GUIDE** | Creates a personal action plan and generates specific questions to bring to the next doctor's appointment. | Action steps + doctor questions |
| 06 | **SCORE** | Calculates an overall health score out of 100, broken into 4 categories: Heart, Metabolic, Nutritional, and Organ health. | Wellness score with category breakdown |

**This is not a chatbot. This is a directed intelligence pipeline.**

---

## Key Features

### 🧠 Explainable AI
Every flagged value has a "Why?" button that calls Gemini to explain in plain words exactly why that value was flagged, what it means for that specific patient's combination of results, and what they can do about it.

### 🫀 Interactive Body Map
Lab values are mapped to body systems. Organs glow based on severity — red for critical, amber for attention needed, green for healthy. Click any organ to see the specific values affecting it.

### 📊 Health Score Out of 100
Not just a number — a breakdown across 4 body systems with plain English notes for each. Animated gauge, category bars, and an encouraging message no matter the score.

### 🌍 100+ Language Support
Full translation powered by Gemini 2.5 Flash. Voice readout powered by ElevenLabs — emotionally tuned based on severity. Calmer and steadier for critical findings, warmer for healthy results.

### 👨‍👩‍👧 Explain to My Family
One click generates a simplified version written for someone with zero medical background — something to screenshot and send to a worried parent or partner.

### 📄 Download Your Summary
Generate a clean PDF of your health score, plain language summary, action plan, and doctor questions — to bring to your next appointment.

### 🔒 Zero Storage Architecture
Nothing is logged. Nothing is retained. Your report is read in your browser session, analyzed by Gemini, and the response comes back to you. When you close the tab, everything is gone permanently.

---

## Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| Next.js 14 (App Router) | Full-stack React framework |
| TypeScript | Type-safe codebase (92.5% of repo) |
| Tailwind CSS | Utility-first styling |
| Recharts | Interactive health value charts |
| Lucide React | Icon system |
| jsPDF | Client-side PDF generation |

### AI & Intelligence
| Technology | Purpose |
|-----------|---------|
| Google Gemini 2.5 Flash | 6-agent pipeline, multimodal PDF vision, streaming, structured JSON, translation |
| ElevenLabs eleven_turbo_v2_5 | Multilingual voice synthesis, emotionally tuned |
| ElevenLabs eleven_multilingual_v2 | Fallback for extended language support |

### Architecture
| Principle | Implementation |
|-----------|---------------|
| Directed agent pipeline | SCAN → RISK/EXPLAIN → GUIDE/SCORE/TRANSLATE |
| Zero database | Fully stateless — no server storage of any kind |
| Streaming responses | Token-by-token Gemini streaming for live feel |
| Client-side PDF | jsPDF generates entirely in browser, no server call |
| Confidence scoring | Correlated marker analysis in RISK agent |

### Deployment
| Technology | Purpose |
|-----------|---------|
| Vercel | Zero-config Next.js deployment |
| GitHub | Version control |

---

## Getting Started

```bash
git clone https://github.com/ramsaran28/Prism
cd Prism
npm install
cp .env.example .env.local
```

Add your API keys to `.env.local`:
```
GEMINI_API_KEY=your_gemini_key_here
ELEVENLABS_API_KEY=your_elevenlabs_key_here
```

```bash
npm run dev
```

Open http://localhost:3000

---

## Privacy Commitment

Prism was designed from day one with zero storage.

- No user accounts
- No database
- No server logs
- No cookies beyond session
- Everything deleted when tab closes

Your medical data is the most personal thing there is. It deserves to be treated that way.

---

## Built At QuackHacks 3

Built in one night at QuackHacks 3 — submitted to the Google Gemini and ElevenLabs sponsor tracks.

**Team:**
- Ram Saran Venkatasalapathy
- Jayasnehasree Sannidhi

---

*This is not medical advice. Always consult a qualified doctor.*
