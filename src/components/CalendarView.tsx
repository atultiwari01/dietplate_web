import React, { useState } from 'react';
import { Meal, UserProfile } from '../types';
import {
  calculateDailyStatistic,
  formatLongDate,
  formatShortTime,
  getPunctualityDescription,
} from '../utils/calculations';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  CheckCircle2,
  Clock,
  Check,
  XCircle,
  MoreVertical,
  Edit2,
  Trash2,
} from 'lucide-react';

interface CalendarViewProps {
  profile: UserProfile;
  meals: Meal[];
  onOpenAddMeal: (initialDate?: string) => void;
  onCompleteMeal: (mealId: string) => Promise<void>;
  onMissMeal: (mealId: string) => Promise<void>;
  onEditMeal: (meal: Meal) => void;
  onDeleteMeal: (mealId: string) => Promise<void>;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  profile,
  meals,
  onOpenAddMeal,
  onCompleteMeal,
  onMissMeal,
  onEditMeal,
  onDeleteMeal,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>('2026-09-15');
  const [menuOpenMealId, setMenuOpenMealId] = useState<string | null>(null);

  // Focus on September 2026
  const currentMonthYear = 'September 2026';
  const totalDaysInMonth = 30;

  // Build heatmap status for every day in Sept 2026
  const daysInMonth = Array.from({ length: totalDaysInMonth }, (_, i) => {
    const dayNum = i + 1;
    const dateStr = `2026-09-${dayNum < 10 ? `0${dayNum}` : dayNum}`;
    const dayStat = calculateDailyStatistic(dateStr, meals, profile.punctualityWindowMinutes);

    let statusType: 'excellent' | 'partial' | 'missed' | 'future' | 'empty' = 'empty';
    if (dayNum > 15) {
      statusType = 'future';
    } else if (dayStat.plannedMeals > 0) {
      if (dayStat.adherence === null || dayStat.completedMeals === 0) {
        statusType = 'missed';
      } else if (dayStat.adherence >= 80) {
        statusType = 'excellent';
      } else {
        statusType = 'partial';
      }
    }

    return {
      dayNum,
      dateStr,
      statusType,
      stat: dayStat,
      isToday: dateStr === '2026-09-15',
    };
  });

