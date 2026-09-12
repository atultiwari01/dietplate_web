export type MealStatus = 'PLANNED' | 'COMPLETED' | 'MISSED';

export type HeightUnit = 'cm' | 'ft';
export type WeightUnit = 'kg' | 'lb';
export type GenderIdentity = 'female' | 'male' | 'nonbinary' | 'unspecified';

export interface UserProfile {
  userId: string;
  name: string;
  age: number;
  gender: GenderIdentity;
  height: number; // in current heightUnit
  heightUnit: HeightUnit;
  currentWeight: number; // in current weightUnit
  startingWeight: number; // in current weightUnit
  weightUnit: WeightUnit;
  punctualityWindowMinutes: number; // e.g., 15 or 30
  onboardingCompleted: boolean;
  memberSince: string; // ISO date string or 'Sep 2026'
  avatarUrl?: string;
  gentleReminders: boolean;
  dailyReflections: boolean;
  googleAppsScriptUrl?: string; // Optional deployed Google Apps Script Web App URL
}

export interface Meal {
  mealId: string;
  userId: string;
  date: string; // YYYY-MM-DD
  scheduledTime: string; // HH:mm format (e.g. '08:00', '14:00', '20:30')
  mealName: string; // e.g. 'Breakfast', 'Morning Snack', etc.
  calories: number; // Sensible numeric kcal
  notes?: string;
  imageUrl?: string;
  status: MealStatus;
  actualCompletionTime?: string | null; // ISO timestamp string or HH:mm e.g. '2026-09-15T08:04:00Z'
}

export interface WeightRecord {
  date: string; // YYYY-MM-DD
  weight: number; // stored in user's unit
  source: 'user_entry' | 'baseline';
  note?: string;
}

export interface DailyStatistic {
  date: string; // YYYY-MM-DD
  plannedMeals: number;
  completedMeals: number;
  missedMeals: number;
  adherence: number | null; // null if 0 planned meals
  onTimeMeals: number;
  punctuality: number | null; // null if 0 completed meals
}

export interface AggregatedDietStat {
  periodLabel: string; // e.g. 'Mon', 'Wk 37', 'Sep'
  dateStart: string;
  dateEnd: string;
  plannedMeals: number;
  completedMeals: number;
  missedMeals: number;
  adherence: number | null; // null if no planned meals
  onTimeMeals: number;
  punctuality: number | null; // null if no completed meals
}

export interface ProgressSummary {
  adherenceRate: number | null;
  punctualityRate: number | null;
  totalPlanned: number;
  totalCompleted: number;
  totalMissed: number;
  totalOnTime: number;
  startingWeight: number;
  currentWeight: number;
  weightDelta: number;
}

export type ViewTab = 'dashboard' | 'calendar' | 'progress' | 'profile';
export type TimeAggregation = 'daily' | 'weekly' | 'monthly';
export type WeightTimeRange = '1M' | '3M' | '6M' | 'All';
