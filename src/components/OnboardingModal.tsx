import React, { useState } from 'react';
import { UserProfile, HeightUnit, WeightUnit } from '../types';
import { calculateBMI } from '../utils/calculations';
import { DailyPlateLogo } from './DailyPlateLogo';
import { CheckCircle2, ArrowRight } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (profileData: Partial<UserProfile>) => Promise<void>;
  initialProfile?: UserProfile;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onComplete,
  initialProfile,
}) => {
  const [name, setName] = useState(initialProfile?.name || 'Sarah');
  const [age, setAge] = useState(initialProfile?.age || 22);
  const [gender, setGender] = useState(initialProfile?.gender || 'female');
  const [height, setHeight] = useState(initialProfile?.height || 165);
  const [heightUnit, setHeightUnit] = useState<HeightUnit>(initialProfile?.heightUnit || 'cm');
  const [weight, setWeight] = useState(initialProfile?.currentWeight || 62.4);
  const [weightUnit, setWeightUnit] = useState<WeightUnit>(initialProfile?.weightUnit || 'kg');
  const [punctualityWindow, setPunctualityWindow] = useState(initialProfile?.punctualityWindowMinutes || 30);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const previewBmi = calculateBMI(height, heightUnit, weight, weightUnit);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onComplete({
        name: name.trim() || 'User',
        age: Number(age) || 25,
        gender,
        height: Number(height) || 165,
        heightUnit,
        currentWeight: Number(weight) || 62.4,
        startingWeight: Number(weight) || 62.4,
        weightUnit,
        punctualityWindowMinutes: Number(punctualityWindow) || 30,
        onboardingCompleted: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 sm:p-8 flex flex-col gap-5 animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center gap-2">
          <DailyPlateLogo size="lg" showText={false} />
          <h2 className="text-[24px] font-bold text-[#121c2c] tracking-tight">Welcome to DailyPlate</h2>
          <p className="text-[13px] text-[#404942] max-w-sm">
            A personal diet planning and tracking companion. Set your personal baseline to start tracking your daily eating rhythm.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-[#121c2c]">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 px-3.5 rounded-xl bg-[#f0f3ff] text-[14px] text-[#121c2c] border border-[#dee8ff]"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-[#121c2c]">Age</label>
              <input
                type="number"
                min="1"
                max="125"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="h-11 px-3.5 rounded-xl bg-[#f0f3ff] text-[14px] text-[#121c2c] border border-[#dee8ff]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[12px] font-semibold text-[#121c2c]">Height</label>
                <div className="flex text-[10px] font-bold">
                  <button
                    type="button"
                    onClick={() => setHeightUnit('cm')}
                    className={`px-1.5 py-0.5 rounded ${heightUnit === 'cm' ? 'bg-[#206140] text-white' : 'text-[#404942]'}`}
                  >
                    cm
                  </button>
                  <button
                    type="button"
                    onClick={() => setHeightUnit('ft')}
                    className={`px-1.5 py-0.5 rounded ${heightUnit === 'ft' ? 'bg-[#206140] text-white' : 'text-[#404942]'}`}
                  >
                    ft
                  </button>
                </div>
              </div>
              <input
                type="number"
                step="0.1"
                value={height}
                onChange={(e) => setHeight(parseFloat(e.target.value) || 0)}
                className="h-11 px-3.5 rounded-xl bg-[#f0f3ff] text-[14px] text-[#121c2c] border border-[#dee8ff]"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[12px] font-semibold text-[#121c2c]">Weight</label>
                <div className="flex text-[10px] font-bold">
                  <button
                    type="button"
                    onClick={() => setWeightUnit('kg')}
                    className={`px-1.5 py-0.5 rounded ${weightUnit === 'kg' ? 'bg-[#206140] text-white' : 'text-[#404942]'}`}
                  >
                    kg
                  </button>
                  <button
                    type="button"
                    onClick={() => setWeightUnit('lb')}
                    className={`px-1.5 py-0.5 rounded ${weightUnit === 'lb' ? 'bg-[#206140] text-white' : 'text-[#404942]'}`}
                  >
                    lb
                  </button>
                </div>
              </div>
              <input
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                className="h-11 px-3.5 rounded-xl bg-[#f0f3ff] text-[14px] text-[#121c2c] border border-[#dee8ff]"
                required
              />
            </div>
          </div>

          {/* BMI Live Preview */}
          {previewBmi && (
            <div className="p-3.5 rounded-2xl bg-[#cbe3d3]/30 border border-[#b2cfbc]/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#206140]" />
                <span className="text-[12px] text-[#002111] font-semibold">Calculated BMI Indicator</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-extrabold text-[#206140]">{previewBmi.bmi}</span>
                <span className="px-2 py-0.5 rounded-full bg-[#aff1c6] text-[#002111] text-[10px] font-bold">
                  {previewBmi.category}
                </span>
              </div>
            </div>
          )}

          {/* Punctuality Window */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-[#121c2c]">
              Punctuality Window Tolerance
            </label>
            <select
              value={punctualityWindow}
              onChange={(e) => setPunctualityWindow(Number(e.target.value))}
              className="h-11 px-3.5 rounded-xl bg-[#f0f3ff] text-[13px] text-[#121c2c] border border-[#dee8ff] font-medium"
            >
              <option value="15">±15 minutes (Strict Timing)</option>
              <option value="30">±30 minutes (Standard Rhythm)</option>
              <option value="45">±45 minutes (Flexible Rhythm)</option>
              <option value="60">±60 minutes (Relaxed Schedule)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 rounded-2xl bg-[#206140] text-white font-bold text-[15px] flex items-center justify-center gap-2 hover:bg-[#3b7a57] transition-all shadow-md mt-2 disabled:opacity-50"
          >
            <span>{isSubmitting ? 'Setting up...' : 'Enter DailyPlate'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
