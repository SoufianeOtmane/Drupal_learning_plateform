"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { LearnerState } from "@/lib/learner-types";
import { readApiResponse } from "@/lib/read-api-response";

export function useLearnerState() {
  const [state, setState] = useState<LearnerState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const hasLoaded = useRef(false);

  const refresh = useCallback(async () => {
    if (!hasLoaded.current) setLoading(true);
    setError("");
    try {
      const payload = await readApiResponse<LearnerState>(await fetch("/api/learner"));
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
