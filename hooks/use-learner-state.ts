"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { LearnerState } from "@/lib/learner-types";

export function useLearnerState() {
  const [state, setState] = useState<LearnerState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const hasLoaded = useRef(false);

  const refresh = useCallback(async () => {
    if (!hasLoaded.current) setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/learner");
      const payload = (await response.json()) as LearnerState & { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Could not load your learner record.");
      setState(payload);
      hasLoaded.current = true;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load your learner record.");
    } finally {
      hasLoaded.current = true;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { state, loading, error, refresh };
}
