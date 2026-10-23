import { useCallback, useEffect, useState } from "react";
import { getErrorMessage } from "../services/api";

// Runs `request` (a function returning an axios promise) and tracks data/loading/error.
// `deps` re-runs the request; `reload()` re-runs it manually.
export function useFetch(request, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: "" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: "" }));
    request()
      .then((res) => !cancelled && setState({ data: res.data.data, loading: false, error: "" }))
      .catch((err) => !cancelled && setState({ data: null, loading: false, error: getErrorMessage(err) }));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, attempt]);

  const reload = useCallback(() => setAttempt((a) => a + 1), []);
  const setData = useCallback((updater) => setState((s) => ({ ...s, data: updater(s.data) })), []);

  return { ...state, reload, setData };
}
