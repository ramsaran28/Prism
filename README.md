# Prism — Saathi

An emotionally-designed medical report companion. Upload a lab report or doctor's note; five parallel Saathi agents analyze it and return a plain-language summary, risk analysis, multilingual explanation, and action plan. **No data is ever saved.**

## Tech stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Google Gemini 3.5 Flash

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env.local
```

3. Add your [Google AI Studio](https://aistudio.google.com/apikey) key:

```
GEMINI_API_KEY=your_key_here
```

4. Run the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Privacy

- No database, auth, or file storage
- Reports are converted to base64 in the browser and sent only to API routes for the current session
- Closing the tab clears all session data
