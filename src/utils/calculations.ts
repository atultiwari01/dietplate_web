import { Meal, WeightRecord, DailyStatistic, AggregatedDietStat, TimeAggregation, HeightUnit, WeightUnit } from '../types';

/**
 * Calculates BMI from height and weight.
 * BMI = weight in kilograms / height in meters²
 * Purely descriptive, non-medical.
 */
export function calculateBMI(
  height: number,
  heightUnit: HeightUnit,
  weight: number,
  weightUnit: WeightUnit
): { bmi: number; category: string } | null {
  if (!height || height <= 0 || !weight || weight <= 0) {
    return null;
  }

  // Convert height to meters
  let heightMeters = heightUnit === 'cm' ? height / 100 : height * 0.3048;
  // Convert weight to kilograms
  let weightKg = weightUnit === 'kg' ? weight : weight * 0.45359237;

  if (heightMeters <= 0 || weightKg <= 0) {
    return null;
  }

  const rawBmi = weightKg / (heightMeters * heightMeters);
  const bmi = Math.round(rawBmi * 10) / 10;

  let category = 'Normal';
  if (bmi < 18.5) {
    category = 'Underweight';
  } else if (bmi < 25.0) {
    category = 'Normal';
  } else if (bmi < 30.0) {
    category = 'Moderate';
  } else {
    category = 'Elevated';
  }

  return { bmi, category };
}

/**
 * Parses time string (e.g. '08:00', '14:30', or ISO string) to minutes from midnight
 */
export function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  // If it's an ISO timestamp or date string
  if (timeStr.includes('T')) {
    const d = new Date(timeStr);
    return d.getHours() * 60 + d.getMinutes();
  }
  // Check for AM/PM format (e.g. "08:00 AM")
  const ampmMatch = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (ampmMatch) {
    let hours = parseInt(ampmMatch[1], 10);
    const minutes = parseInt(ampmMatch[2], 10);
    const period = ampmMatch[3]?.toUpperCase();
    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  }

  // Standard "HH:mm"
  const parts = timeStr.split(':');
  const hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;
  return hours * 60 + minutes;
}

/**
 * Checks whether a completed meal was punctual given a tolerance in minutes.
 * A meal completed within scheduledTime - tolerance and scheduledTime + tolerance is punctual.
 */
export function isMealPunctual(
  scheduledTime: string,
  actualCompletionTime: string | null | undefined,
  toleranceMinutes: number
): boolean {
  if (!actualCompletionTime) return false;

  const scheduledMins = timeToMinutes(scheduledTime);
  const actualMins = timeToMinutes(actualCompletionTime);

  const diff = Math.abs(actualMins - scheduledMins);
  return diff <= toleranceMinutes;
}

/**
 * Formats time difference for display (e.g. "On time", "22m late", "10m early")
 */
export function getPunctualityDescription(
  scheduledTime: string,
  actualCompletionTime: string | null | undefined,
  toleranceMinutes: number
): { isPunctual: boolean; text: string; deltaMinutes: number } {
  if (!actualCompletionTime) {
    return { isPunctual: false, text: 'Pending', deltaMinutes: 0 };
  }

  const scheduledMins = timeToMinutes(scheduledTime);
  const actualMins = timeToMinutes(actualCompletionTime);
  const diff = actualMins - scheduledMins;
  const isPunctual = Math.abs(diff) <= toleranceMinutes;

  if (isPunctual) {
    return { isPunctual: true, text: 'On time', deltaMinutes: diff };
  } else if (diff > 0) {
    return { isPunctual: false, text: `${diff}m late`, deltaMinutes: diff };
  } else {
    return { isPunctual: false, text: `${Math.abs(diff)}m early`, deltaMinutes: diff };
  }
}

/**
 * Calculates daily statistics for a given set of meals on a date
 */
