import { useCallback, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'cs-basic-terminology-progress-v1';

function emptyState() {
  return {
    completed: {},
    started: {},
    lastVisitedId: null,
  };
}

function readStorage() {
  if (typeof window === 'undefined') return emptyState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw);
    return {
      completed: parsed.completed && typeof parsed.completed === 'object' ? parsed.completed : {},
      started: parsed.started && typeof parsed.started === 'object' ? parsed.started : {},
      lastVisitedId: typeof parsed.lastVisitedId === 'string' ? parsed.lastVisitedId : null,
    };
  } catch {
    return emptyState();
  }
}

/**
 * Local-only progress for Basic Terminology (no auth / no backend).
 * Status per concept: not-started | in-progress | completed
 */
export default function useBasicTerminologyProgress(topicIds = []) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [state, setState] = useState(emptyState);

  useEffect(() => {
    setState(readStorage());
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated || typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [isHydrated, state]);

  const statusFor = useCallback(
    (topicId) => {
      if (state.completed[topicId]) return 'completed';
      if (state.started[topicId] || state.lastVisitedId === topicId) return 'in-progress';
      return 'not-started';
    },
    [state],
  );

  const markVisited = useCallback((topicId) => {
    if (!topicId) return;
    setState((prev) => ({
      ...prev,
      lastVisitedId: topicId,
      started: { ...prev.started, [topicId]: true },
    }));
  }, []);

  const markCompleted = useCallback((topicId) => {
    if (!topicId) return;
    setState((prev) => ({
      ...prev,
      lastVisitedId: topicId,
      started: { ...prev.started, [topicId]: true },
      completed: { ...prev.completed, [topicId]: true },
    }));
  }, []);

  const markIncomplete = useCallback((topicId) => {
    if (!topicId) return;
    setState((prev) => {
      const completed = { ...prev.completed };
      delete completed[topicId];
      return { ...prev, completed };
    });
  }, []);

  const completedCount = useMemo(
    () => topicIds.filter((id) => state.completed[id]).length,
    [state.completed, topicIds],
  );

  const moduleCompletion = useCallback(
    (moduleTopicIds) => {
      if (!moduleTopicIds.length) return 0;
      const done = moduleTopicIds.filter((id) => state.completed[id]).length;
      return Math.round((done / moduleTopicIds.length) * 100);
    },
    [state.completed],
  );

  return {
    isHydrated,
    state,
    statusFor,
    markVisited,
    markCompleted,
    markIncomplete,
    completedCount,
    totalCount: topicIds.length,
    moduleCompletion,
    lastVisitedId: state.lastVisitedId,
  };
}
