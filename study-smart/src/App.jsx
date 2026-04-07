import { useState, useEffect } from 'react';
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-500 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-md">
              S
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800 leading-tight">Study Smart</h1>
              <p className="text-xs text-gray-400">Your personal study companion</p>
            </div>
          </div>
          <div className="text-xs text-gray-400 hidden sm:block">
            {entries.length} session{entries.length !== 1 ? 's' : ''} logged
          </div>
        </div>

        {/* Tab Bar */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {activeTab === 'tracker' && (
          <TrackerTab entries={entries} onAddEntry={handleAddEntry} />
        )}
        {activeTab === 'planner' && (
          <PlannerTab entries={entries} />
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-4 sm:px-6 py-6 text-center text-xs text-gray-400 border-t border-gray-100 mt-4">
        Study Smart &mdash; Built for 8th Grade Students
      </footer>
    </div>
  );
}

export default App;
