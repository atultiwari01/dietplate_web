import { UserProfile, Meal, WeightRecord, DailyStatistic } from '../types';
import { INITIAL_PROFILE, INITIAL_MEALS, INITIAL_WEIGHT_HISTORY } from '../data/seedData';
import { calculateDailyStatistic } from '../utils/calculations';

const STORAGE_KEYS = {
  PROFILE: 'dailyplate_profile_v1',
  MEALS: 'dailyplate_meals_v1',
  WEIGHT: 'dailyplate_weight_v1',
  GAS_URL: 'dailyplate_gas_url_v1',
  SYNC_TIMESTAMP: 'dailyplate_last_sync_v1',
};

// Safe helper to access localStorage
function getStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.warn(`[DailyPlate Storage] Error reading ${key}:`, e);
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`[DailyPlate Storage] Error saving ${key}:`, e);
  }
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  source: 'google_sheets' | 'local_database';
}

/**
 * DailyPlate Centralized API Service Layer
 */
class ApiService {
  private getGasUrl(): string {
    const fromStorage = localStorage.getItem(STORAGE_KEYS.GAS_URL);
    if (fromStorage && fromStorage.trim()) return fromStorage.trim();
    const profile = getStored<UserProfile>(STORAGE_KEYS.PROFILE, INITIAL_PROFILE);
    return profile.googleAppsScriptUrl || '';
  }

  public setGasUrl(url: string): void {
    localStorage.setItem(STORAGE_KEYS.GAS_URL, url.trim());
    const profile = getStored<UserProfile>(STORAGE_KEYS.PROFILE, INITIAL_PROFILE);
    profile.googleAppsScriptUrl = url.trim();
    setStored(STORAGE_KEYS.PROFILE, profile);
  }

  public getLastSyncTime(): string | null {
    return localStorage.getItem(STORAGE_KEYS.SYNC_TIMESTAMP);
  }

  private setLastSyncTime(): void {
    localStorage.setItem(STORAGE_KEYS.SYNC_TIMESTAMP, new Date().toISOString());
  }

  /**
   * Dispatches an action to Google Apps Script or falls back gracefully
   */
  private async callGas<T>(action: string, payload?: any, method: 'GET' | 'POST' = 'POST'): Promise<T | null> {
    const gasUrl = this.getGasUrl();
    if (!gasUrl) return null;

    try {
      // First attempt direct fetch or via server proxy /api/gas to avoid browser CORS
      const targetUrl = `/api/gas?url=${encodeURIComponent(gasUrl)}${method === 'GET' ? `&action=${action}` : ''}`;
      
      let res: Response;
      if (method === 'GET') {
        res = await fetch(targetUrl);
      } else {
        res = await fetch('/api/gas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gasUrl, action, payload }),
        });
      }

      if (res.ok) {
        const json = await res.json();
        if (json && json.status === 'success') {
          this.setLastSyncTime();
          return json.data as T;
        }
      }
    } catch (err) {
      console.warn('[DailyPlate API] Google Apps Script proxy request error, falling back:', err);
    }