export function calculateDailyStatistic(
  date: string,
  meals: Meal[],
  toleranceMinutes: number
): DailyStatistic {
  const dayMeals = meals.filter((m) => m.date === date);
  const plannedMeals = dayMeals.length;
  const completedMeals = dayMeals.filter((m) => m.status === 'COMPLETED').length;
  const missedMeals = dayMeals.filter((m) => m.status === 'MISSED').length;

  const adherence = plannedMeals > 0 ? Math.round((completedMeals / plannedMeals) * 100) : null;

  // Punctuality only considers completed meals
  let onTimeMeals = 0;
  for (const meal of dayMeals) {
    if (meal.status === 'COMPLETED' && meal.actualCompletionTime) {
      if (isMealPunctual(meal.scheduledTime, meal.actualCompletionTime, toleranceMinutes)) {
        onTimeMeals++;
      }
    }
  }

  const punctuality = completedMeals > 0 ? Math.round((onTimeMeals / completedMeals) * 100) : null;

  return {
    date,
    plannedMeals,
    completedMeals,
    missedMeals,
    adherence,
    onTimeMeals,
    punctuality,
  };
}

/**
 * Aggregates statistics over daily, weekly, or monthly intervals
 * strictly preserving mathematically sound aggregations (summing meals across periods)
 */
export function aggregateDietStatistics(
  meals: Meal[],
  toleranceMinutes: number,
  aggregation: TimeAggregation,
  anchorDate: Date = new Date(2026, 8, 15) // Sep 15, 2026
): AggregatedDietStat[] {
  if (aggregation === 'daily') {
    // Show last 7 days ending at anchorDate or week around anchorDate
    const result: AggregatedDietStat[] = [];
    // 5-7 days around anchor date
    const start = new Date(anchorDate);
    start.setDate(start.getDate() - 4); // Mon to Fri or 7-day window

    for (let i = 0; i < 7; i++) {
      const cur = new Date(start);
      cur.setDate(start.getDate() + i);
      const dateStr = cur.toISOString().split('T')[0];
      const dayName = cur.toLocaleDateString('en-US', { weekday: 'short' });
      const dayStat = calculateDailyStatistic(dateStr, meals, toleranceMinutes);

      result.push({
        periodLabel: dayName,
        dateStart: dateStr,
        dateEnd: dateStr,
        plannedMeals: dayStat.plannedMeals,
        completedMeals: dayStat.completedMeals,
        missedMeals: dayStat.missedMeals,
        adherence: dayStat.adherence,
        onTimeMeals: dayStat.onTimeMeals,
        punctuality: dayStat.punctuality,
      });
    }
    return result;
  }

  if (aggregation === 'weekly') {
    // Return last 5-6 weeks
    const result: AggregatedDietStat[] = [];
    const baseDate = new Date(anchorDate);

    for (let w = 4; w >= 0; w--) {
      const weekStart = new Date(baseDate);
      weekStart.setDate(baseDate.getDate() - w * 7 - baseDate.getDay() + 1);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      const weekStartStr = weekStart.toISOString().split('T')[0];
      const weekEndStr = weekEnd.toISOString().split('T')[0];

      const weekMeals = meals.filter((m) => m.date >= weekStartStr && m.date <= weekEndStr);
      const plannedMeals = weekMeals.length;
      const completedMeals = weekMeals.filter((m) => m.status === 'COMPLETED').length;
      const missedMeals = weekMeals.filter((m) => m.status === 'MISSED').length;

      let onTimeMeals = 0;
      for (const meal of weekMeals) {
        if (meal.status === 'COMPLETED' && meal.actualCompletionTime) {
          if (isMealPunctual(meal.scheduledTime, meal.actualCompletionTime, toleranceMinutes)) {
            onTimeMeals++;
          }
        }
      }

      const adherence = plannedMeals > 0 ? Math.round((completedMeals / plannedMeals) * 100) : null;
      const punctuality = completedMeals > 0 ? Math.round((onTimeMeals / completedMeals) * 100) : null;

      const label = w === 0 ? 'This Wk' : `Wk ${5 - w}`;
      result.push({
        periodLabel: label,
        dateStart: weekStartStr,
        dateEnd: weekEndStr,
        plannedMeals,
        completedMeals,
        missedMeals,
        adherence,
        onTimeMeals,
        punctuality,
      });
    }
    return result;
  }

  // Monthly aggregation
  const result: AggregatedDietStat[] = [];
  const year = anchorDate.getFullYear();
  const currentMonth = anchorDate.getMonth();

  for (let m = 3; m >= 0; m--) {
    const targetMonth = currentMonth - m;
    const dateObj = new Date(year, targetMonth, 1);
    const monthStart = new Date(dateObj.getFullYear(), dateObj.getMonth(), 1);
    const monthEnd = new Date(dateObj.getFullYear(), dateObj.getMonth() + 1, 0);

    const startStr = monthStart.toISOString().split('T')[0];
    const endStr = monthEnd.toISOString().split('T')[0];

    const monthMeals = meals.filter((item) => item.date >= startStr && item.date <= endStr);
    const plannedMeals = monthMeals.length;
    const completedMeals = monthMeals.filter((item) => item.status === 'COMPLETED').length;
    const missedMeals = monthMeals.filter((item) => item.status === 'MISSED').length;

    let onTimeMeals = 0;
    for (const meal of monthMeals) {
      if (meal.status === 'COMPLETED' && meal.actualCompletionTime) {
        if (isMealPunctual(meal.scheduledTime, meal.actualCompletionTime, toleranceMinutes)) {
          onTimeMeals++;
        }
      }
    }

    const adherence = plannedMeals > 0 ? Math.round((completedMeals / plannedMeals) * 100) : null;
    const punctuality = completedMeals > 0 ? Math.round((onTimeMeals / completedMeals) * 100) : null;
    const monthName = monthStart.toLocaleDateString('en-US', { month: 'short' });

    result.push({
      periodLabel: monthName,
      dateStart: startStr,
      dateEnd: endStr,
      plannedMeals,
      completedMeals,
      missedMeals,
      adherence,
      onTimeMeals,
      punctuality,
    });
  }

  return result;
}

