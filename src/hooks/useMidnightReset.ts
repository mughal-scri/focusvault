import { useEffect, useRef } from 'react';
import { useAppStore } from '../store/store';

export default function useMidnightReset() {
  const { goals, focusNote, setFocusNote, lockedApps, resetDailyUsage } = useAppStore();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getMsUntilMidnight = () => {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    return midnight.getTime() - now.getTime();
  };

  const scheduleReset = () => {
    const msUntilMidnight = getMsUntilMidnight();

    timerRef.current = setTimeout(() => {
      // Reset daily focus note
      setFocusNote('');

      // Reset daily usage for all locked apps
      resetDailyUsage();

      // Schedule next reset
      scheduleReset();
    }, msUntilMidnight);
  };

  useEffect(() => {
    scheduleReset();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);
}