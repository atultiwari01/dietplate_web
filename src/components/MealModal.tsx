import React, { useState, useEffect } from 'react';
import { Meal } from '../types';
import { X, Calendar as CalendarIcon, Clock, Info, Minus, Plus, Bell, Check } from 'lucide-react';
import { formatShortTime } from '../utils/calculations';

interface MealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (mealData: Omit<Meal, 'mealId' | 'userId'> & { mealId?: string }) => Promise<void>;
  initialMeal?: Meal | null;
  defaultDate?: string;
}

export const MealModal: React.FC<MealModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialMeal,
  defaultDate = '2026-09-15',
}) => {
  const [mealName, setMealName] = useState('Breakfast');
  const [scheduledDate, setScheduledDate] = useState(defaultDate);
  const [scheduledTime, setScheduledTime] = useState('08:00');
  const [calories, setCalories] = useState<number>(450);
  const [notes, setNotes] = useState('');
  const [reminder, setReminder] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialMeal) {
      setMealName(initialMeal.mealName);
      setScheduledDate(initialMeal.date);
      setScheduledTime(initialMeal.scheduledTime);
      setCalories(initialMeal.calories || 0);
      setNotes(initialMeal.notes || '');
    } else {
      setMealName('Breakfast');
      setScheduledDate(defaultDate);
      setScheduledTime('08:00');
      setCalories(450);
      setNotes('');
      setReminder(true);
    }
    setErrorMessage(null);
  }, [initialMeal, defaultDate, isOpen]);

  if (!isOpen) return null;

  const quickPills = ['Breakfast', 'Snack', 'Lunch', 'Dinner'];

  const handleAdjustCalories = (delta: number) => {
    setCalories((prev) => Math.max(0, prev + delta));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Strict Validation
    if (!mealName.trim()) {
      setErrorMessage('Meal Name is required.');
      return;
    }
    if (!scheduledDate) {
      setErrorMessage('Scheduled Date is required.');
      return;
    }
    if (!scheduledTime) {
      setErrorMessage('Scheduled Time is mandatory for punctuality calculation.');
      return;
    }
    if (isNaN(calories) || calories < 0) {
      setErrorMessage('Estimated calories must be a valid positive number.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        mealId: initialMeal?.mealId,
        mealName: mealName.trim(),
        date: scheduledDate,
        scheduledTime,
        calories,
        notes: notes.trim(),
        status: initialMeal?.status || 'PLANNED',
        actualCompletionTime: initialMeal?.actualCompletionTime || null,
        imageUrl: initialMeal?.imageUrl || '',
      });
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save meal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto">
      <div
        className="w-full max-w-lg bg-white rounded-t-[28px] sm:rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="meal-modal-title"
      >
        {/* Drag handle for mobile */}
        <div className="w-full flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-12 h-1.5 bg-[#d9e3f9] rounded-full" />
        </div>

        {/* Header */}
        <div className="px-5 pt-3 pb-2 flex items-center justify-between border-b border-[#dee8ff]/50">
          <div>
            <h2 id="meal-modal-title" className="text-[20px] font-bold text-[#121c2c]">
              {initialMeal ? 'Edit meal' : 'Add meal'}
            </h2>
            <p className="text-[12px] text-[#404942]">Nourish your daily rhythm & timing</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#f0f3ff] text-[#404942] hover:bg-[#dee8ff] flex items-center justify-center transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4 max-h-[80vh] overflow-y-auto">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-[#ffdad6] text-[#ba1a1a] text-[13px] font-medium flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Meal Name & Quick Pills */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="meal-name" className="text-[13px] font-semibold text-[#121c2c] flex justify-between">
              <span>Meal Name</span>
              <span className="text-[11px] text-[#206140] font-bold">Required</span>
            </label>
            <div className="h-12 w-full bg-[#f0f3ff] rounded-xl px-3.5 flex items-center focus-within:bg-white focus-within:ring-2 focus-within:ring-[#206140] transition-all">
              <input
                id="meal-name"
                type="text"
                value={mealName}
                onChange={(e) => setMealName(e.target.value)}
                placeholder="e.g., Breakfast, Afternoon Snack"
                required
                className="w-full bg-transparent text-[14px] text-[#121c2c] placeholder-[#707972] focus:outline-none"
              />
            </div>
            {/* Quick preset pills matching Screenshot 3 */}
            <div className="flex items-center gap-2 pt-1 overflow-x-auto pb-1">
              {quickPills.map((pill) => {
                const isSelected = mealName.toLowerCase() === pill.toLowerCase();
                return (
                  <button
                    key={pill}
                    type="button"
                    onClick={() => setMealName(pill)}
                    className={`px-3 py-1 rounded-full text-[12px] font-semibold transition-all whitespace-nowrap ${
                      isSelected
                        ? 'bg-[#206140] text-white shadow-xs'
                        : 'bg-[#f0f3ff] text-[#404942] hover:bg-[#dee8ff]'
                    }`}
                  >
                    {pill}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Scheduled Date & Scheduled Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Date */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="scheduled-date" className="text-[13px] font-semibold text-[#121c2c]">
                Scheduled Date
              </label>
              <div className="h-12 w-full bg-[#f0f3ff] rounded-xl px-3 flex items-center gap-2 text-[#121c2c] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#206140] transition-all">
                <CalendarIcon className="w-4 h-4 text-[#206140] shrink-0" />
                <input
                  id="scheduled-date"
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  required
                  className="w-full bg-transparent text-[13px] text-[#121c2c] focus:outline-none"
                />
              </div>
            </div>

            {/* Scheduled Time (Mandatory!) */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="scheduled-time" className="text-[13px] font-semibold text-[#121c2c]">
                  Scheduled Time
                </label>
                <span className="text-[11px] text-[#206140] font-medium">Baseline</span>
              </div>
              <div className="h-12 w-full bg-[#f0f3ff] rounded-xl px-3 flex items-center justify-between focus-within:bg-white focus-within:ring-2 focus-within:ring-[#206140] transition-all">
                <div className="flex items-center gap-2 w-full">
                  <Clock className="w-4 h-4 text-[#206140] shrink-0" />
                  <input
                    id="scheduled-time"
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    required
                    className="w-full bg-transparent text-[14px] text-[#121c2c] focus:outline-none font-medium"
                  />
                </div>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[#e7eeff] text-[#404942]">
                  {formatShortTime(scheduledTime).split(' ')[1] || 'AM'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-1.5 text-[11px] text-[#404942] -mt-1">
            <Info className="w-3.5 h-3.5 text-[#3b7a57] shrink-0 mt-0.5" />
            <span>Scheduled time is mandatory to measure eating window punctuality.</span>
          </div>

          {/* Estimated Calories */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="cal-input" className="text-[13px] font-semibold text-[#121c2c]">
                Estimated Calories
              </label>
              <span className="text-[11px] text-[#404942]">Optional guidance</span>
            </div>
            <div className="h-12 w-full bg-[#f0f3ff] rounded-xl px-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleAdjustCalories(-50)}
                className="w-8 h-8 rounded-lg bg-white shadow-xs flex items-center justify-center text-[#121c2c] hover:bg-[#dee8ff] active:scale-95 transition-all"
                aria-label="Decrease 50 calories"
              >
                <Minus className="w-4 h-4" />
              </button>
              <div className="flex items-baseline gap-1">
                <input
                  id="cal-input"
                  type="number"
                  min="0"
                  max="3500"
                  step="10"
                  value={calories}
                  onChange={(e) => setCalories(Number(e.target.value))}
                  className="w-20 text-center font-bold text-[22px] text-[#206140] bg-transparent focus:outline-none"
                />
                <span className="text-[12px] font-semibold text-[#404942]">kcal</span>
              </div>
              <button
                type="button"
                onClick={() => handleAdjustCalories(50)}
                className="w-8 h-8 rounded-lg bg-white shadow-xs flex items-center justify-center text-[#121c2c] hover:bg-[#dee8ff] active:scale-95 transition-all"
                aria-label="Increase 50 calories"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notes & Planned items */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="meal-notes" className="text-[13px] font-semibold text-[#121c2c] flex justify-between">
              <span>Notes & Planned items</span>
              <span className="text-[11px] text-[#707972]">Optional</span>
            </label>
            <div className="w-full bg-[#f0f3ff] rounded-xl p-3 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#206140] transition-all">
              <textarea
                id="meal-notes"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Rolled oats, almond milk, chia seeds, fresh blueberries..."
                className="w-full bg-transparent text-[13px] text-[#121c2c] placeholder-[#707972] focus:outline-none resize-none"
              />
            </div>
          </div>

          {/* Gentle reminder toggle */}
          <div className="bg-[#f0f3ff] rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#aff1c6] text-[#002111] flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] font-semibold text-[#121c2c]">Remind me 10 minutes before</span>
                <span className="text-[11px] text-[#404942]">Gentle prompt to prep & pause</span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={reminder}
                onChange={(e) => setReminder(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#dee8ff] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3b7a57]"></div>
            </label>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 rounded-xl bg-[#206140] text-white font-semibold text-[15px] flex items-center justify-center gap-2 hover:bg-[#3b7a57] active:scale-[0.99] transition-all shadow-md disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving meal...' : initialMeal ? 'Save changes' : 'Save meal'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 text-center text-[13px] font-semibold text-[#495865] hover:text-[#121c2c] transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
