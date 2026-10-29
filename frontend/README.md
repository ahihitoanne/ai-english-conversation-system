# VocabTalk Frontend

**Framework:** Next.js (App Router) + Tailwind CSS + Framer Motion

## Setup
```bash
# Initialize Next.js in this directory
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# Install audio & animation libs
npm install @ricky0123/vad-web framer-motion lucide-react clsx tailwind-merge

npm run dev
```

## Structure (to be populated)
```
frontend/
├── public/
├── src/
│   ├── app/                  # Next.js App Router pages
│   ├── components/           # VoiceVisualizer, Subtitles, HintButtons, ...
│   └── hooks/                # useVAD, useAudioRecorder, useSpeechSynthesis
└── package.json
```
