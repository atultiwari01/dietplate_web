import React, { useState } from 'react';
import { WeightUnit } from '../types';
import { X, Scale, Calendar as CalendarIcon, Check, Info } from 'lucide-react';

interface WeightModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (weight: number, date: string) => Promise<void>;
  currentWeight: number;
  weightUnit: WeightUnit;
}

export const WeightModal: React.FC<WeightModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentWeight,
  weightUnit,
}) => {
  const [weightValue, setWeightValue] = useState<number>(currentWeight);
  const [logDate, setLogDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAdjust = (delta: number) => {
    setWeightValue((prev) => Math.round((prev + delta) * 10) / 10);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isNaN(weightValue) || weightValue <= 0) {
      setErrorMessage('Please enter a valid positive weight measurement.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await onSave(weightValue, logDate);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update weight.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-md bg-white rounded-t-[28px] sm:rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
        <div className="p-5 border-b border-[#dee8ff]/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#aff1c6] text-[#206140] flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-[18px] text-[#121c2c]">Log Weight</h3>
              <p className="text-[11px] text-[#404942]">Record your natural body weight reading</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#f0f3ff] text-[#404942] hover:bg-[#dee8ff] flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-[#ffdad6] text-[#ba1a1a] text-[12px] font-medium flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Date Picker */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-[#121c2c]">Measurement Date</label>
            <div className="h-11 bg-[#f0f3ff] rounded-xl px-3 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-[#206140]" />
              <input
                type="date"
                value={logDate}
                onChange={(e) => setLogDate(e.target.value)}
                className="w-full bg-transparent text-[13px] text-[#121c2c] focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Stepper Display */}
          <div className="flex flex-col items-center justify-center py-4 bg-[#f0f3ff] rounded-2xl gap-3">
            <span className="text-[12px] font-semibold text-[#404942]">Actual Scale Reading</span>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => handleAdjust(-0.1)}
                className="w-10 h-10 rounded-xl bg-white shadow-xs text-[18px] font-bold text-[#121c2c] flex items-center justify-center hover:bg-[#dee8ff] active:scale-95"
              >
                -0.1
              </button>
              <div className="flex items-baseline gap-1">
                <input
                  type="number"
                  step="0.1"
                  value={weightValue}
                  onChange={(e) => setWeightValue(parseFloat(e.target.value) || 0)}
                  className="w-24 text-center text-[36px] font-bold text-[#206140] bg-transparent focus:outline-none"
                />
                <span className="text-[14px] font-bold text-[#404942]">{weightUnit}</span>
              </div>
              <button
                type="button"
                onClick={() => handleAdjust(0.1)}
                className="w-10 h-10 rounded-xl bg-white shadow-xs text-[18px] font-bold text-[#121c2c] flex items-center justify-center hover:bg-[#dee8ff] active:scale-95"
              >
                +0.1
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleAdjust(-0.5)}
                className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-white text-[#404942] hover:bg-[#dee8ff]"
              >
                -0.5
              </button>
              <button
                type="button"
                onClick={() => handleAdjust(0.5)}
                className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-white text-[#404942] hover:bg-[#dee8ff]"
              >
                +0.5
              </button>
            </div>
          </div>

          <div className="text-[11px] text-[#404942] leading-relaxed flex items-start gap-1.5">
            <Info className="w-3.5 h-3.5 text-[#3b7a57] shrink-0 mt-0.5" />
            <span>Only real scale readings are saved to your permanent weight history.</span>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 rounded-xl bg-[#206140] text-white font-semibold text-[14px] flex items-center justify-center gap-2 hover:bg-[#3b7a57] active:scale-[0.99] transition-all shadow-md disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : 'Save to DailyPlate'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 text-center text-[13px] font-semibold text-[#404942] hover:text-[#121c2c]"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
