import { useState } from 'react';

const CODE_FILES = {
  'App.jsx': `import { useState, useEffect } from 'react';
import TrackerTab from './components/TrackerTab';
import PlannerTab from './components/PlannerTab';

const STORAGE_KEY = 'study-smart-entries';

const tabs = [
  { id: 'tracker', label: 'Study Tracker', icon: '📊' },
  { id: 'planner', label: 'Study Planner', icon: '🗓️' },
];

function App() {
  const [activeTab, setActiveTab] = useState('tracker');
  const [entries, setEntries] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  const handleAddEntry = (entry) => {
    setEntries((prev) => [...prev, entry]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br ...">
      <header>
        {/* Tab navigation */}
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </header>
      <main>
        {activeTab === 'tracker' && <TrackerTab entries={entries} onAddEntry={handleAddEntry} />}
        {activeTab === 'planner' && <PlannerTab entries={entries} />}
      </main>
    </div>
  );
}

export default App;`,

  'TrackerTab.jsx': `import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { SUBJECTS, SUBJECT_COLORS } from '../constants';

function TrackerTab({ entries, onAddEntry }) {
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('Math');
  const [hours, setHours] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const h = parseFloat(hours);
    if (!name.trim() || isNaN(h) || h <= 0) return;
    onAddEntry({
      name: name.trim(), subject,
      hours: h, date: new Date().toISOString()
    });
    setHours('');
  };

  // Aggregate hours per subject
  const totals = SUBJECTS.map((subj) => ({
    subject: subj,
    hours: entries.filter((e) => e.subject === subj)
      .reduce((sum, e) => sum + e.hours, 0),
  })).filter((d) => d.hours > 0);

  return (
    <div>
      {/* Form: name, subject, hours, submit */}
      <form onSubmit={handleSubmit}>
        <input value={name} onChange={(e) => setName(e.target.value)} />
        <select value={subject} onChange={(e) => setSubject(e.target.value)}>
          {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
        </select>
        <input type="number" value={hours}
          onChange={(e) => setHours(e.target.value)} />
        <button type="submit">Log Hours</button>
      </form>

      {/* Color-coded bar chart */}
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={totals}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="subject" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="hours" radius={[6, 6, 0, 0]}>
            {totals.map((entry) => (
              <Cell key={entry.subject}
                fill={SUBJECT_COLORS[entry.subject]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Recent entries table */}
      <table>
        {entries.reverse().slice(0, 10).map((entry, i) => (
          <tr key={i}>
            <td>{entry.name}</td>
            <td>{entry.subject}</td>
            <td>{entry.hours}h</td>
          </tr>
        ))}
      </table>
    </div>
  );
}

export default TrackerTab;`,

  'PlannerTab.jsx': `import { useState } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
} from 'recharts';
import { SUBJECT_COLORS, DEFAULT_DISTRIBUTION } from '../constants';

const CORE_SUBJECTS = ['Math', 'Science', 'English', 'History'];

function PlannerTab({ entries }) {
  const [availableHours, setAvailableHours] = useState(10);
  const [distribution, setDistribution] = useState({
    ...DEFAULT_DISTRIBUTION
  });

  const handleSliderChange = (subject, value) => {
    const newVal = parseInt(value, 10);
    const others = CORE_SUBJECTS.filter((s) => s !== subject);
    const remaining = 100 - newVal;
    // Proportionally redistribute among others
    const othersTotal = others.reduce(
      (sum, s) => sum + distribution[s], 0
    );
    let newDist = { ...distribution, [subject]: newVal };
    others.forEach((s, i) => {
      if (i === others.length - 1) {
        newDist[s] = remaining - allocated;
      } else {
        const share = Math.round(
          (distribution[s] / othersTotal) * remaining
        );
        newDist[s] = Math.max(0, share);
      }
    });
    setDistribution(newDist);
  };

  // Pie chart data
  const pieData = CORE_SUBJECTS
    .filter((s) => distribution[s] > 0)
    .map((s) => ({
      name: s,
      value: distribution[s],
      hours: ((distribution[s] / 100) * availableHours).toFixed(1),
    }));

  // Actual vs recommended comparison
  const actualHours = {};
  CORE_SUBJECTS.forEach((s) => {
    actualHours[s] = entries
      .filter((e) => e.subject === s)
      .reduce((sum, e) => sum + e.hours, 0);
  });

  return (
    <div>
      {/* Hours slider */}
      <input type="range" min="1" max="40"
        value={availableHours}
        onChange={(e) => setAvailableHours(parseInt(e.target.value))}
      />

      {/* Subject % sliders (auto-rebalance to 100%) */}
      {CORE_SUBJECTS.map((subj) => (
        <input key={subj} type="range" min="0" max="100"
          value={distribution[subj]}
          onChange={(e) => handleSliderChange(subj, e.target.value)}
        />
      ))}

      {/* Donut pie chart */}
      <PieChart>
        <Pie data={pieData} innerRadius={60} outerRadius={100}>
          {pieData.map((e) => (
            <Cell key={e.name} fill={SUBJECT_COLORS[e.name]} />
          ))}
        </Pie>
      </PieChart>

      {/* Weekly breakdown table */}
      {/* Recommended vs Actual bar chart */}
    </div>
  );
}

export default PlannerTab;`,

  'constants.js': `export const SUBJECTS = [
  'Math', 'Science', 'English', 'History', 'Other'
];

export const SUBJECT_COLORS = {
  Math: '#6366f1',      // indigo
  Science: '#22c55e',   // green
  English: '#f59e0b',   // amber
  History: '#ef4444',   // red
  Other: '#8b5cf6',     // violet
};

export const DEFAULT_DISTRIBUTION = {
  Math: 30,      // 30%
  Science: 25,   // 25%
  English: 25,   // 25%
  History: 20,   // 20%
  Other: 0,
};`,

  'main.jsx': `import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)`,

  'index.css': `@import "tailwindcss";

body {
  margin: 0;
  font-family: system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
}`,
};

