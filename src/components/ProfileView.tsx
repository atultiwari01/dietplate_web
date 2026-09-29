import React, { useState } from 'react';
import { UserProfile, WeightRecord, HeightUnit, WeightUnit } from '../types';
import { calculateBMI } from '../utils/calculations';
import {
  User,
  Scale,
  Activity,
  Calendar,
  Settings,
  Database,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Edit2,
  Check,
  Smartphone,
  ShieldCheck,
  Download,
} from 'lucide-react';

interface ProfileViewProps {
  profile: UserProfile;
  weightHistory: WeightRecord[];
  onUpdateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  onLogWeight: (weight: number, date: string) => Promise<void>;
  onOpenSheetsModal: () => void;
  isSheetsConnected: boolean;
  onOpenAndroidGuide: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  weightHistory,
  onUpdateProfile,
  onLogWeight,
  onOpenSheetsModal,
  isSheetsConnected,
  onOpenAndroidGuide,
}) => {
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const [editName, setEditName] = useState(profile.name);
  const [editAge, setEditAge] = useState(profile.age);
  const [editHeight, setEditHeight] = useState(profile.height);
  const [editHeightUnit, setEditHeightUnit] = useState<HeightUnit>(profile.heightUnit);
  const [editWeightUnit, setEditWeightUnit] = useState<WeightUnit>(profile.weightUnit);

  // Stepper weight state
  const [stepperWeight, setStepperWeight] = useState<number>(profile.currentWeight);
  const [isSavingWeight, setIsSavingWeight] = useState(false);
  const [weightSuccessMsg, setWeightSuccessMsg] = useState(false);

  // Calculate descriptive BMI
  const bmiResult = calculateBMI(
    profile.height,
    profile.heightUnit,
    profile.currentWeight,
    profile.weightUnit
  );

  // Sorted recent weight history (descending)
  const recentHistory = [...weightHistory]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  const handleAdjustWeight = (delta: number) => {
    setStepperWeight((prev) => Math.round((prev + delta) * 10) / 10);
  };

  const handleSaveQuickWeight = async () => {
    setIsSavingWeight(true);
    try {
      const todayStr = '2026-09-15';
      await onLogWeight(stepperWeight, todayStr);
      setWeightSuccessMsg(true);
      setTimeout(() => setWeightSuccessMsg(false), 2500);
    } finally {
      setIsSavingWeight(false);
    }
  };

  const handleSaveProfileChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdateProfile({
      name: editName,
      age: editAge,
      height: editHeight,
      heightUnit: editHeightUnit,
      weightUnit: editWeightUnit,
    });
    setIsEditingProfile(false);
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-24 md:pb-12 animate-in fade-in duration-300">
      {/* Profile Header Card */}
      <div className="p-6 rounded-2xl bg-white border border-[#dee8ff] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative w-18 h-18 rounded-full overflow-hidden border-2 border-[#206140] shrink-0 shadow-xs">
            <img
              src={profile.avatarUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuA04s2OHlTUHciFOJr2jMfieUFWiHVUv11-Z8bD3FZngQ4uLYeY6afkVGT5GB6NUP35Z5TRN2N82-wy5FVCLYKD79m-rTHxjVjZtRMyQekvlckE01lMAI8vPJ1z-iNIGmEr3SCIYK9k_vOMxZSNNo7g7Q05NNpvKfywt2X0A7f4Wpdrl6IdfeuaQVrMWvRNqHUg64wXkMvQl0lO1uawriYnhVhRTJQwBkS95hM_Hfpg4FeXh7hjwUjq'}
              alt={profile.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[22px] font-bold text-[#121c2c]">{profile.name}</h1>
              <span className="w-5 h-5 rounded-full bg-[#aff1c6] text-[#206140] flex items-center justify-center text-[10px]">
                ✓
              </span>
            </div>
            <p className="text-[12px] text-[#404942]">
              Member since {profile.memberSince} • <span className="font-bold text-[#206140]">Day 14</span>
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsEditingProfile(!isEditingProfile)}
          className="h-10 px-4 rounded-xl bg-[#f0f3ff] text-[#206140] font-bold text-[13px] flex items-center justify-center gap-2 hover:bg-[#dee8ff] transition-colors self-start sm:self-auto"
        >
          <Edit2 className="w-3.5 h-3.5" />
          <span>{isEditingProfile ? 'Cancel' : 'Edit Profile'}</span>
        </button>
      </div>

      {/* Edit Profile Form Panel */}
      {isEditingProfile && (
        <form
          onSubmit={handleSaveProfileChanges}
          className="p-5 rounded-2xl bg-white border border-[#206140]/30 shadow-md flex flex-col gap-4 animate-in slide-in-from-top-3"
        >
          <h3 className="font-bold text-[16px] text-[#121c2c]">Edit Personal Profile</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-[#121c2c]">Name</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="h-10 px-3 rounded-xl bg-[#f0f3ff] text-[13px] border border-[#dee8ff]"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-[#121c2c]">Age</label>
              <input
                type="number"
                value={editAge}
                onChange={(e) => setEditAge(Number(e.target.value))}
                className="h-10 px-3 rounded-xl bg-[#f0f3ff] text-[13px] border border-[#dee8ff]"
                required
                min="1"
                max="120"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-[#121c2c]">Height ({editHeightUnit})</label>
              <input
                type="number"
                value={editHeight}
                onChange={(e) => setEditHeight(Number(e.target.value))}
                className="h-10 px-3 rounded-xl bg-[#f0f3ff] text-[13px] border border-[#dee8ff]"
                required
                min="50"
                max="250"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditingProfile(false)}
              className="px-4 py-2 rounded-xl text-[13px] text-[#404942]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#206140] text-white font-bold text-[13px] flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" /> Save Profile
            </button>
          </div>
        </form>
      )}

      {/* Personal Metrics Ribbon (Height, Weight, Age, BMI) matching UI */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Height */}
        <div className="p-4 rounded-2xl bg-white border border-[#dee8ff] shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-bold text-[#404942] uppercase tracking-wider">Height</span>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-[26px] font-extrabold text-[#121c2c]">{profile.height}</span>
            <span className="text-[12px] font-bold text-[#404942]">{profile.heightUnit}</span>
          </div>
          <span className="text-[10px] text-[#707972] mt-1">Recorded baseline</span>
        </div>

        {/* Weight */}
        <div className="p-4 rounded-2xl bg-white border border-[#dee8ff] shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-bold text-[#404942] uppercase tracking-wider">Weight</span>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-[26px] font-extrabold text-[#206140]">{profile.currentWeight}</span>
            <span className="text-[12px] font-bold text-[#404942]">{profile.weightUnit}</span>
          </div>
          <span className="text-[10px] text-[#206140] font-semibold mt-1">Latest scale entry</span>
        </div>

        {/* Age */}
        <div className="p-4 rounded-2xl bg-white border border-[#dee8ff] shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-bold text-[#404942] uppercase tracking-wider">Age</span>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-[26px] font-extrabold text-[#121c2c]">{profile.age}</span>
            <span className="text-[12px] font-bold text-[#404942]">yrs</span>
          </div>
          <span className="text-[10px] text-[#707972] mt-1">Personal profile</span>
        </div>

        {/* BMI (Descriptive, Non-Medical) */}
        <div className="p-4 rounded-2xl bg-white border border-[#dee8ff] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#404942] uppercase tracking-wider">BMI</span>
            {bmiResult && (
              <span className="px-2 py-0.5 rounded-full bg-[#aff1c6] text-[#002111] text-[9px] font-bold">
                {bmiResult.category}
              </span>
            )}
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-[26px] font-extrabold text-[#121c2c]">
              {bmiResult ? bmiResult.bmi : '—'}
            </span>
          </div>
          <span className="text-[10px] text-[#707972] mt-1">Descriptive indicator</span>
        </div>
      </div>

      {/* Fast Weight Update Card & Stepper */}
      <div className="p-6 rounded-2xl bg-white border border-[#dee8ff] shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[16px] font-bold text-[#121c2c]">Fast Weight Update</h2>
            <p className="text-[12px] text-[#404942]">Adjust and log today&apos;s scale reading directly</p>
          </div>
          <Scale className="w-5 h-5 text-[#206140]" />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-2xl bg-[#f0f3ff] gap-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => handleAdjustWeight(-0.1)}
              className="w-11 h-11 rounded-xl bg-white shadow-xs font-extrabold text-[20px] text-[#121c2c] flex items-center justify-center hover:bg-[#dee8ff] active:scale-95"
            >
              -
            </button>
            <div className="flex items-baseline gap-1">
              <span className="text-[36px] font-extrabold text-[#206140]">{stepperWeight}</span>
              <span className="text-[14px] font-bold text-[#404942]">{profile.weightUnit}</span>
            </div>
            <button
              type="button"
              onClick={() => handleAdjustWeight(0.1)}
              className="w-11 h-11 rounded-xl bg-white shadow-xs font-extrabold text-[20px] text-[#121c2c] flex items-center justify-center hover:bg-[#dee8ff] active:scale-95"
            >
              +
            </button>
          </div>

          <button
            onClick={handleSaveQuickWeight}
            disabled={isSavingWeight}
            className="h-11 px-6 rounded-xl bg-[#206140] text-white font-bold text-[13px] flex items-center justify-center gap-2 hover:bg-[#3b7a57] transition-all shadow-xs disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            <span>{isSavingWeight ? 'Saving...' : 'Save to DailyPlate'}</span>
          </button>
        </div>

        {weightSuccessMsg && (
          <div className="p-3 rounded-xl bg-[#c5ffd8]/50 text-[#002111] text-[12px] font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-[#206140]" />
            <span>Weight reading updated and logged to history!</span>
          </div>
        )}
      </div>

      {/* Recent History (Past 14 days) */}
      <div className="p-6 rounded-2xl bg-white border border-[#dee8ff] shadow-xs flex flex-col gap-3">
        <h3 className="font-bold text-[16px] text-[#121c2c]">Recent History</h3>
        <p className="text-[12px] text-[#404942] -mt-1">Actual verified weigh-in dates</p>

        <div className="flex flex-col divide-y divide-[#dee8ff]/60">
          {recentHistory.map((rec, i) => {
            const prevRec = recentHistory[i + 1];
            const diff = prevRec ? Math.round((rec.weight - prevRec.weight) * 10) / 10 : 0;
            return (
              <div key={rec.date} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-[#707972]" />
                  <span className="font-semibold text-[13px] text-[#121c2c]">
                    {rec.date === '2026-09-15' ? '15 Sep (Today)' : rec.date}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-[14px] text-[#121c2c]">
                    {rec.weight} {profile.weightUnit}
                  </span>
                  {prevRec && (
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        diff <= 0 ? 'bg-[#aff1c6] text-[#002111]' : 'bg-[#ffdad6] text-[#ba1a1a]'
                      }`}
                    >
                      {diff <= 0 ? `${diff}` : `+${diff}`} {profile.weightUnit}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Preferences & Routine */}
      <div className="p-6 rounded-2xl bg-white border border-[#dee8ff] shadow-xs flex flex-col gap-4">
        <h3 className="font-bold text-[16px] text-[#121c2c]">Preferences & Routine</h3>

        <div className="flex flex-col divide-y divide-[#dee8ff]/60">
          {/* Punctuality Tolerance Setting */}
          <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex flex-col">
              <span className="font-semibold text-[13px] text-[#121c2c]">Punctuality Window Tolerance</span>
              <span className="text-[11px] text-[#404942]">
                Meals eaten within this window are evaluated as on time
              </span>
            </div>
            <select
              value={profile.punctualityWindowMinutes}
              onChange={(e) => onUpdateProfile({ punctualityWindowMinutes: Number(e.target.value) })}
              className="h-10 px-3 rounded-xl bg-[#f0f3ff] text-[13px] font-bold text-[#206140] border border-[#dee8ff] focus:outline-none"
            >
              <option value="15">±15 minutes (Strict)</option>
              <option value="30">±30 minutes (Standard)</option>
              <option value="45">±45 minutes (Flexible)</option>
              <option value="60">±60 minutes (Relaxed)</option>
            </select>
          </div>

          {/* Units Selection */}
          <div className="py-3.5 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-semibold text-[13px] text-[#121c2c]">Measurement Units</span>
              <span className="text-[11px] text-[#404942]">Preferred system for weight and height</span>
            </div>
            <div className="flex items-center p-1 bg-[#f0f3ff] rounded-xl border border-[#dee8ff]">
              <button
                onClick={() => onUpdateProfile({ weightUnit: 'kg', heightUnit: 'cm' })}
                className={`px-3 py-1 rounded-lg text-[12px] font-bold ${
                  profile.weightUnit === 'kg' ? 'bg-[#206140] text-white' : 'text-[#404942]'
                }`}
              >
                Metric (kg/cm)
              </button>
              <button
                onClick={() => onUpdateProfile({ weightUnit: 'lb', heightUnit: 'ft' })}
                className={`px-3 py-1 rounded-lg text-[12px] font-bold ${
                  profile.weightUnit === 'lb' ? 'bg-[#206140] text-white' : 'text-[#404942]'
                }`}
              >
                Imperial (lb/ft)
              </button>
            </div>
          </div>

          {/* Gentle Reminders Toggle */}
          <div className="py-3.5 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-semibold text-[13px] text-[#121c2c]">Gentle Reminders</span>
              <span className="text-[11px] text-[#404942]">Soft prompts 10 minutes prior to meal times</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={profile.gentleReminders}
                onChange={(e) => onUpdateProfile({ gentleReminders: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#dee8ff] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#206140]"></div>
            </label>
          </div>

          {/* Google Sheets Connection */}
          <div className="py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#aff1c6] text-[#206140] flex items-center justify-center">
                <Database className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[13px] text-[#121c2c]">Google Sheets Database</span>
                  {isSheetsConnected ? (
                    <span className="px-2 py-0.2 rounded-full bg-[#c5ffd8] text-[#002111] text-[10px] font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-[#206140]" /> Connected
                    </span>
                  ) : (
                    <span className="px-2 py-0.2 rounded-full bg-[#ffdbc9] text-[#994703] text-[10px] font-bold flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 text-[#994703]" /> Ready to Link
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-[#404942]">Apps Script Web App synchronization</span>
              </div>
            </div>
            <button
              onClick={onOpenSheetsModal}
              className="px-3.5 py-1.5 rounded-xl bg-[#f0f3ff] text-[#206140] text-[12px] font-bold hover:bg-[#dee8ff]"
            >
              Configure
            </button>
          </div>
        </div>
      </div>

      {/* Android Phone & Mobile Experience Card */}
      <div className="p-6 rounded-2xl bg-white border border-[#dee8ff] shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#206140] text-white flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-[16px] text-[#121c2c]">Android Phone Experience</h3>
                <span className="px-2 py-0.5 rounded-full bg-[#aff1c6] text-[#002111] text-[10px] font-bold uppercase">
                  Standalone Ready
                </span>
              </div>
              <p className="text-[12px] text-[#404942]">
                Optimized for touch screens, offline caching, and zero invasive permissions
              </p>
            </div>
          </div>
          <button
            onClick={onOpenAndroidGuide}
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#206140] text-white text-[12px] font-bold hover:bg-[#3b7a57] transition shadow-xs"
          >
            <Smartphone className="w-3.5 h-3.5" /> Setup Guide
          </button>
        </div>

        <div className="p-4 rounded-xl bg-[#f0f3ff] border border-[#dee8ff] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-[#206140] shrink-0" />
            <div className="text-[12px]">
              <span className="font-bold text-[#121c2c]">Zero Invasive Control Permissions</span>
              <p className="text-[#404942]">
                DailyPlate does not request camera, microphone, GPS, contacts, or storage control. Completely private for personal use.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenAndroidGuide}
            className="sm:hidden w-full py-2.5 rounded-xl bg-[#206140] text-white text-[12px] font-bold flex items-center justify-center gap-1.5 shadow-xs"
          >
            <Smartphone className="w-3.5 h-3.5" /> Open Mobile Guide
          </button>
        </div>
      </div>
    </div>
  );
};