    return null;
  }

  // -------------------------------------------------------------
  // Profile API
  // -------------------------------------------------------------

  async getProfile(): Promise<ApiResponse<UserProfile>> {
    const gasData = await this.callGas<UserProfile>('GET_PROFILE', null, 'GET');
    if (gasData) {
      setStored(STORAGE_KEYS.PROFILE, gasData);
      return { success: true, data: gasData, source: 'google_sheets' };
    }

    const localProfile = getStored<UserProfile>(STORAGE_KEYS.PROFILE, INITIAL_PROFILE);
    return { success: true, data: localProfile, source: 'local_database' };
  }

  async updateProfile(updates: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> {
    const current = getStored<UserProfile>(STORAGE_KEYS.PROFILE, INITIAL_PROFILE);
    const merged: UserProfile = { ...current, ...updates };

    // Validation
    if (merged.age < 1 || merged.age > 125) {
      return { success: false, error: 'Please enter a valid age between 1 and 125.', source: 'local_database' };
    }
    if (merged.height <= 0) {
      return { success: false, error: 'Please enter a valid positive height.', source: 'local_database' };
    }
    if (merged.currentWeight <= 0) {
      return { success: false, error: 'Please enter a valid positive weight.', source: 'local_database' };
    }

    // Call GAS if connected
    const gasData = await this.callGas<UserProfile>('UPDATE_PROFILE', merged, 'POST');
    const finalProfile = gasData || merged;

    setStored(STORAGE_KEYS.PROFILE, finalProfile);

    // If weight changed, log to weight history
    if (updates.currentWeight && updates.currentWeight !== current.currentWeight) {
      await this.updateWeight(updates.currentWeight, new Date().toISOString().split('T')[0], 'user_entry');
    }

    return { success: true, data: finalProfile, source: gasData ? 'google_sheets' : 'local_database' };
  }

  // -------------------------------------------------------------
  // Meals API
  // -------------------------------------------------------------

  async getMeals(dateFilter?: string): Promise<ApiResponse<Meal[]>> {
    const gasData = await this.callGas<Meal[]>('GET_MEALS', { date: dateFilter }, 'GET');
    if (gasData && Array.isArray(gasData)) {
      setStored(STORAGE_KEYS.MEALS, gasData);
      const filtered = dateFilter ? gasData.filter((m) => m.date === dateFilter) : gasData;
      return { success: true, data: filtered, source: 'google_sheets' };
    }

    const localMeals = getStored<Meal[]>(STORAGE_KEYS.MEALS, INITIAL_MEALS);
    const filtered = dateFilter ? localMeals.filter((m) => m.date === dateFilter) : localMeals;
    return { success: true, data: filtered, source: 'local_database' };
  }

  async createMeal(mealInput: Omit<Meal, 'mealId' | 'userId'>): Promise<ApiResponse<Meal>> {
    // Validation
    if (!mealInput.mealName || !mealInput.mealName.trim()) {
      return { success: false, error: 'Meal name is required.', source: 'local_database' };
    }
    if (!mealInput.date) {
      return { success: false, error: 'Scheduled date is required.', source: 'local_database' };
    }
    if (!mealInput.scheduledTime) {
      return { success: false, error: 'Scheduled time is mandatory for punctuality evaluation.', source: 'local_database' };
    }
    if (isNaN(mealInput.calories) || mealInput.calories < 0) {
      return { success: false, error: 'Calories must be a valid positive number.', source: 'local_database' };
    }

    const profile = getStored<UserProfile>(STORAGE_KEYS.PROFILE, INITIAL_PROFILE);
    const newMeal: Meal = {
      ...mealInput,
      mealId: `meal_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: profile.userId,
      status: mealInput.status || 'PLANNED',
      actualCompletionTime: mealInput.actualCompletionTime || null,
    };

    const gasData = await this.callGas<Meal>('CREATE_MEAL', newMeal, 'POST');
    const finalMeal = gasData || newMeal;

    const allMeals = getStored<Meal[]>(STORAGE_KEYS.MEALS, INITIAL_MEALS);
    allMeals.push(finalMeal);
    setStored(STORAGE_KEYS.MEALS, allMeals);

    return { success: true, data: finalMeal, source: gasData ? 'google_sheets' : 'local_database' };
  }

  async updateMeal(meal: Meal): Promise<ApiResponse<Meal>> {
    if (!meal.mealName || !meal.mealName.trim()) {
      return { success: false, error: 'Meal name cannot be empty.', source: 'local_database' };
    }
    if (!meal.scheduledTime) {
      return { success: false, error: 'Scheduled time is mandatory.', source: 'local_database' };
    }

    const gasData = await this.callGas<Meal>('UPDATE_MEAL', meal, 'POST');
    const finalMeal = gasData || meal;

    const allMeals = getStored<Meal[]>(STORAGE_KEYS.MEALS, INITIAL_MEALS);
    const index = allMeals.findIndex((m) => m.mealId === meal.mealId);
    if (index !== -1) {
      allMeals[index] = finalMeal;
      setStored(STORAGE_KEYS.MEALS, allMeals);
    }

    return { success: true, data: finalMeal, source: gasData ? 'google_sheets' : 'local_database' };
  }

  async deleteMeal(mealId: string): Promise<ApiResponse<{ mealId: string }>> {
    await this.callGas('DELETE_MEAL', { mealId }, 'POST');

    const allMeals = getStored<Meal[]>(STORAGE_KEYS.MEALS, INITIAL_MEALS);
    const filtered = allMeals.filter((m) => m.mealId !== mealId);
    setStored(STORAGE_KEYS.MEALS, filtered);

    return { success: true, data: { mealId }, source: 'local_database' };
  }

  async completeMeal(mealId: string, actualTime?: string): Promise<ApiResponse<Meal>> {
    const timestamp = actualTime || new Date().toISOString();
    
    await this.callGas('COMPLETE_MEAL', { mealId, actualCompletionTime: timestamp }, 'POST');

    const allMeals = getStored<Meal[]>(STORAGE_KEYS.MEALS, INITIAL_MEALS);
    const index = allMeals.findIndex((m) => m.mealId === mealId);
    if (index === -1) {
      return { success: false, error: 'Meal not found', source: 'local_database' };
    }

    allMeals[index].status = 'COMPLETED';
    allMeals[index].actualCompletionTime = timestamp;
    setStored(STORAGE_KEYS.MEALS, allMeals);

    return { success: true, data: allMeals[index], source: 'local_database' };
  }

  async missMeal(mealId: string): Promise<ApiResponse<Meal>> {
    await this.callGas('MISS_MEAL', { mealId }, 'POST');

    const allMeals = getStored<Meal[]>(STORAGE_KEYS.MEALS, INITIAL_MEALS);
    const index = allMeals.findIndex((m) => m.mealId === mealId);
    if (index === -1) {
      return { success: false, error: 'Meal not found', source: 'local_database' };
    }

    allMeals[index].status = 'MISSED';
    allMeals[index].actualCompletionTime = null;
    setStored(STORAGE_KEYS.MEALS, allMeals);

    return { success: true, data: allMeals[index], source: 'local_database' };
  }

  // -------------------------------------------------------------
  // Weight API
  // -------------------------------------------------------------

  async getWeightHistory(): Promise<ApiResponse<WeightRecord[]>> {
    const gasData = await this.callGas<WeightRecord[]>('GET_WEIGHT_HISTORY', null, 'GET');
    if (gasData && Array.isArray(gasData)) {
      setStored(STORAGE_KEYS.WEIGHT, gasData);
      return { success: true, data: gasData, source: 'google_sheets' };
    }

    const localWeight = getStored<WeightRecord[]>(STORAGE_KEYS.WEIGHT, INITIAL_WEIGHT_HISTORY);
    return { success: true, data: localWeight, source: 'local_database' };
  }

  async updateWeight(weight: number, date?: string, source: 'user_entry' | 'baseline' = 'user_entry'): Promise<ApiResponse<WeightRecord>> {
    if (isNaN(weight) || weight <= 0) {
      return { success: false, error: 'Please enter a valid weight number.', source: 'local_database' };
    }

    const dateStr = date || new Date().toISOString().split('T')[0];
    const newRecord: WeightRecord = {
      date: dateStr,
      weight: Math.round(weight * 10) / 10,
      source,
    };

    await this.callGas('UPDATE_WEIGHT', newRecord, 'POST');

    const history = getStored<WeightRecord[]>(STORAGE_KEYS.WEIGHT, INITIAL_WEIGHT_HISTORY);
    const existingIndex = history.findIndex((h) => h.date === dateStr);
    if (existingIndex !== -1) {
      history[existingIndex] = newRecord;
    } else {
      history.push(newRecord);
    }
    history.sort((a, b) => a.date.localeCompare(b.date));
    setStored(STORAGE_KEYS.WEIGHT, history);

    // Also update current profile weight
    const profile = getStored<UserProfile>(STORAGE_KEYS.PROFILE, INITIAL_PROFILE);
    profile.currentWeight = newRecord.weight;
    setStored(STORAGE_KEYS.PROFILE, profile);

    return { success: true, data: newRecord, source: 'local_database' };
  }

  // -------------------------------------------------------------
  // Daily Statistics & Health Check
  // -------------------------------------------------------------

  async getDailyStatistics(): Promise<ApiResponse<DailyStatistic[]>> {
    const profile = getStored<UserProfile>(STORAGE_KEYS.PROFILE, INITIAL_PROFILE);
    const meals = getStored<Meal[]>(STORAGE_KEYS.MEALS, INITIAL_MEALS);

    // Group meals by date
    const dates = Array.from(new Set(meals.map((m) => m.date))).sort();
    const stats = dates.map((d) => calculateDailyStatistic(d, meals, profile.punctualityWindowMinutes));

    return { success: true, data: stats, source: 'local_database' };
  }

  async testConnection(testUrl?: string): Promise<{ success: boolean; message: string }> {
    const url = testUrl || this.getGasUrl();
    if (!url) {
      return { success: false, message: 'No Google Apps Script Web App URL provided.' };
    }

    try {
      const res = await fetch(`/api/gas?url=${encodeURIComponent(url)}&action=PING`);
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'success') {
          return { success: true, message: data.message || 'Connected to Google Sheets successfully!' };
        }
      }
      return { success: false, message: 'Google Apps Script responded, but returned an error status.' };
    } catch (e: any) {
      return { success: false, message: e.message || 'Could not connect to Google Apps Script. Check deployment settings.' };
    }
  }

  async syncWithGoogleSheets(): Promise<{ success: boolean; message: string }> {
    const gasUrl = this.getGasUrl();
    if (!gasUrl) {
      return { success: false, message: 'Please configure your Google Apps Script URL in Settings first.' };
    }

    try {
      const res = await fetch(`/api/gas?url=${encodeURIComponent(gasUrl)}&action=GET_ALL_DATA`);
      if (!res.ok) {
        return { success: false, message: 'Network response from Google Apps Script failed.' };
      }
      const json = await res.json();
      if (json && json.status === 'success' && json.data) {
        const { profile, meals, weightHistory } = json.data;
        if (profile) setStored(STORAGE_KEYS.PROFILE, profile);
        if (meals && Array.isArray(meals)) setStored(STORAGE_KEYS.MEALS, meals);
        if (weightHistory && Array.isArray(weightHistory)) setStored(STORAGE_KEYS.WEIGHT, weightHistory);
        this.setLastSyncTime();
        return { success: true, message: 'Successfully synced all data from Google Sheets!' };
      }
      return { success: false, message: 'Invalid data format received from Google Apps Script.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to sync with Google Sheets.' };
    }
  }
}

export const api = new ApiService();