/**
 * Builds visualization data for weight history with forward-carry interpolation.
 * NEVER alters the underlying raw records.
 */
export function buildWeightVisualizationSeries(
  rawRecords: WeightRecord[],
  daysCount: number = 30,
  endDate: string = '2026-09-15'
): { date: string; displayDate: string; actualWeight: number | null; interpolatedWeight: number }[] {
  if (rawRecords.length === 0) return [];

  // Sort raw records by date ascending
  const sorted = [...rawRecords].sort((a, b) => a.date.localeCompare(b.date));
  const recordMap = new Map<string, number>();
  sorted.forEach((r) => recordMap.set(r.date, r.weight));

  const series: { date: string; displayDate: string; actualWeight: number | null; interpolatedWeight: number }[] = [];
  const end = new Date(endDate);

  let lastKnownWeight = sorted[0].weight;

  // Find initial baseline before the window if available
  for (let i = daysCount - 1; i >= 0; i--) {
    const cur = new Date(end);
    cur.setDate(end.getDate() - i);
    const dateStr = cur.toISOString().split('T')[0];

    const actual = recordMap.has(dateStr) ? recordMap.get(dateStr)! : null;
    if (actual !== null) {
      lastKnownWeight = actual;
    }

    series.push({
      date: dateStr,
      displayDate: cur.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      actualWeight: actual,
      interpolatedWeight: lastKnownWeight,
    });
  }

  return series;
}

/**
 * Format standard date string (YYYY-MM-DD) to friendly display "Tuesday, 15 September"
 */
export function formatLongDate(dateStr: string): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

export function formatShortTime(time24: string): string {
  if (!time24) return '';
  // Convert 24-hr HH:mm to 12-hr with AM/PM
  const [h, m] = time24.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 === 0 ? 12 : h % 12;
  const padH = displayH < 10 ? `0${displayH}` : `${displayH}`;
  const padM = m < 10 ? `0${m}` : `${m}`;
  return `${padH}:${padM} ${period}`;
}
