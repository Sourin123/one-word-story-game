# One Word Story - Multiplayer Game

An improv multiplayer party game where 2-10 players build a hilarious story one word at a time, backed by Firebase real-time multiplayer, zero-cost AI bots, and an expressive Text-to-Speech read-aloud finale.

## Features
- **Online Multiplayer**: Real-time room codes synced via Firebase Firestore (`multiplayer-bd6af`).
- **Couch Party / Bot Sandbox**: Play immediately on a single screen without waiting for external players.
- **2 to 10 Player Capacity**: Add bots with distinct comedic styles (Grammar Glue, Chaotic Goblin, Dramatic Soap, Sci-Fi Nerd, Spooky Ghost).
- **Match Timers**: Choose between 5-, 10-, 20-, and 40-minute games, with configurable per-turn timers. If a player runs out of turn time, their turn is skipped without adding a word.
- **Turn-Synced Multiplayer**: Only the current human player's account can submit a word in an online room. Story updates and turn advances use Firestore transactions.
- **Player Identity**: Choose a display name and emoji before creating or joining a room.
- **Leave Room**: Use the header's **Leave Room** button (or click the app title) to return home; online departures remove the player and transfer host control when possible.
- **Host-Controlled LLM**: The host can allow or disable LLM bot turns and finale direction in the lobby in both sandbox and online rooms. When disabled, bots and finale direction use local logic. In online play, only the host's browser makes LLM requests and syncs bot words to the room.
- **Expanded Local Bots**: Offline and fallback bots draw from 12,000 common spoken-English words, plus persona-specific vocabulary. Basic word-role rules and recent-word avoidance add variety; the local word-role classifier is heuristic, not a language model.
- **AI Failure Handling**: If an AI provider times out, rejects its key/model, or returns an invalid or repeated word, the bot uses another AI provider or a contextual local word instead of generic filler. A status message explains provider failures without revealing API keys.
- **NVIDIA AI Bot Model**: Configure an OpenRouter key and NVIDIA Nemotron model in **Free AI Router**. The app defaults to `nvidia/nemotron-3-nano-30b-a3b:free`; availability and usage limits depend on OpenRouter.
- **AI Agent Module**: Bot personas, contextual word generation, AI provider routing, and finale direction are organized in [`src/aiAgents.js`](./src/aiAgents.js), separate from the application UI.
- The generated vocabulary can be rebuilt with `npm run build:vocabulary`. It is derived from the SUBTLEX-US frequency list in [`subtlex-word-frequencies`](https://www.npmjs.com/package/subtlex-word-frequencies); see [`LICENSES/subtlex-word-frequencies-ISC.txt`](./LICENSES/subtlex-word-frequencies-ISC.txt).
- **Expressive Read-Aloud Finale**: Syncs across all devices to recite the story aloud using Web Speech API voice modulation and procedural Web Audio SFX (boing, gasp, boom, applause).

## How to Run Locally
1. Unzip the project folder.
2. In the terminal, run:
   ```bash
   npm install
   npm run dev
   ```
3. Open `http://localhost:5173` in your browser.

## Configure the NVIDIA AI model
1. Copy `.env.example` to `.env.local` in the project root (or edit the provided `.env.local`).
2. Set `VITE_OPENROUTER_API_KEY` to your OpenRouter key and leave `VITE_OPENROUTER_MODEL` as `nvidia/nemotron-3-nano-30b-a3b:free`.
3. Optionally add provider keys to `VITE_GEMINI_API_KEY` or `VITE_GROQ_API_KEY`.
4. Restart the Vite dev server after changing `.env.local`. Bot turns and finale direction use OpenRouter first when its key is configured.

`.env.local` is ignored by Git. **Vite variables prefixed with `VITE_` are embedded in the browser bundle and are not secret.** This setup is only suitable for local/private use. Do not deploy a public app with personal API keys in the frontend; use a backend proxy with server-side environment variables for shared hosting. Free model access, rate limits, and model IDs can change on OpenRouter.

## Troubleshoot online multiplayer
If the app reports that Firebase sign-in failed, check the error code shown in the message:
- `auth/operation-not-allowed`: In Firebase Console, open **Authentication > Sign-in method** and enable **Anonymous**.
- `auth/unauthorized-domain`: In **Authentication > Settings > Authorized domains**, add the hostname serving the app (for local development, add `localhost`).
- `auth/network-request-failed`: Check the connection, browser privacy/ad-blocking extensions, and firewall.
- Firestore `permission-denied`: Review the Firestore security rules. Room reads and writes must allow authenticated users; do not make a public database rule that permits unrestricted access.

Online buttons remain unavailable until authentication succeeds. The app displays the Firebase error code and a relevant next step; sandbox play remains available.

## How to Host Online for ₹0 / $0
1. Build the production files:
   ```bash
   npm run build
   ```
2. Go to [app.netlify.com/drop](https://app.netlify.com/drop) and drag the generated `dist` folder onto the page.
3. Your live game link is ready instantly!
