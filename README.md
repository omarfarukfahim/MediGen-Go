# Live Link - https://medigen-demo.netlify.app/
# MediGen — AI Health Assistant

MediGen is a modern web application that provides an AI-powered health assistant experience, health tracking, appointment booking and informative medical articles. It combines a React + Vite frontend with Firebase for authentication and persistence, and integrates Google's GenAI (`@google/genai`) for conversational and analysis features.

**Project Authors & Contributors**
- **Authors:** Omar Faruk Fahim, Maruf (ByteForge)
- **Contributors:** soton, sakib, fazla

**Demo / Screenshots**
- Add screenshots or a demo link here to showcase the UI and main flows (Home, Assistant, Appointments, Profile, Articles).

**Key Features**
- **AI Health Assistant:** Chat-based assistant and image analysis powered by Google GenAI.
- **Health Tracker:** Log and visualize vitals and metrics.
- **Appointments & Booking:** Book and manage doctor appointments.
- **Articles & Forum:** Read curated health articles and participate in community discussions.
- **Authentication:** Firebase Authentication integration.

**Tech Stack**
- **Framework:** React (v19) + TypeScript
- **Bundler / Dev Server:** Vite
- **Backend / Services:** Firebase (Auth, Firestore/Storage if configured)
- **AI:** `@google/genai` (Gemini) via `services/geminiService.ts`

**Repository Structure (important files/folders)**
- `App.tsx`, `index.tsx`: Application entry points.
- `components/`: Reusable React components (Header, Footer, Modals, Icons, etc.).
- `pages/`: Route pages (Home, AiAssistantPage, AppointmentsPage, Profile, etc.).
- `contexts/DataContext.tsx`: React context for app-wide data.
- `services/geminiService.ts`: Google GenAI integration and helper functions.
- `firebase/config.ts`: Firebase initialization and config.

Getting started
---------------

Prerequisites
- **Node.js**: v18 or later recommended.
- **npm**: bundled with Node, or use `pnpm`/`yarn` if preferred.
- (Optional) **Firebase CLI**: for deploys (`npm i -g firebase-tools`).

Local development
-----------------

1. Install dependencies

```powershell
npm install
```

2. Run the development server

```powershell
npm run dev
```

3. Build for production

```powershell
npm run build
```

4. Preview the production build locally

```powershell
npm run preview
```

Firebase deploy
---------------

This project contains `firebase/config.ts` — the Firebase configuration is currently included in the repo. For production projects you should move those values into environment variables and never commit secrets to source control. To deploy with Firebase CLI:

```powershell
# log in (if needed)
firebase login

# initialize hosting only once (if not done) and follow prompts
firebase init

# build and deploy
npm run build; firebase deploy
```

Configuration & Secrets
-----------------------
- `firebase/config.ts` currently contains the Firebase configuration used to initialize the SDK. Prefer using environment variables instead of hard-coding values.
- `services/geminiService.ts` expects an API key for Google GenAI. The file currently references an `API_KEY` variable — replace the hard-coded key with an environment variable such as `VITE_GOOGLE_GENAI_API_KEY` or `GOOGLE_GENAI_API_KEY` and load it in the code.

Example `.env` (use a secure mechanism in production):

```text
# Example .env (do not commit!)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_GOOGLE_GENAI_API_KEY=your_google_genai_api_key
```

Security & Safety Notes
-----------------------
- This app provides health-related information via an AI assistant. It is NOT a replacement for professional medical advice.
- The assistant code includes strict disclaimers and response-guidelines in `services/geminiService.ts`. Keep those safety rules intact when modifying prompts.
- Move API keys and Firebase configuration out of source control and into environment variables or a secret manager.

Contributing
------------
- Fork the repo and open a pull request with a clear description.
- Please add tests for any new or changed behavior.
- Open an issue for any bugs or feature requests.

Contact & Acknowledgements
--------------------------
- Maintained by Omar Faruk Fahim and Maruf (ByteForge).
- Contributors: soton, sakib, fazla.

Next steps / Suggestions
------------------------
- Replace hard-coded keys with environment variable usage.
- Add a short demo GIF or screenshots in this README.
- Add a `CONTRIBUTING.md` with detailed contribution and PR guidelines.

Thank you for checking out MediGen — if you'd like, I can:
- Add a `.env.example` file and update the code to read env vars, or
- Create a `CONTRIBUTING.md` template and a simple screenshot example.