// Simple syntax highlighting for JSX
function highlightCode(code) {
  const lines = code.split('\n');
  return lines.map((line, i) => {
    let highlighted = line
      // Strings (single and double quotes, template literals)
      .replace(/(["'`])(?:(?!\1|\\).|\\.)*?\1/g, '<span class="text-emerald-400">$&</span>')
      // Keywords
      .replace(/\b(import|export|from|const|let|var|function|return|if|else|default|new|try|catch|typeof|instanceof)\b/g, '<span class="text-purple-400">$&</span>')
      // React/JSX keywords
      .replace(/\b(useState|useEffect|useRef|useCallback|useMemo)\b/g, '<span class="text-yellow-300">$&</span>')
      // Numbers
      .replace(/\b(\d+\.?\d*)\b/g, '<span class="text-orange-400">$&</span>')
      // Comments
      .replace(/(\/\/.*)$/g, '<span class="text-gray-500 italic">$1</span>')
      // JSX tags
      .replace(/(&lt;\/?)([\w.]+)/g, '$1<span class="text-sky-400">$2</span>')
      .replace(/(<\/?)([\w.]+)/g, '$1<span class="text-sky-400">$2</span>');
    return highlighted;
  });
}

function CodeViewer() {
  const [activeFile, setActiveFile] = useState('App.jsx');
  const [collapsed, setCollapsed] = useState(false);

  const fileNames = Object.keys(CODE_FILES);
  const code = CODE_FILES[activeFile];
  const lines = highlightCode(code);

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-50 bg-gray-900 text-gray-300 px-2 py-4 rounded-l-lg shadow-lg border border-gray-700 border-r-0 hover:bg-gray-800 transition-colors"
        title="Show code panel"
      >
        <span className="text-xs font-mono writing-mode-vertical" style={{ writingMode: 'vertical-rl' }}>&lt;/&gt; Code</span>
      </button>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900 border-l border-gray-700">
      {/* Code panel header */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <span className="text-indigo-400 font-mono text-xs font-bold">&lt;/&gt;</span>
          <span className="text-gray-300 text-xs font-semibold">Source Code</span>
        </div>
        <button
          onClick={() => setCollapsed(true)}
          className="text-gray-500 hover:text-gray-300 text-sm px-1.5 transition-colors"
          title="Collapse panel"
        >
          &raquo;
        </button>
      </div>

      {/* File tabs */}
      <div className="flex overflow-x-auto bg-gray-850 border-b border-gray-700 scrollbar-thin" style={{ backgroundColor: '#1a1b26' }}>
        {fileNames.map((name) => (
          <button
            key={name}
            onClick={() => setActiveFile(name)}
            className={`px-3 py-2 text-xs font-mono whitespace-nowrap border-b-2 transition-colors ${
              activeFile === name
                ? 'border-indigo-400 text-indigo-300 bg-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-gray-800'
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      {/* File path breadcrumb */}
      <div className="px-3 py-1.5 bg-gray-800/50 border-b border-gray-700/50">
        <span className="text-[10px] font-mono text-gray-500">
          src/{activeFile.includes('Tab') ? `components/${activeFile}` : activeFile}
        </span>
      </div>

      {/* Code area */}
      <div className="flex-1 overflow-auto font-mono text-xs leading-5">
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, i) => (
              <tr key={i} className="hover:bg-gray-800/50 group">
                <td className="text-right pr-4 pl-3 py-0 text-gray-600 select-none w-8 align-top group-hover:text-gray-500">
                  {i + 1}
                </td>
                <td
                  className="py-0 pr-4 text-gray-300 whitespace-pre"
                  dangerouslySetInnerHTML={{ __html: line }}
                />
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between px-3 py-1 bg-indigo-600 text-white text-[10px]">
        <span>{activeFile}</span>
        <span>
          {code.split('\n').length} lines &middot; JSX &middot; UTF-8
        </span>
      </div>
    </div>
  );
}

export default CodeViewer;
