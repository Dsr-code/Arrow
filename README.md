# Arrow — Modern Goal Tracking Web App

<div align="center">
  <h3>Aim. Track. Achieve.</h3>
  <p>A distraction-free, privacy-first goal roadmap and habit tracker with intelligent link detection, daily study logs, celebratory micro-interactions, and progressive web app (PWA) desktop installation support.</p>
</div>

---

## 🌟 Key Features

### 1. Dashboard
- **Goal Cards Grid**: Real-time progress percentage, completed vs total days counter, active streak badges, and next upcoming milestone preview.
- **Circular Progress Rings**: Custom animated SVG rings with smooth stroke-dashoffset transitions and calm gradient styling.
- **Overview Metrics Bar**: Real-time tracking of active roadmaps, completed days, overall progress, and highest streak across all goals.
- **New Goal Action**: Prominent `+ New Goal` button with quick access modal and duration presets.

### 2. Goal Creation & Auto-Roadmap Generation
- **Fast Goal Setup**: Specify Goal Name and Target Days (1 to 365).
- **Preset Durations**: Quick chips for 7, 14, 21, 30, 60, or 100-day challenges.
- **Instant Day Generation**: Automatically generates Day 1 through Day N with default milestone titles ready for customization.

### 3. Goal Detail & Timeline
- **Roadmap Header**: Dynamic overall progress bar, streak counter, creation date, and quick "Next Pending Day" focus button.
- **Goal Renaming & Deletion**: Inline editing of goal titles and a safe deletion flow with custom confirmation modal.
- **Filtering & Search**: Filter timeline days by `All`, `Pending`, `Completed`, or `With Notes`, with real-time text search across topics and notes.

### 4. Interactive Day Cards
- **Milestone Indexing**: Clear day badges (`Day 1`, `Day 2`, ...).
- **Inline Topic Editing**: Click or double-click to edit milestone names; auto-saves on blur or `Enter`, cancels on `Escape`.
- **Smart Resource Pills (Never Raw URLs)**:
  - `youtube.com` / `youtu.be` ➔ **"Watch on YouTube"** (Play icon, soft rose accent)
  - Known practice platforms (*LeetCode*, *HackerRank*, *Codeforces*, *GeeksforGeeks*, *Codewars*, *Exercism*, *NeetCode*, etc.) ➔ **"Practice"** (Code icon, soft indigo accent)
  - Documentation, articles & other links ➔ **"Open Resource"** (External link icon, soft slate accent)
  - Opens in new tab, includes hover lift animation, and instant hover removal (`×`).
  - Add Resource dialog with **real-time live type detection preview** before saving.
- **Satisfying Milestone Completion**:
  - Smooth check animation with micro-interaction feedback.
  - Soft emerald tint across card and subtle strikethrough styling on completed topic.
  - Celebratory confetti burst effect (larger celebration when completing the entire roadmap!).
- **Daily Reflection & Study Logs**:
  - `+ Create Log` button expands a rich study reflection textarea.
  - Autosaved on typing with timestamp recording (`Last edited ...`).
  - Small "Log Notes" indicator on the card when a log exists, with view/edit/delete controls.

### 5. Extras & Polish
- 🌓 **Dark / Light Theme**: Smooth theme transitions with persisted preference and system theme detection.
- 🔥 **Streak Counters**: Calculates consecutive completed milestone streaks per goal and globally.
- 🍞 **Toast Notifications**: Non-intrusive animated toast messages for actions (creating, updating, completing, adding links).
- 💾 **100% Local Storage Persistence**: Zero account creation, private, works offline.
- 📦 **Backup & Restore**: One-click JSON export and import to preserve or transfer roadmaps.
- 💻 **Desktop Web App (PWA)**: Downloadable and installable as a standalone desktop window on Windows, macOS, Linux, ChromeOS, iOS, and Android.

---

## 🏗️ Architecture & Project Structure

```
arrow/
├── public/
│   ├── favicon.svg          # Arrow gradient brand icon
│   ├── manifest.json        # Web App Manifest for Desktop PWA
│   └── sw.js                # Service Worker for offline caching & installability
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── CircularProgress.tsx # Animated SVG progress ring
│   │   │   ├── ConfirmModal.tsx     # Reusable confirmation dialog
│   │   │   ├── Footer.tsx           # Clean footer
│   │   │   ├── Header.tsx           # Navigation, streak, theme, PWA install
│   │   │   └── InstallAppModal.tsx  # PWA installation guidance modal
│   │   ├── dashboard/
│   │   │   ├── CreateGoalModal.tsx  # Goal creation modal with presets
│   │   │   ├── EmptyState.tsx       # Warm friendly zero-state view
│   │   │   ├── GoalCard.tsx         # Goal card with progress ring & stats
│   │   │   └── GoalStatsBar.tsx     # Metrics summary cards
│   │   └── goal-detail/
│   │       ├── AddResourceModal.tsx # URL input with live detection preview
│   │       ├── DayCard.tsx          # Timeline day card with all actions
│   │       ├── DayLogEditor.tsx     # Expanding autosaved notes editor
│   │       ├── GoalHeader.tsx       # Detail page header & filters
│   │       └── ResourcePill.tsx     # Pill buttons for YouTube, Practice, etc.
│   ├── context/
│   │   └── ToastContext.tsx         # Toast notification state and animated UI
│   ├── hooks/
│   │   ├── useGoals.ts              # High-level state management for goals
│   │   ├── useLocalStorage.ts       # Typed storage hook with cross-tab sync
│   │   ├── usePWAInstall.ts         # PWA installation prompt handler
│   │   └── useTheme.ts              # Theme management (light/dark/system)
│   ├── pages/
│   │   ├── DashboardPage.tsx        # Dashboard grid view
│   │   └── GoalDetailPage.tsx       # Individual goal roadmap timeline view
│   ├── types/
│   │   └── goal.ts                  # Goal, Day, Resource, DayLog types
│   ├── utils/
│   │   ├── linkDetector.ts          # URL classification logic
│   │   ├── sampleData.ts            # Seed goal ("Learn Python", 7 days)
│   │   ├── soundEffects.ts          # Confetti celebration micro-interactions
│   │   └── streak.ts                # Streak & progress metrics calculations
│   ├── App.tsx                      # App root with hash routing
│   ├── index.css                    # Tailwind CSS directives & custom styles
│   └── main.tsx                     # React DOM entrypoint
├── tailwind.config.js               # Custom colors, shadows, and radii
└── vite.config.ts                   # Vite configuration
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (tested on Node v24)
- npm or yarn / pnpm

### Installation & Run

1. **Navigate to the project directory**:
   ```bash
   cd arrow
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:3000`.

4. **Build for production**:
   ```bash
   npm run build
   ```
   The built static assets will be located in the `dist/` directory.

---

## 💻 Installing as a Desktop App

Arrow includes Web App Manifest (`manifest.json`) and Service Worker (`sw.js`) support, allowing it to run as a native desktop application in its own distraction-free window:

1. Open Arrow in Google Chrome, Microsoft Edge, or Brave.
2. Click the **"Desktop App"** button in the header, or click the **Install icon (⊕ or computer icon)** on the right side of your browser's address bar.
3. Click **Install**.
4. Arrow will launch in an independent app window with its own taskbar/dock icon and offline capability!
