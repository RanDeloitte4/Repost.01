import { useState, useEffect } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { SUBJECTS, SUBJECT_COLORS, DEFAULT_DISTRIBUTION } from '../constants';

const CORE_SUBJECTS = ['Math', 'Science', 'English', 'History'];

function PlannerTab({ entries }) {
  const [availableHours, setAvailableHours] = useState(10);
  const [distribution, setDistribution] = useState({ ...DEFAULT_DISTRIBUTION });
  const [sliderError, setSliderError] = useState('');

  const total = CORE_SUBJECTS.reduce((sum, s) => sum + distribution[s], 0);

  const handleSliderChange = (subject, value) => {
    const newVal = parseInt(value, 10);
    const others = CORE_SUBJECTS.filter((s) => s !== subject);
    const remaining = 100 - newVal;
    // Proportionally redistribute remaining percentage among others
    const currentOthersTotal = others.reduce((sum, s) => sum + distribution[s], 0);
    let newDist = { ...distribution, [subject]: newVal };
    if (currentOthersTotal === 0) {
      const share = Math.floor(remaining / others.length);
      others.forEach((s, i) => {
        newDist[s] = i === others.length - 1 ? remaining - share * (others.length - 1) : share;
      });
    } else {
      let allocated = 0;
      others.forEach((s, i) => {
        if (i === others.length - 1) {
          newDist[s] = remaining - allocated;
        } else {
          const share = Math.round((distribution[s] / currentOthersTotal) * remaining);
          newDist[s] = Math.max(0, share);
          allocated += newDist[s];
        }
      });
    }
    // Ensure nothing goes negative
    CORE_SUBJECTS.forEach((s) => { newDist[s] = Math.max(0, newDist[s]); });
    const sum = CORE_SUBJECTS.reduce((s, k) => s + newDist[k], 0);
    if (sum !== 100) newDist[CORE_SUBJECTS[CORE_SUBJECTS.length - 1]] += 100 - sum;
    setDistribution(newDist);
    setSliderError(sum !== 100 ? '' : '');
  };

  const resetDistribution = () => {
    setDistribution({ ...DEFAULT_DISTRIBUTION });
    setSliderError('');
  };

  // Pie chart data (only core subjects with >0%)
  const pieData = CORE_SUBJECTS
    .filter((s) => distribution[s] > 0)
    .map((s) => ({
      name: s,
      value: distribution[s],
      hours: ((distribution[s] / 100) * availableHours).toFixed(1),
    }));

  // Actual hours from tracker
  const actualHours = {};
  CORE_SUBJECTS.forEach((s) => {
    actualHours[s] = entries.filter((e) => e.subject === s).reduce((sum, e) => sum + e.hours, 0);
  });
  const hasActual = Object.values(actualHours).some((h) => h > 0);

  // Comparison bar chart data
  const compData = CORE_SUBJECTS.map((s) => ({
    subject: s,
    recommended: parseFloat(((distribution[s] / 100) * availableHours).toFixed(1)),
    actual: actualHours[s],
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-3 text-sm">
          <p className="font-bold text-gray-700">{d.name}</p>
          <p className="text-gray-500">{d.value}% &rarr; <span className="font-semibold text-gray-700">{d.hours}h</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {/* Hours Input */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Weekly Study Hours</h2>
        <p className="text-sm text-gray-500 mb-5">How many hours can you study this week?</p>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="1"
            max="40"
            value={availableHours}
            onChange={(e) => setAvailableHours(parseInt(e.target.value))}
            className="flex-1 accent-indigo-500"
          />
          <div className="flex items-center gap-1">
            <input
              type="number"
              min="1"
              max="40"
              value={availableHours}
              onChange={(e) => {
                const v = parseInt(e.target.value);
                if (!isNaN(v) && v >= 1 && v <= 40) setAvailableHours(v);
              }}
              className="w-16 px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-center font-bold text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50"
            />
            <span className="text-sm text-gray-500 font-medium">hrs/wk</span>
          </div>
        </div>
      </div>

      {/* Slider Controls */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Adjust Distribution</h2>
            <p className="text-sm text-gray-500 mt-0.5">Sliders automatically rebalance to 100%</p>
          </div>
          <button
            onClick={resetDistribution}
            className="text-xs font-semibold text-indigo-500 hover:text-indigo-700 border border-indigo-200 hover:border-indigo-400 px-3 py-1.5 rounded-lg transition-colors"
          >
            Reset to Default
          </button>
        </div>
        <div className="space-y-5">
          {CORE_SUBJECTS.map((subj) => {
            const recHours = ((distribution[subj] / 100) * availableHours).toFixed(1);
            return (
              <div key={subj}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: SUBJECT_COLORS[subj] }}
                    />
                    <span className="text-sm font-semibold text-gray-700">{subj}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">{recHours}h</span>
                    <span
                      className="text-sm font-bold w-10 text-right"
                      style={{ color: SUBJECT_COLORS[subj] }}
                    >
                      {distribution[subj]}%
                    </span>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={distribution[subj]}
                  onChange={(e) => handleSliderChange(subj, e.target.value)}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                  style={{ accentColor: SUBJECT_COLORS[subj] }}
                />
              </div>
            );
          })}
        </div>
        {sliderError && <p className="mt-3 text-sm text-red-500 font-medium">{sliderError}</p>}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Recommended Schedule</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((entry) => (
                  <Cell key={entry.name} fill={SUBJECT_COLORS[entry.name]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(value) => (
                  <span className="text-xs font-medium text-gray-600">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly Schedule Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Weekly Breakdown</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="pb-3 font-semibold">Subject</th>
                <th className="pb-3 font-semibold text-right">%</th>
                <th className="pb-3 font-semibold text-right">Hours/Week</th>
                <th className="pb-3 font-semibold text-right">Hours/Day</th>
              </tr>
            </thead>
            <tbody>
              {CORE_SUBJECTS.map((subj) => {
                const pct = distribution[subj];
                const hrs = (pct / 100) * availableHours;
                const perDay = (hrs / 5).toFixed(1);
                return (
                  <tr key={subj} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: SUBJECT_COLORS[subj] }}
                        />
                        <span className="font-medium text-gray-700">{subj}</span>
                      </div>
                    </td>
                    <td className="py-3 text-right font-semibold" style={{ color: SUBJECT_COLORS[subj] }}>
                      {pct}%
                    </td>
                    <td className="py-3 text-right text-gray-700 font-semibold">
                      {hrs.toFixed(1)}h
                    </td>
                    <td className="py-3 text-right text-gray-400">{perDay}h</td>
                  </tr>
                );
              })}
              <tr className="bg-gray-50">
                <td className="py-3 font-bold text-gray-700">Total</td>
                <td className="py-3 text-right font-bold text-gray-700">100%</td>
                <td className="py-3 text-right font-bold text-gray-700">{availableHours}h</td>
                <td className="py-3 text-right text-gray-500">{(availableHours / 5).toFixed(1)}h</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* vs Actual Comparison */}
      {hasActual && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-1">Recommended vs. Actual</h2>
          <p className="text-sm text-gray-500 mb-6">How your logged hours compare to the plan</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={compData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
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
                formatter={(val, name) => [`${val}h`, name === 'recommended' ? 'Recommended' : 'Actual']}
              />
              <Legend formatter={(val) => val === 'recommended' ? 'Recommended' : 'Actual'} />
              <Bar dataKey="recommended" fill="#a5b4fc" radius={[4, 4, 0, 0]} maxBarSize={40} name="recommended" />
              <Bar dataKey="actual" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={40} name="actual" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {CORE_SUBJECTS.map((subj) => {
              const rec = (distribution[subj] / 100) * availableHours;
              const act = actualHours[subj];
              const diff = act - rec;
              const isOver = diff > 0;
              const isOn = Math.abs(diff) < 0.5;
              return (
                <div key={subj} className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{subj}</p>
                  <p className={`text-sm font-bold mt-1 ${isOn ? 'text-green-600' : isOver ? 'text-indigo-600' : 'text-amber-500'}`}>
                    {isOn ? 'On track' : isOver ? `+${diff.toFixed(1)}h` : `${diff.toFixed(1)}h`}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!hasActual && (
        <div className="bg-indigo-50 rounded-2xl border border-indigo-100 p-6 text-center">
          <p className="text-indigo-600 text-sm font-medium">
            Log study hours in the <span className="font-bold">Tracker</span> tab to see how you compare to your plan!
          </p>
        </div>
      )}
    </div>
  );
}

export default PlannerTab;
