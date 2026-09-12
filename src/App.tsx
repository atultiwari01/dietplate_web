import React, { useState, useEffect } from 'react';
import { ViewTab, UserProfile, Meal, WeightRecord } from './types';
import { api } from './services/api';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { DashboardView } from './components/DashboardView';
import { CalendarView } from './components/CalendarView';
import { ProgressView } from './components/ProgressView';
import { ProfileView } from './components/ProfileView';
import { MealModal } from './components/MealModal';
import { WeightModal } from './components/WeightModal';
import { SheetsSetupModal } from './components/SheetsSetupModal';
import { OnboardingModal } from './components/OnboardingModal';
import { INITIAL_PROFILE, INITIAL_MEALS, INITIAL_WEIGHT_HISTORY } from './data/seedData';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<ViewTab>('dashboard');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Core Application Data State
  const [profile, setProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [meals, setMeals] = useState<Meal[]>(INITIAL_MEALS);
  const [weightHistory, setWeightHistory] = useState<WeightRecord[]>(INITIAL_WEIGHT_HISTORY);

  // Modals & Sheets State
  const [isMealModalOpen, setIsMealModalOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [defaultMealDate, setDefaultMealDate] = useState('2026-09-15');

  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const [isSheetsModalOpen, setIsSheetsModalOpen] = useState(false);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Initial Load from API
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [profRes, mealsRes, weightRes] = await Promise.all([
          api.getProfile(),
          api.getMeals(),
          api.getWeightHistory(),
        ]);

        if (profRes.data) {
          setProfile(profRes.data);
          if (!profRes.data.onboardingCompleted) {
            setIsOnboardingModalOpen(true);
          }
        }
        if (mealsRes.data) setMeals(mealsRes.data);
        if (weightRes.data) setWeightHistory(weightRes.data);
      } catch (err) {
        console.warn('Initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const isSheetsConnected = Boolean(profile.googleAppsScriptUrl && profile.googleAppsScriptUrl.trim());

  // Meal Operations
  const handleOpenAddMeal = (initialDate?: string) => {
    setEditingMeal(null);
    setDefaultMealDate(initialDate || '2026-09-15');
    setIsMealModalOpen(true);
  };

  const handleEditMeal = (meal: Meal) => {
    setEditingMeal(meal);
    setDefaultMealDate(meal.date);
    setIsMealModalOpen(true);
  };

  const handleSaveMeal = async (mealData: Omit<Meal, 'mealId' | 'userId'> & { mealId?: string }) => {
    if (mealData.mealId) {
      const res = await api.updateMeal(mealData as Meal);
      if (res.success && res.data) {
        setMeals((prev) => prev.map((m) => (m.mealId === res.data!.mealId ? res.data! : m)));
        showToast('Meal updated successfully');
      } else {
        throw new Error(res.error || 'Failed to update meal');
      }
    } else {
      const res = await api.createMeal(mealData);
      if (res.success && res.data) {
        setMeals((prev) => [...prev, res.data!]);
        showToast('Meal planned and added to schedule');
      } else {
        throw new Error(res.error || 'Failed to create meal');
      }
    }
  };

  const handleCompleteMeal = async (mealId: string) => {
    const res = await api.completeMeal(mealId);
    if (res.success && res.data) {
      setMeals((prev) => prev.map((m) => (m.mealId === mealId ? res.data! : m)));
      showToast('Meal logged as completed!');
    }
  };

  const handleMissMeal = async (mealId: string) => {
    const res = await api.missMeal(mealId);
    if (res.success && res.data) {
      setMeals((prev) => prev.map((m) => (m.mealId === mealId ? res.data! : m)));
      showToast('Meal marked as missed', 'error');
    }
  };

  const handleDeleteMeal = async (mealId: string) => {
    const res = await api.deleteMeal(mealId);
    if (res.success) {
      setMeals((prev) => prev.filter((m) => m.mealId !== mealId));
      showToast('Meal removed from schedule');
    }
  };

  // Weight Operations
  const handleSaveWeight = async (weight: number, date: string) => {
    const res = await api.updateWeight(weight, date);
    if (res.success && res.data) {
      setWeightHistory((prev) => {
        const next = [...prev.filter((w) => w.date !== date), res.data!];
        return next.sort((a, b) => a.date.localeCompare(b.date));
      });
      setProfile((prev) => ({ ...prev, currentWeight: weight }));
      showToast(`Scale reading (${weight} ${profile.weightUnit}) recorded!`);
    } else {
      throw new Error(res.error || 'Failed to update weight');
    }
  };

  // Profile Operations
  const handleUpdateProfile = async (updates: Partial<UserProfile>) => {
    const res = await api.updateProfile(updates);
    if (res.success && res.data) {
      setProfile(res.data);
      showToast('Profile settings saved');
    } else {
      showToast(res.error || 'Error saving profile', 'error');
    }
  };

  // Google Sheets Sync
  const handleSaveGasUrl = async (url: string) => {
    api.setGasUrl(url);
    setProfile((prev) => ({ ...prev, googleAppsScriptUrl: url }));
    showToast('Google Sheets Web App connected!');
  };

  const handleSyncNow = async () => {
    const res = await api.syncWithGoogleSheets();
    if (res.success) {
      const [p, m, w] = await Promise.all([api.getProfile(), api.getMeals(), api.getWeightHistory()]);
      if (p.data) setProfile(p.data);
      if (m.data) setMeals(m.data);
      if (w.data) setWeightHistory(w.data);
      showToast(res.message);
    } else {
      throw new Error(res.message);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f9f9ff] flex flex-col items-center justify-center gap-3 text-[#206140]">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="font-bold text-[14px]">Loading DailyPlate...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f9ff] text-[#121c2c] flex flex-col antialiased selection:bg-[#cbe3d3] selection:text-[#002111]">
      {/* Toast Feedback Banner */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-3 fade-in duration-200">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-2.5 text-[13px] font-bold ${
              toastMessage.type === 'success'
                ? 'bg-white border-[#aff1c6] text-[#002111]'
                : 'bg-white border-[#ffdad6] text-[#ba1a1a]'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-[#206140]" />
            ) : (
              <AlertCircle className="w-4 h-4 text-[#ba1a1a]" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Main Layout Container */}
      <div className="flex flex-1 w-full">
        {/* Desktop Sticky Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          profile={profile}
          onOpenSheetsModal={() => setIsSheetsModalOpen(true)}
          isSheetsConnected={isSheetsConnected}
        />

        {/* Right Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Header */}
          <Header
            currentTab={currentTab}
            profile={profile}
            onSelectTab={setCurrentTab}
            onOpenSheetsModal={() => setIsSheetsModalOpen(true)}
            isSheetsConnected={isSheetsConnected}
          />

          {/* Tab Views */}
          <main className="flex-1 px-4 sm:px-6 md:px-8 py-6 max-w-6xl w-full mx-auto">
            {currentTab === 'dashboard' && (
              <DashboardView
                profile={profile}
                meals={meals}
                weightHistory={weightHistory}
                onNavigateTab={setCurrentTab}
                onOpenAddMeal={() => handleOpenAddMeal('2026-09-15')}
                onOpenLogWeight={() => setIsWeightModalOpen(true)}
                onCompleteMeal={handleCompleteMeal}
                onMissMeal={handleMissMeal}
                onEditMeal={handleEditMeal}
                onDeleteMeal={handleDeleteMeal}
              />
            )}

            {currentTab === 'calendar' && (
              <CalendarView
                profile={profile}
                meals={meals}
                onOpenAddMeal={handleOpenAddMeal}
                onCompleteMeal={handleCompleteMeal}
                onMissMeal={handleMissMeal}
                onEditMeal={handleEditMeal}
                onDeleteMeal={handleDeleteMeal}
              />
            )}

            {currentTab === 'progress' && (
              <ProgressView
                profile={profile}
                meals={meals}
                weightHistory={weightHistory}
                onOpenLogWeight={() => setIsWeightModalOpen(true)}
              />
            )}

            {currentTab === 'profile' && (
              <ProfileView
                profile={profile}
                weightHistory={weightHistory}
                onUpdateProfile={handleUpdateProfile}
                onLogWeight={handleSaveWeight}
                onOpenSheetsModal={() => setIsSheetsModalOpen(true)}
                isSheetsConnected={isSheetsConnected}
              />
            )}
          </main>

          {/* Desktop & Tablet Non-Medical Disclaimer Footer */}
          <footer className="hidden md:block py-6 px-8 border-t border-[#dee8ff]/80 text-center text-[11px] text-[#707972] bg-white/50">
            <p>
              DailyPlate is a personal diet planning and adherence tracking tool. It does not provide medical advice or dietary recommendations. All data flows securely through your Google Sheets.
            </p>
          </footer>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav currentTab={currentTab} onSelectTab={setCurrentTab} />

      {/* Meal Creation & Edit Modal */}
      <MealModal
        isOpen={isMealModalOpen}
        onClose={() => setIsMealModalOpen(false)}
        onSave={handleSaveMeal}
        initialMeal={editingMeal}
        defaultDate={defaultMealDate}
      />

      {/* Weight Log Modal */}
      <WeightModal
        isOpen={isWeightModalOpen}
        onClose={() => setIsWeightModalOpen(false)}
        onSave={handleSaveWeight}
        currentWeight={profile.currentWeight}
        weightUnit={profile.weightUnit}
      />

      {/* Google Sheets Setup Modal */}
      <SheetsSetupModal
        isOpen={isSheetsModalOpen}
        onClose={() => setIsSheetsModalOpen(false)}
        currentUrl={profile.googleAppsScriptUrl || ''}
        onSaveUrl={handleSaveGasUrl}
        onSyncNow={handleSyncNow}
        isSheetsConnected={isSheetsConnected}
      />

      {/* Onboarding Baseline Modal */}
      <OnboardingModal
        isOpen={isOnboardingModalOpen}
        onComplete={async (data) => {
          await handleUpdateProfile(data);
          setIsOnboardingModalOpen(false);
        }}
        initialProfile={profile}
      />
    </div>
  );
}
