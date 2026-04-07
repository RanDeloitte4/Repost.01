# Study Smart — Development Process

## Overview

**Study Smart** is a React + Vite web application built for 8th grade students (ages 13–14) to help them track their study sessions and plan their weekly study schedule intelligently.

---

## 1. Project Initialization

The project was scaffolded using the official Vite React template:

```bash
npm create vite@latest study-smart -- --template react
cd study-smart
npm install
```

---

## 2. Dependency Installation

### Core Libraries
```bash
npm install recharts
```

### Styling — Tailwind CSS v4
Since Tailwind CSS v4 was installed (a major version change from v3), the setup differs from the traditional approach:

```bash
npm install -D tailwindcss postcss autoprefixer
npm install -D @tailwindcss/vite
```

> **Note:** Tailwind CSS v4 no longer uses a `tailwind.config.js` file or a PostCSS config. Instead, it uses a Vite plugin and a single CSS import.

---

## 3. Configuration

### `vite.config.js`
The Tailwind v4 Vite plugin was registered alongside the React plugin:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

### `src/index.css`
Tailwind is imported with a single directive:

```css
@import "tailwindcss";
```

---

## 4. Project Structure

```
study-smart/
├── index.html
├── vite.config.js
├── package.json
└── src/
    ├── main.jsx              # React entry point
    ├── index.css             # Tailwind CSS import
    ├── App.jsx               # Root component — tab navigation + state
    ├── constants.js          # Shared subjects, colors, default distribution
    └── components/
        ├── TrackerTab.jsx    # Study Tracker feature
        └── PlannerTab.jsx    # Study Planner feature
```

---

## 5. Shared Constants (`constants.js`)

A single source of truth was defined for subjects and their color mappings, and the default planner distribution:

| Subject  | Color   | Default % |
|----------|---------|-----------|
| Math     | Indigo  | 30%       |
| Science  | Green   | 25%       |
| English  | Amber   | 25%       |
| History  | Red     | 20%       |
| Other    | Violet  | 0%        |

---

## 6. Root App Component (`App.jsx`)

- Manages global `entries` state (array of study log objects)
- Persists data to `localStorage` via `useEffect`
- Reads from `localStorage` on initial load via lazy state initializer
- Renders tab navigation (Tracker / Planner) and conditionally mounts the active tab

---

## 7. Feature 1 — Study Tracker (`TrackerTab.jsx`)

### What it does
- Student enters their **name**, selects a **subject**, and inputs **hours studied**
- Entries are validated (name required, hours must be a positive number ≤ 168)
- Data is stored in the parent's state (and persisted to `localStorage`)

### UI Components
- **Log form** — 4-column responsive grid (name, subject, hours, submit button)
- **Stat cards** — one card per active subject showing total hours, plus an overall total card
- **Bar chart** — built with recharts `BarChart`, color-coded by subject using `<Cell>`
- **Recent entries table** — shows last 10 entries in reverse chronological order with color-coded subject badges

### Key Implementation Details
- `SUBJECTS` and `SUBJECT_COLORS` imported from `constants.js`
- Hours are aggregated per subject using `.filter().reduce()`
- Chart only renders subjects that have at least one entry

---

## 8. Feature 2 — Study Planner (`PlannerTab.jsx`)

### What it does
- Student inputs their **available weekly hours** (1–40)
- App applies the **8th grade recommended distribution** (Math 30%, Science 25%, English 25%, History 20%)
- Student can **adjust percentages** using sliders — the remaining subjects auto-rebalance proportionally so the total always stays at 100%
- Shows a **pie chart** and **weekly breakdown table**
- Shows a **"Recommended vs. Actual"** comparison bar chart if tracker data exists

### Slider Auto-Rebalance Logic
When one slider is moved:
1. Calculate the remaining percentage (`100 - newValue`)
2. Find the proportional share of each other subject based on their current values
3. Distribute the remaining percentage proportionally
4. A rounding correction is applied to the last subject to guarantee the sum is exactly 100%

### UI Components
- **Hours slider + number input** — dual control with `accent-indigo-500`
- **Subject sliders** — one per core subject, each styled with its subject color via `accentColor`
- **Reset button** — restores the default 30/25/25/20 distribution
- **Donut pie chart** — recharts `PieChart` with `innerRadius`, custom tooltip showing % and hours
- **Breakdown table** — Subject / % / Hours per week / Hours per day (assuming 5 study days)
- **Comparison bar chart** — grouped bars (recommended in light indigo, actual in indigo)
- **Status badges** — "On track", "+Xh over", or "-Xh under" per subject

---

## 9. UI & Design Decisions

- **Color palette:** Indigo as the primary accent; each subject has a distinct, accessible color
- **Typography:** System UI font stack for fast loading and native feel
- **Background:** Subtle gradient (`from-slate-50 via-indigo-50 to-purple-50`) for a friendly, modern look
- **Cards:** White cards with soft shadows and rounded-2xl corners
- **Sticky header:** Tab bar stays visible on scroll
- **Responsive:** Single-column on mobile, multi-column grid on tablet/desktop (Tailwind's `sm:` and `lg:` breakpoints)

---

## 10. Running the App

```bash
cd study-smart
npm run dev
```

The dev server starts at `http://localhost:5173` by default.

To create a production build:

```bash
npm run build
```

---

## 11. Tech Stack Summary

| Tool           | Version  | Purpose                        |
|----------------|----------|--------------------------------|
| React          | 18       | UI framework                   |
| Vite           | 8        | Build tool and dev server      |
| Tailwind CSS   | 4        | Utility-first styling          |
| recharts       | latest   | Bar, pie, and grouped charts   |
| localStorage   | browser  | Client-side data persistence   |
