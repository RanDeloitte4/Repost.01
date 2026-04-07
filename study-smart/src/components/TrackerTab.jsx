import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { SUBJECTS, SUBJECT_COLORS } from '../constants';

function TrackerTab({ entries, onAddEntry }) {
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('Math');
  const [hours, setHours] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    const h = parseFloat(hours);
    if (isNaN(h) || h <= 0 || h > 168) {
      setError('Please enter valid hours (0–168).');
      return;
    }
    onAddEntry({ name: name.trim(), subject, hours: h, date: new Date().toISOString() });
    setHours('');
    setSuccess(`Logged ${h}h of ${subject} for ${name.trim()}!`);
    setTimeout(() => setSuccess(''), 3000);
  };

  // Aggregate hours per subject across all entries
  const totals = SUBJECTS.map((subj) => ({
    subject: subj,
    hours: entries
      .filter((e) => e.subject === subj)
      .reduce((sum, e) => sum + e.hours, 0),
  })).filter((d) => d.hours > 0);

  const totalHours = entries.reduce((sum, e) => sum + e.hours, 0);

  return (
    <div className="space-y-8">
      {/* Entry Form */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-5">Log Study Time</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Subject</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50"
            >
              {SUBJECTS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Hours Studied</label>
            <input
              type="number"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              placeholder="e.g. 2.5"
              min="0.1"
              max="168"
              step="0.5"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-colors"
            >
              Log Hours
            </button>
          </div>
        </form>
        {error && <p className="mt-3 text-sm text-red-500 font-medium">{error}</p>}
        {success && <p className="mt-3 text-sm text-green-500 font-medium">{success}</p>}
      </div>

      {/* Summary */}
      {totals.length > 0 ? (
        <>
          {/* Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {SUBJECTS.filter((s) => entries.some((e) => e.subject === s)).map((subj) => {
              const subjectHours = entries
                .filter((e) => e.subject === subj)
                .reduce((sum, e) => sum + e.hours, 0);
              return (
                <div
                  key={subj}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col items-center"
                >
                  <span
                    className="w-3 h-3 rounded-full mb-2"
                    style={{ backgroundColor: SUBJECT_COLORS[subj] }}
                  />
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{subj}</span>
                  <span className="text-2xl font-bold text-gray-800 mt-1">{subjectHours}h</span>
                </div>
              );
            })}
            <div className="bg-indigo-50 rounded-xl border border-indigo-100 shadow-sm p-4 flex flex-col items-center">
              <span className="w-3 h-3 rounded-full mb-2 bg-indigo-400" />
              <span className="text-xs font-semibold text-indigo-500 uppercase tracking-wide">Total</span>
              <span className="text-2xl font-bold text-indigo-700 mt-1">{totalHours}h</span>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Weekly Summary</h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={totals} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="subject" tick={{ fontSize: 13, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 12, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                  label={{ value: 'Hours', angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: 12, fill: '#9ca3af' } }}
                />
                <Tooltip
                  contentStyle={{ borderRadius: '10px', border: '1px solid #e5e7eb', fontSize: 13 }}
                  formatter={(val) => [`${val}h`, 'Hours']}
                />
                <Bar dataKey="hours" radius={[6, 6, 0, 0]} maxBarSize={64}>
                  {totals.map((entry) => (
                    <Cell key={entry.subject} fill={SUBJECT_COLORS[entry.subject]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Entry Log */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Entries</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-100">
                    <th className="pb-3 font-semibold">Name</th>
                    <th className="pb-3 font-semibold">Subject</th>
                    <th className="pb-3 font-semibold">Hours</th>
                    <th className="pb-3 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {[...entries].reverse().slice(0, 10).map((entry, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-2.5 font-medium text-gray-700">{entry.name}</td>
                      <td className="py-2.5">
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-white text-xs font-semibold"
                          style={{ backgroundColor: SUBJECT_COLORS[entry.subject] }}
                        >
                          {entry.subject}
                        </span>
                      </td>
                      <td className="py-2.5 font-semibold text-gray-700">{entry.hours}h</td>
                      <td className="py-2.5 text-gray-400">{new Date(entry.date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="text-5xl mb-4">📚</div>
          <p className="text-gray-500 text-base">No entries yet. Log your first study session above!</p>
        </div>
      )}
    </div>
  );
}

export default TrackerTab;