  // Selected day's meals
  const selectedMeals = meals
    .filter((m) => m.date === selectedDate)
    .sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));

  const totalCalories = selectedMeals.reduce((sum, m) => sum + (m.calories || 0), 0);
  const selectedDayStat = calculateDailyStatistic(selectedDate, meals, profile.punctualityWindowMinutes);

  // Horizontal date strip around selected date (e.g. 13 to 19 Sep)
  const stripDays = [
    { label: 'Mon', num: '14', date: '2026-09-14' },
    { label: 'Tue', num: '15', date: '2026-09-15', isToday: true, badge: '82%' },
    { label: 'Wed', num: '16', date: '2026-09-16' },
    { label: 'Thu', num: '17', date: '2026-09-17' },
    { label: 'Fri', num: '18', date: '2026-09-18' },
    { label: 'Sat', num: '19', date: '2026-09-19' },
    { label: 'Sun', num: '20', date: '2026-09-20' },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-24 md:pb-12 animate-in fade-in duration-300">
      {/* Month Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#dee8ff] shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#aff1c6] text-[#206140] flex items-center justify-center">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-[20px] font-bold text-[#121c2c]">{currentMonthYear}</h1>
            <p className="text-[12px] text-[#404942]">
              {selectedDayStat.plannedMeals} meals planned on selected date
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedDate('2026-09-15')}
            className="px-3 py-1.5 rounded-xl bg-[#f0f3ff] text-[#206140] text-[12px] font-bold hover:bg-[#dee8ff] transition-colors"
          >
            Today: 15 Sep
          </button>
          <div className="flex items-center gap-1">
            <button
              className="w-8 h-8 rounded-lg bg-[#f0f3ff] text-[#404942] hover:bg-[#dee8ff] flex items-center justify-center"
              aria-label="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              className="w-8 h-8 rounded-lg bg-[#f0f3ff] text-[#404942] hover:bg-[#dee8ff] flex items-center justify-center"
              aria-label="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Tactile Date Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 select-none">
        {stripDays.map((sd) => {
          const isSelected = selectedDate === sd.date;
          return (
            <button
              key={sd.date}
              onClick={() => setSelectedDate(sd.date)}
              className={`flex-1 min-w-[68px] py-3 px-2 rounded-2xl flex flex-col items-center gap-1 transition-all ${
                isSelected
                  ? 'bg-[#206140] text-white shadow-md scale-102'
                  : 'bg-white border border-[#dee8ff] text-[#404942] hover:bg-[#f0f3ff]'
              }`}
            >
              <span className="text-[11px] font-semibold uppercase tracking-wider">{sd.label}</span>
              <span className={`text-[18px] font-extrabold leading-none ${isSelected ? 'text-white' : 'text-[#121c2c]'}`}>
                {sd.num}
              </span>
              {sd.badge && (
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-white text-[#206140]' : 'bg-[#aff1c6] text-[#002111]'
                  }`}
                >
                  {sd.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Content Grid: Timeline & Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Timeline Rail */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Selected Day Header */}
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-[#dee8ff]">
            <div>
              <h2 className="text-[18px] font-bold text-[#121c2c]">{formatLongDate(selectedDate)}</h2>
              <p className="text-[12px] text-[#404942] mt-0.5">
                {selectedMeals.length} meals planned • {totalCalories} total kcal
              </p>
            </div>
            <button
              onClick={() => onOpenAddMeal(selectedDate)}
              className="h-10 px-3.5 rounded-xl bg-[#206140] text-white font-bold text-[12px] flex items-center gap-1.5 hover:bg-[#3b7a57] transition-all shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add meal</span>
            </button>
          </div>

          {/* Timeline Rail */}
          {selectedMeals.length === 0 ? (
            <div className="p-10 rounded-2xl bg-white border border-[#dee8ff] text-center flex flex-col items-center justify-center gap-2">
              <CalendarIcon className="w-8 h-8 text-[#707972]" />
              <p className="font-bold text-[15px] text-[#121c2c]">No meals planned for this date</p>
              <p className="text-[12px] text-[#404942]">Plan your meals in advance to maintain your eating schedule.</p>
              <button
                onClick={() => onOpenAddMeal(selectedDate)}
                className="mt-2 px-4 py-2 rounded-xl bg-[#206140] text-white text-[12px] font-bold"
              >
                + Plan a meal
              </button>
            </div>
          ) : (
            <div className="relative pl-6 flex flex-col gap-4">
              {/* Rail Vertical Line */}
              <div className="absolute left-2.5 top-4 bottom-4 w-0.5 bg-[#dee8ff]" />

              {selectedMeals.map((meal) => {
                const isCompleted = meal.status === 'COMPLETED';
                const isMissed = meal.status === 'MISSED';
                const punctuality = getPunctualityDescription(
                  meal.scheduledTime,
                  meal.actualCompletionTime,
                  profile.punctualityWindowMinutes
                );

                return (
                  <div key={meal.mealId} className="relative flex items-start gap-4">
                    {/* Timeline Node marker */}
                    <div className="absolute -left-6 mt-1 flex items-center justify-center">
                      {isCompleted && punctuality.isPunctual ? (
                        <div className="w-5 h-5 rounded-full bg-[#206140] text-white flex items-center justify-center shadow-xs">
                          <Check className="w-3 h-3" />
                        </div>
                      ) : isCompleted && !punctuality.isPunctual ? (
                        <div className="w-5 h-5 rounded-full bg-[#e06927] text-white flex items-center justify-center shadow-xs">
                          <Clock className="w-3 h-3" />
                        </div>
                      ) : isMissed ? (
                        <div className="w-5 h-5 rounded-full bg-[#ba1a1a] text-white flex items-center justify-center shadow-xs">
                          <XCircle className="w-3 h-3" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-white border-2 border-[#206140] flex items-center justify-center shadow-xs" />
                      )}
                    </div>

                    {/* Meal Card */}
                    <div className="flex-1 p-4 rounded-2xl bg-white border border-[#dee8ff] shadow-xs flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#f0f3ff] shrink-0 border border-[#dee8ff]">
                            {meal.imageUrl ? (
                              <img
                                src={meal.imageUrl}
                                alt={meal.mealName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[#206140] font-bold">
                                🥣
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-[15px] text-[#121c2c]">{meal.mealName}</h3>
                              {isCompleted && punctuality.isPunctual && (
                                <span className="text-[10px] font-bold text-[#002111] bg-[#aff1c6]/50 px-2 py-0.5 rounded-full">
                                  ✓ On time
                                </span>
                              )}
                              {isCompleted && !punctuality.isPunctual && (
                                <span className="text-[10px] font-bold text-[#994703] bg-[#ffdbc9]/70 px-2 py-0.5 rounded-full">
                                  ⏱ {punctuality.text}
                                </span>
                              )}
                              {isMissed && (
                                <span className="text-[10px] font-bold text-[#ba1a1a] bg-[#ffdad6] px-2 py-0.5 rounded-full">
                                  Missed
                                </span>
                              )}
                            </div>
                            <p className="text-[12px] text-[#404942] font-medium">
                              <span className="text-[#206140] font-bold">{formatShortTime(meal.scheduledTime)}</span> •{' '}
                              {meal.calories} kcal
                            </p>
                          </div>
                        </div>

                        {/* Menu options */}
                        <div className="relative">
                          <button
                            onClick={() =>
                              setMenuOpenMealId(menuOpenMealId === meal.mealId ? null : meal.mealId)
                            }
                            className="p-1 rounded-lg hover:bg-[#f0f3ff] text-[#707972]"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          {menuOpenMealId === meal.mealId && (
                            <div className="absolute right-0 top-8 w-32 bg-white rounded-xl shadow-lg border border-[#dee8ff] py-1 z-30">
                              <button
                                onClick={() => {
                                  onEditMeal(meal);
                                  setMenuOpenMealId(null);
                                }}
                                className="w-full px-3 py-1.5 text-left text-[12px] font-medium text-[#121c2c] hover:bg-[#f0f3ff] flex items-center gap-2"
                              >
                                <Edit2 className="w-3.5 h-3.5" /> Edit
                              </button>
                              <button
                                onClick={() => {
                                  onDeleteMeal(meal.mealId);
                                  setMenuOpenMealId(null);
                                }}
                                className="w-full px-3 py-1.5 text-left text-[12px] font-medium text-[#ba1a1a] hover:bg-[#ffdad6]/40 flex items-center gap-2"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {meal.notes && (
                        <p className="text-[12px] text-[#404942] bg-[#f0f3ff] p-2 rounded-xl italic">
                          {meal.notes}
                        </p>
                      )}

                      {/* Bottom Action Bar */}
                      <div className="flex items-center justify-between pt-1 border-t border-[#dee8ff]/60">
                        <span className="text-[11px] text-[#707972]">
                          {isCompleted && meal.actualCompletionTime
                            ? `Logged: ${formatShortTime(meal.actualCompletionTime.split('T')[1] || meal.actualCompletionTime)}`
                            : 'Status: ' + meal.status.toLowerCase()}
                        </span>

                        <div className="flex items-center gap-2">
                          {!isCompleted && (
                            <button
                              onClick={() => onCompleteMeal(meal.mealId)}
                              className="px-3 py-1 rounded-lg bg-[#206140] text-white text-[11px] font-bold flex items-center gap-1 hover:bg-[#3b7a57]"
                            >
                              <Check className="w-3 h-3" /> Log Meal
                            </button>
                          )}
                          {!isCompleted && !isMissed && (
                            <button
                              onClick={() => onMissMeal(meal.mealId)}
                              className="px-2 py-1 rounded-lg text-[#ba1a1a] hover:bg-[#ffdad6]/50 text-[11px] font-semibold"
                            >
                              Mark Missed
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 1 Col: Monthly Adherence Heatmap & Legend */}
        <div className="flex flex-col gap-4">
          <div className="p-5 rounded-2xl bg-white border border-[#dee8ff] shadow-xs flex flex-col gap-4">
            <div>
              <h3 className="font-bold text-[15px] text-[#121c2c]">Monthly Adherence</h3>
              <p className="text-[11px] text-[#404942]">September 2026 Overview</p>
            </div>

            {/* 7-col weekday headers */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-[#707972] uppercase">
              <span>M</span>
              <span>T</span>
              <span>W</span>
              <span>T</span>
              <span>F</span>
              <span>S</span>
              <span>S</span>
            </div>

            {/* 30-day heatmap grid */}
            <div className="grid grid-cols-7 gap-1.5">
              {daysInMonth.map((d) => {
                const isSelected = selectedDate === d.dateStr;

                let bgClass = 'bg-[#f0f3ff] text-[#707972]';
                if (d.statusType === 'excellent') {
                  bgClass = 'bg-[#206140] text-white';
                } else if (d.statusType === 'partial') {
                  bgClass = 'bg-[#e06927] text-white';
                } else if (d.statusType === 'missed') {
                  bgClass = 'bg-[#ba1a1a] text-white';
                } else if (d.statusType === 'future') {
                  bgClass = 'bg-[#e7eeff] text-[#404942]';
                }

                return (
                  <button
                    key={d.dayNum}
                    onClick={() => setSelectedDate(d.dateStr)}
                    className={`h-8 rounded-lg flex items-center justify-center text-[11px] font-bold transition-all relative ${bgClass} ${
                      isSelected ? 'ring-2 ring-offset-1 ring-[#121c2c] scale-105 z-10' : 'hover:opacity-90'
                    }`}
                  >
                    {d.dayNum}
                    {d.isToday && (
                      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400 border border-white" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend matching Screenshot */}
            <div className="flex flex-col gap-1.5 pt-3 border-t border-[#dee8ff] text-[11px] text-[#404942]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#206140]" />
                <span>Excellent (80-100% adherence)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#e06927]" />
                <span>Partial (50-79% adherence)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ba1a1a]" />
                <span>Missed scheduled meals</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#e7eeff]" />
                <span>Planned future meals</span>
              </div>
            </div>
          </div>

          {/* Quick Guidance Box */}
          <div className="p-4 rounded-2xl bg-[#f0f3ff] border border-[#dee8ff] text-[12px] text-[#404942] leading-relaxed">
            <span className="font-bold text-[#121c2c]">Punctuality Window: </span>
            <span>
              Meals eaten within ±{profile.punctualityWindowMinutes} minutes of their scheduled time are recorded as on time. You can change this window anytime in Profile.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
