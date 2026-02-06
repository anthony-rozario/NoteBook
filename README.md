
### 📂 Monorepo Structure (Turborepo)
```
notebook/
├── apps/
│   ├── web/                # Next.js (Dashboard, Editor, Landing Page)
│   │   ├── src/
│   │   │   ├── app/        # App Router (Signup, Dashboard, Editor routes)
│   │   │   ├── components/ # UI Components (Bento Grid, Editor Canvas)
│   │   │   ├── hooks/      # Custom hooks (useAI, usePermissions)
│   │   │   └── lib/        # API clients (Supabase, AI SDK)
│   ├── mobile/             # React Native (Scanning & Mobile Viewing)
│   │   ├── src/
│   │   │   ├── screens/    # ScanScreen, SubjectView, Profile
│   │   │   └── components/ # Mobile-specific UI components
├── packages/
│   ├── database/           # Prisma/Drizzle schema & SQL migrations
│   ├── ai/                 # Shared logic for NLP and OCR processing
│   ├── ui/                 # Shared Tailwind components (Buttons, Modals)
│   └── config/             # Shared ESLint, TypeScript, and Tailwind configs
├── docker-compose.yml      # For local Database/Redis setup
├── turbo.json              # Monorepo build pipeline
└── package.json
```
