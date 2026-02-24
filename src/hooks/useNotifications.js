import { useState, useEffect, useCallback } from "react";
import { notificationApi } from "../services/notificationApi";

export function useNotificationPreferences(userId = "default") {
  const [prefs, setPrefs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const data = await notificationApi.getPreferences(userId);
      if (!cancelled) {
        setPrefs(data);
        setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [userId]);

  const save = useCallback(async (updates) => {
    setSaving(true);
    const merged = { ...prefs, ...updates, userId };
    const result = await notificationApi.savePreferences(merged);
    setPrefs(result);
    setSaving(false);
    return result;
  }, [prefs, userId]);

  return { prefs, loading, saving, save };
}

export function useAlertHistory(limit = 50) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await notificationApi.getAlertHistory(limit);
    setAlerts(data);
    setLoading(false);
  }, [limit]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { alerts, loading, refresh };
}

export function useAlertRules() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await notificationApi.getAlertRules();
    setRules(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addRule = useCallback(async (rule) => {
    const created = await notificationApi.addAlertRule(rule);
    setRules((prev) => [...prev, created]);
    return created;
  }, []);

  const deleteRule = useCallback(async (ruleId) => {
    await notificationApi.deleteAlertRule(ruleId);
    setRules((prev) => prev.filter((r) => r.id !== ruleId));
  }, []);

  return { rules, loading, refresh, addRule, deleteRule };
}
