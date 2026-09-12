import React from 'react';
import { Meal, UserProfile, WeightRecord, ViewTab } from '../types';
import {
  calculateDailyStatistic,
  formatShortTime,
  getPunctualityDescription,
  aggregateDietStatistics,
} from '../utils/calculations';
import {
  Plus,
  Scale,
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  Check,
  XCircle,
  MoreHorizontal,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

interface DashboardViewProps {
  profile: UserProfile;
  meals: Meal[];
  weightHistory: WeightRecord[];
  onNavigateTab: (tab: ViewTab) => void;
  onOpenAddMeal: () => void;
  onOpenLogWeight: () => void;
  onCompleteMeal: (mealId: string) => Promise<void>;
  onMissMeal: (mealId: string) => Promise<void>;
  onEditMeal: (meal: Meal) => void;
  onDeleteMeal: (mealId: string) => Promise<void>;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  profile,
  meals,
  weightHistory,
  onNavigateTab,
  onOpenAddMeal,
  onOpenLogWeight,
  onCompleteMeal,
  onMissMeal,
  onEditMeal,
  onDeleteMeal,
}) => {
  const todayStr = '2026-09-15'; // Anchor today matching user mockup
  const todayMeals = meals.filter((m) => m.date === todayStr);

  // Calculate daily stats using user's configured punctuality window
  const dailyStat = calculateDailyStatistic(todayStr, meals, profile.punctualityWindowMinutes);

  // Weekly mini trend for quick diet follow-up preview
  const weeklyStats = aggregateDietStatistics(meals, profile.punctualityWindowMinutes, 'daily', new Date(2026, 8, 15));
  const miniChartData = weeklyStats.map((s) => ({
    name: s.periodLabel,
    adherence: s.adherence !== null ? s.adherence : 0,
    punctuality: s.punctuality !== null ? s.punctuality : 0,
  }));

  // Net weight difference
  const latestWeight = profile.currentWeight;
  const startWeight = profile.startingWeight || (weightHistory.length > 0 ? weightHistory[0].weight : latestWeight);
  const netWeightDiff = Math.round((latestWeight - startWeight) * 10) / 10;

  // Circular gauge math
  const adherencePercent = dailyStat.adherence !== null ? dailyStat.adherence : 0;
  const punctualityPercent = dailyStat.punctuality !== null ? dailyStat.punctuality : 0;

  const circumference = 2 * Math.PI * 34; // r = 34
  const adherenceStrokeDash = (adherencePercent / 100) * circumference;
  const punctualityStrokeDash = (punctualityPercent / 100) * circumference;

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-24 md:pb-12 animate-in fade-in duration-300">
      {/* Top Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[26px] sm:text-[30px] font-bold text-[#121c2c] tracking-tight">
              Good morning, {profile.name} 👋
            </h1>
          </div>
          <p className="text-[14px] text-[#404942] font-medium mt-0.5">
            Here&apos;s your mindful rhythm and progress for today.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-full bg-[#aff1c6]/50 text-[#002111] font-bold text-[12px] flex items-center gap-1.5 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#206140]" />
            Day 14 • On Track
          </span>
          <span className="text-[12px] font-semibold text-[#404942] bg-[#f0f3ff] px-3 py-1.5 rounded-full border border-[#dee8ff]">
            Sep 15, 2026
          </span>
        </div>
      </div>

      {/* Hero Dual Metrics Telemetry Card matching UI */}
      <div className="p-6 rounded-2xl bg-white border border-[#dee8ff] shadow-sm flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[18px] text-[#121c2c]">Daily Telemetry</span>
            <span className="text-[11px] font-bold text-[#206140] bg-[#c5ffd8]/50 px-2 py-0.5 rounded-md">
              +6% vs last week
            </span>
          </div>
          <button
            onClick={() => onNavigateTab('progress')}
            className="text-[12px] font-bold text-[#206140] hover:text-[#3b7a57] flex items-center gap-1 hover:underline"
          >
            Detailed Analytics <TrendingUp className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 3 Circular Metrics: Adherence, Punctuality, Weight */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Metric 1: Adherence */}
          <div className="p-4 rounded-xl bg-[#f0f3ff] border border-[#d9e3f9]/70 flex items-center gap-4">
            <div className="relative w-18 h-18 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  stroke="#dee8ff"
                  strokeWidth="7"
                  fill="transparent"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  stroke="#206140"
                  strokeWidth="7"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference - adherenceStrokeDash}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-[16px] font-extrabold text-[#121c2c] leading-none">
                  {dailyStat.adherence !== null ? `${dailyStat.adherence}%` : 'N/A'}
                </span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-bold text-[#121c2c]">Adherence</span>
              <span className="text-[11px] text-[#404942]">
                {dailyStat.completedMeals} of {dailyStat.plannedMeals} logged
              </span>
              <span className="text-[10px] text-[#206140] font-semibold mt-1">
                {dailyStat.adherence && dailyStat.adherence >= 80 ? 'Target achieved' : 'In progress'}
              </span>
            </div>
          </div>

          {/* Metric 2: Punctuality */}
          <div className="p-4 rounded-xl bg-[#f0f3ff] border border-[#d9e3f9]/70 flex items-center gap-4">
            <div className="relative w-18 h-18 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  stroke="#dee8ff"
                  strokeWidth="7"
                  fill="transparent"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  stroke="#e06927"
                  strokeWidth="7"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference - punctualityStrokeDash}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-[16px] font-extrabold text-[#121c2c] leading-none">
                  {dailyStat.punctuality !== null ? `${dailyStat.punctuality}%` : 'N/A'}
                </span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-bold text-[#121c2c]">Punctuality</span>
              <span className="text-[11px] text-[#404942]">
                {dailyStat.onTimeMeals} on-time of {dailyStat.completedMeals}
              </span>
              <span className="text-[10px] text-[#994703] font-semibold mt-1">
                ±{profile.punctualityWindowMinutes}m window
              </span>
            </div>
          </div>

          {/* Metric 3: Current Weight */}
          <div className="p-4 rounded-xl bg-[#f0f3ff] border border-[#d9e3f9]/70 flex items-center gap-4">
            <div className="w-18 h-18 rounded-full bg-white border-2 border-[#206140] flex flex-col items-center justify-center shrink-0 shadow-xs">
              <Scale className="w-4 h-4 text-[#206140]" />
              <span className="text-[14px] font-bold text-[#121c2c] leading-none mt-1">
                {profile.currentWeight}
              </span>
              <span className="text-[9px] font-bold text-[#404942] uppercase">{profile.weightUnit}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-bold text-[#121c2c]">Body Scale</span>
              <span className="text-[11px] text-[#404942]">
                {netWeightDiff <= 0 ? `↓ ${Math.abs(netWeightDiff)} ${profile.weightUnit} net` : `+${netWeightDiff} ${profile.weightUnit}`}
              </span>
              <button
                onClick={onOpenLogWeight}
                className="text-[11px] text-[#206140] font-bold hover:underline mt-1 text-left"
              >
                + Update weight
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Tactile Row */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={onOpenAddMeal}
          className="h-13 rounded-2xl bg-[#206140] text-white font-bold text-[14px] flex items-center justify-center gap-2 hover:bg-[#3b7a57] active:scale-[0.99] transition-all shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Add Meal</span>
        </button>

        <button
          onClick={onOpenLogWeight}
          className="h-13 rounded-2xl bg-white border border-[#dee8ff] text-[#121c2c] font-bold text-[14px] flex items-center justify-center gap-2 hover:bg-[#f0f3ff] active:scale-[0.99] transition-all shadow-xs"
        >
          <Scale className="w-4 h-4 text-[#206140]" />
          <span>Log Weight</span>
        </button>

        <button
          onClick={() => onNavigateTab('calendar')}
          className="h-13 rounded-2xl bg-white border border-[#dee8ff] text-[#121c2c] font-bold text-[14px] flex items-center justify-center gap-2 hover:bg-[#f0f3ff] active:scale-[0.99] transition-all shadow-xs"
        >
          <CalendarIcon className="w-4 h-4 text-[#206140]" />
          <span>Full Schedule</span>
        </button>
      </div>

      {/* Today's Meals Timeline Section */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-[18px] font-bold text-[#121c2c]">Today&apos;s meals</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-[#f0f3ff] border border-[#dee8ff] text-[11px] font-bold text-[#404942]">
              {todayMeals.length} planned
            </span>
          </div>
          <button
            onClick={onOpenAddMeal}
            className="text-[12px] font-bold text-[#206140] hover:underline flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Custom
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {todayMeals.map((meal) => {
            const isCompleted = meal.status === 'COMPLETED';
            const isMissed = meal.status === 'MISSED';
            const punctuality = getPunctualityDescription(
              meal.scheduledTime,
              meal.actualCompletionTime,
              profile.punctualityWindowMinutes
            );

            return (
              <div
                key={meal.mealId}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 ${
                  isCompleted
                    ? 'bg-white border-[#dee8ff] shadow-xs'
                    : isMissed
                    ? 'bg-[#fff8f7] border-[#ffdad6]'
                    : 'bg-white border-[#dee8ff] shadow-sm hover:border-[#206140]/40'
                }`}
              >
                <div className="flex items-start sm:items-center gap-3.5">
                  {/* Meal Image Thumbnail */}
                  <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-[#f0f3ff] border border-[#dee8ff]">
                    {meal.imageUrl ? (
                      <img
                        src={meal.imageUrl}
                        alt={meal.mealName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#206140] font-bold text-[16px]">
                        🍽
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[15px] text-[#121c2c]">{meal.mealName}</span>
                      {isCompleted && punctuality.isPunctual && (
                        <span className="px-2 py-0.5 rounded-full bg-[#aff1c6]/50 text-[#002111] text-[10px] font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-[#206140]" /> On time
                        </span>
                      )}
                      {isCompleted && !punctuality.isPunctual && (
                        <span className="px-2 py-0.5 rounded-full bg-[#ffdbc9]/70 text-[#994703] text-[10px] font-bold flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#e06927]" /> {punctuality.text}
                        </span>
                      )}
                      {isMissed && (
                        <span className="px-2 py-0.5 rounded-full bg-[#ffdad6] text-[#ba1a1a] text-[10px] font-bold">
                          Missed
                        </span>
                      )}
                      {!isCompleted && !isMissed && (
                        <span className="px-2 py-0.5 rounded-full bg-[#e7eeff] text-[#404942] text-[10px] font-bold">
                          Upcoming
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[12px] text-[#404942] mt-0.5">
                      <span className="font-medium text-[#206140]">{formatShortTime(meal.scheduledTime)}</span>
                      <span>•</span>
                      <span>{meal.calories} kcal</span>
                    </div>

                    {meal.notes && (
                      <p className="text-[12px] text-[#404942] mt-1 line-clamp-1 italic">
                        {meal.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right actions */}
                <div className="flex items-center justify-end gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-[#dee8ff]/50">
                  {!isCompleted && !isMissed ? (
                    <>
                      <button
                        onClick={() => onCompleteMeal(meal.mealId)}
                        className="px-3.5 py-1.5 rounded-xl bg-[#206140] text-white text-[12px] font-bold flex items-center gap-1 hover:bg-[#3b7a57] active:scale-95 shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5" /> Log Meal
                      </button>
                      <button
                        onClick={() => onMissMeal(meal.mealId)}
                        className="px-2.5 py-1.5 rounded-xl text-[#ba1a1a] hover:bg-[#ffdad6]/40 text-[12px] font-semibold"
                        title="Mark as missed"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onEditMeal(meal)}
                        className="px-2.5 py-1 text-[11px] font-bold text-[#404942] hover:bg-[#f0f3ff] rounded-lg"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDeleteMeal(meal.mealId)}
                        className="p-1 text-[#707972] hover:text-[#ba1a1a] rounded-lg"
                        title="Delete meal"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mini Diet Follow-up Preview Chart */}
      <div className="p-5 rounded-2xl bg-white border border-[#dee8ff] shadow-xs flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-[15px] text-[#121c2c]">Diet Follow-up (Last 7 Days)</h3>
            <p className="text-[11px] text-[#404942]">Solid green: Adherence • Orange dashed: Punctuality</p>
          </div>
          <button
            onClick={() => onNavigateTab('progress')}
            className="text-[12px] font-bold text-[#206140] hover:underline"
          >
            Full Analytics &rarr;
          </button>
        </div>

        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={miniChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#707972" fontSize={11} tickLine={false} />
              <YAxis stroke="#707972" fontSize={11} domain={[0, 100]} tickCount={4} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #dee8ff',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  fontSize: '12px',
                }}
              />
              <Line
                type="monotone"
                dataKey="adherence"
                name="Adherence %"
                stroke="#206140"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#206140' }}
              />
              <Line
                type="monotone"
                dataKey="punctuality"
                name="Punctuality %"
                stroke="#e06927"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ r: 3, fill: '#e06927' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Daily Reflection / Reminder Banner */}
      <div className="p-4 rounded-2xl bg-[#cbe3d3]/30 border border-[#b2cfbc]/50 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#206140] text-white flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="text-[12px] leading-relaxed text-[#002111]">
          <span className="font-bold">Mindful Routine: </span>
          <span>
            “Consistency is built one meal at a time.” Listen to your body&apos;s natural tempo. Focus gently on your next planned eating window.
          </span>
        </div>
      </div>
    </div>
  );
};
