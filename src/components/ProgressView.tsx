import React, { useState } from 'react';
import { Meal, UserProfile, WeightRecord, TimeAggregation } from '../types';
import {
  aggregateDietStatistics,
  buildWeightVisualizationSeries,
} from '../utils/calculations';
import {
  TrendingUp,
  Scale,
  Clock,
  CheckCircle2,
  Info,
  Calendar,
  Sparkles,
  ArrowDownRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Area,
  AreaChart,
} from 'recharts';

interface ProgressViewProps {
  profile: UserProfile;
  meals: Meal[];
  weightHistory: WeightRecord[];
  onOpenLogWeight: () => void;
}

export const ProgressView: React.FC<ProgressViewProps> = ({
  profile,
  meals,
  weightHistory,
  onOpenLogWeight,
}) => {
  const [dietAggregation, setDietAggregation] = useState<TimeAggregation>('weekly');
  const [weightRange, setWeightRange] = useState<'1M' | '3M' | '6M' | 'ALL'>('1M');

  // Compute Aggregated Diet Statistics (Daily, Weekly, Monthly)
  const aggregatedDiet = aggregateDietStatistics(
    meals,
    profile.punctualityWindowMinutes,
    dietAggregation,
    new Date(2026, 8, 15)
  );

  const dietChartData = aggregatedDiet.map((item) => ({
    label: item.periodLabel,
    adherence: item.adherence !== null ? item.adherence : null,
    punctuality: item.punctuality !== null ? item.punctuality : null,
    planned: item.plannedMeals,
    completed: item.completedMeals,
    onTime: item.onTimeMeals,
  }));

  // Overall totals across all logged meals
  const totalPlanned = meals.length;
  const totalCompleted = meals.filter((m) => m.status === 'COMPLETED').length;
  const totalMissed = meals.filter((m) => m.status === 'MISSED').length;

  let totalOnTime = 0;
  for (const m of meals) {
    if (m.status === 'COMPLETED' && m.actualCompletionTime) {
      const [sh, sm] = m.scheduledTime.split(':').map(Number);
      const actTime = m.actualCompletionTime.includes('T')
        ? new Date(m.actualCompletionTime)
        : null;
      const actMins = actTime ? actTime.getHours() * 60 + actTime.getMinutes() : sh * 60 + sm;
      const schedMins = sh * 60 + sm;
      if (Math.abs(actMins - schedMins) <= profile.punctualityWindowMinutes) {
        totalOnTime++;
      }
    }
  }

  const overallAdherence = totalPlanned > 0 ? Math.round((totalCompleted / totalPlanned) * 100) : 0;
  const overallPunctuality = totalCompleted > 0 ? Math.round((totalOnTime / totalCompleted) * 100) : 0;

  // Weight series calculations
  const daysLookup = weightRange === '1M' ? 30 : weightRange === '3M' ? 90 : weightRange === '6M' ? 180 : 365;
  const weightSeries = buildWeightVisualizationSeries(weightHistory, daysLookup, '2026-09-15');

  const startWeight = profile.startingWeight || (weightHistory.length > 0 ? weightHistory[0].weight : profile.currentWeight);
  const currentWeight = profile.currentWeight;
  const netWeightChange = Math.round((currentWeight - startWeight) * 10) / 10;

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-24 md:pb-12 animate-in fade-in duration-300">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#f0f3ff] text-[#206140] font-bold text-[11px] border border-[#dee8ff]">
              Performance & Consistency
            </span>
          </div>
          <h1 className="text-[26px] sm:text-[30px] font-bold text-[#121c2c] mt-1">Your progress</h1>
          <p className="text-[14px] text-[#404942]">
            See how consistently you&apos;ve been following your plan.
          </p>
        </div>

        <button
          onClick={onOpenLogWeight}
          className="h-11 px-4 rounded-xl bg-[#206140] text-white font-bold text-[13px] flex items-center justify-center gap-2 hover:bg-[#3b7a57] transition-all shadow-xs"
        >
          <Scale className="w-4 h-4" />
          <span>+ Update weight</span>
        </button>
      </div>

      {/* Top 3 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Adherence */}
        <div className="p-5 rounded-2xl bg-white border border-[#dee8ff] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-bold text-[#404942]">Diet Adherence</span>
            <div className="w-8 h-8 rounded-full bg-[#aff1c6] text-[#206140] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-[32px] font-extrabold text-[#121c2c] leading-none">
              {overallAdherence}%
            </span>
            <p className="text-[11px] text-[#206140] font-bold mt-1">+6% this wk</p>
          </div>
          <span className="text-[11px] text-[#404942] mt-2">
            {totalCompleted} of {totalPlanned} planned meals eaten
          </span>
        </div>

        {/* Punctuality */}
        <div className="p-5 rounded-2xl bg-white border border-[#dee8ff] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-bold text-[#404942]">Eating Punctuality</span>
            <div className="w-8 h-8 rounded-full bg-[#ffdbc9] text-[#e06927] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-[32px] font-extrabold text-[#121c2c] leading-none">
              {overallPunctuality}%
            </span>
            <p className="text-[11px] text-[#e06927] font-bold mt-1">±{profile.punctualityWindowMinutes}m tolerance window</p>
          </div>
          <span className="text-[11px] text-[#404942] mt-2">
            {totalOnTime} of {totalCompleted} meals within window
          </span>
        </div>

        {/* Current Weight */}
        <div className="p-5 rounded-2xl bg-white border border-[#dee8ff] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-bold text-[#404942]">Body Scale</span>
            <div className="w-8 h-8 rounded-full bg-[#e7eeff] text-[#206140] flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-1">
              <span className="text-[32px] font-extrabold text-[#121c2c] leading-none">
                {currentWeight}
              </span>
              <span className="text-[14px] font-bold text-[#404942]">{profile.weightUnit}</span>
            </div>
            <p className="text-[11px] text-[#206140] font-bold mt-1 flex items-center gap-0.5">
              <ArrowDownRight className="w-3 h-3" />
              {Math.abs(netWeightChange)} {profile.weightUnit} net change
            </p>
          </div>
          <span className="text-[11px] text-[#404942] mt-2">
            Started at {startWeight} {profile.weightUnit}
          </span>
        </div>
      </div>

      {/* Diet Follow-up Graph (MANDATORY: Dual line for Adherence AND Punctuality on the SAME graph) */}
      <div className="p-6 rounded-2xl bg-white border border-[#dee8ff] shadow-xs flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-[18px] font-bold text-[#121c2c]">Diet Follow-up</h2>
            <p className="text-[12px] text-[#404942]">
              Solid Green: Adherence % • Orange Dashed: Punctuality %
            </p>
          </div>

          {/* Time aggregation toggle (Daily / Weekly / Monthly) */}
          <div className="flex items-center p-1 bg-[#f0f3ff] rounded-xl border border-[#dee8ff] self-start sm:self-auto">
            {(['daily', 'weekly', 'monthly'] as TimeAggregation[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setDietAggregation(mode)}
                className={`px-3 py-1 rounded-lg text-[12px] font-bold capitalize transition-all ${
                  dietAggregation === mode
                    ? 'bg-[#206140] text-white shadow-xs'
                    : 'text-[#404942] hover:text-[#121c2c]'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Dual Line Chart */}
        <div className="h-64 sm:h-72 w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dietChartData} margin={{ top: 15, right: 15, left: -20, bottom: 5 }}>
              <XAxis dataKey="label" stroke="#707972" fontSize={12} tickLine={false} />
              <YAxis domain={[0, 100]} stroke="#707972" fontSize={12} tickLine={false} tickCount={6} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #dee8ff',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
                  fontSize: '12px',
                }}
                formatter={(value: any, name: string) => [
                  value !== null ? `${value}%` : 'N/A',
                  name === 'adherence' ? 'Adherence' : 'Punctuality',
                ]}
              />
              <Line
                type="monotone"
                dataKey="adherence"
                name="Adherence"
                stroke="#206140"
                strokeWidth={3}
                dot={{ r: 4, fill: '#206140' }}
                activeDot={{ r: 6 }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="punctuality"
                name="Punctuality"
                stroke="#e06927"
                strokeWidth={2.5}
                strokeDasharray="5 5"
                dot={{ r: 4, fill: '#e06927' }}
                activeDot={{ r: 6 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Footnote matching prompt rules */}
        <div className="flex items-start gap-2 text-[11px] text-[#404942] bg-[#f0f3ff] p-3 rounded-xl">
          <Info className="w-3.5 h-3.5 text-[#206140] shrink-0 mt-0.5" />
          <span>
            <b>Adherence</b> measures scheduled meals logged (completed vs planned). <b>Punctuality</b> reflects meals eaten within your designated ±{profile.punctualityWindowMinutes} min eating window. Missed meals do not count as late; they count as missed.
          </span>
        </div>
      </div>

      {/* Weight Progress Chart */}
      <div className="p-6 rounded-2xl bg-white border border-[#dee8ff] shadow-xs flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-[18px] font-bold text-[#121c2c]">Weight Progress</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-[#aff1c6]/50 text-[#002111] text-[11px] font-bold">
                Actual Measurements
              </span>
            </div>
            <p className="text-[12px] text-[#404942]">
              Logged weight records with non-destructive graph line continuity
            </p>
          </div>

          <div className="flex items-center p-1 bg-[#f0f3ff] rounded-xl border border-[#dee8ff]">
            {(['1M', '3M', '6M', 'ALL'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setWeightRange(r)}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  weightRange === r
                    ? 'bg-[#206140] text-white shadow-xs'
                    : 'text-[#404942] hover:text-[#121c2c]'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="h-60 sm:h-64 w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weightSeries} margin={{ top: 15, right: 15, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#206140" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#206140" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="displayDate" stroke="#707972" fontSize={11} tickLine={false} />
              <YAxis
                domain={['dataMin - 1', 'dataMax + 1']}
                stroke="#707972"
                fontSize={11}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #dee8ff',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
                  fontSize: '12px',
                }}
                formatter={(value: any, name: string) => [
                  `${value} ${profile.weightUnit}`,
                  name === 'interpolatedWeight' ? 'Weight Trend' : 'Scale Entry',
                ]}
              />
              <Area
                type="monotone"
                dataKey="interpolatedWeight"
                stroke="#206140"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#weightGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Consistency Breakdown & Body Balance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Consistency Breakdown */}
        <div className="p-5 rounded-2xl bg-white border border-[#dee8ff] shadow-xs flex flex-col gap-3">
          <h3 className="font-bold text-[15px] text-[#121c2c]">Consistency Breakdown</h3>
          <div className="flex flex-col gap-2 text-[13px]">
            <div className="flex items-center justify-between py-1.5 border-b border-[#dee8ff]/50">
              <span className="text-[#404942]">Meals planned</span>
              <span className="font-bold text-[#121c2c]">{totalPlanned}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-[#dee8ff]/50">
              <span className="text-[#404942]">Meals completed</span>
              <span className="font-bold text-[#206140]">
                {totalCompleted} ({overallAdherence}%)
              </span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-[#dee8ff]/50">
              <span className="text-[#404942]">Meals missed</span>
              <span className="font-bold text-[#ba1a1a]">{totalMissed}</span>
            </div>
            <div className="flex items-center justify-between py-1.5">
              <span className="text-[#404942]">On-time eating</span>
              <span className="font-bold text-[#e06927]">
                {totalOnTime} ({overallPunctuality}%)
              </span>
            </div>
          </div>
        </div>

        {/* Body Balance Card */}
        <div className="p-5 rounded-2xl bg-white border border-[#dee8ff] shadow-xs flex flex-col gap-3">
          <h3 className="font-bold text-[15px] text-[#121c2c]">Body Balance</h3>
          <div className="flex flex-col gap-2 text-[13px]">
            <div className="flex items-center justify-between py-1.5 border-b border-[#dee8ff]/50">
              <span className="text-[#404942]">Starting weight</span>
              <span className="font-bold text-[#121c2c]">
                {startWeight} {profile.weightUnit}
              </span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-[#dee8ff]/50">
              <span className="text-[#404942]">Current weight</span>
              <span className="font-bold text-[#121c2c]">
                {currentWeight} {profile.weightUnit}
              </span>
            </div>
            <div className="flex items-center justify-between py-1.5">
              <span className="text-[#404942]">Net change</span>
              <span className="font-bold px-2 py-0.5 rounded-full bg-[#aff1c6] text-[#002111]">
                {netWeightChange <= 0 ? `${netWeightChange}` : `+${netWeightChange}`} {profile.weightUnit}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Gentle Reminder Box */}
      <div className="p-4 rounded-2xl bg-[#cbe3d3]/30 border border-[#b2cfbc]/50 flex items-center gap-3">
        <Sparkles className="w-5 h-5 text-[#206140] shrink-0" />
        <p className="text-[12px] text-[#002111] leading-relaxed">
          <b>Gentle reminder:</b> Every meal logged builds your personal rhythm. Keep going gently; progress is about long-term rhythm, not single-day perfection.
        </p>
      </div>
    </div>
  );
};
