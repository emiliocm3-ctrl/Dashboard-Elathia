import { useState, useEffect, useCallback } from "react";
import { agentApi } from "../services/agentApi";

/**
 * Hook for fetching AI agent insights for a sector.
 * Automatically re-analyzes when sectorData changes.
 */
export function useAgentInsights(sectorId, sectorData) {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!sectorId || !sectorData) return;
    setLoading(true);
    try {
      const result = await agentApi.analyzeSector(sectorId, sectorData);
      setInsights(result);
    } catch (err) {
      console.error("Agent insight fetch failed:", err);
    } finally {
      setLoading(false);
    }
  }, [sectorId, sectorData]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { insights, loading, refresh };
}

/**
 * Hook for the conversational agent (chat).
 * Manages message history within the session.
 */
export function useAgentChat(context = {}) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = useCallback(async (prompt) => {
    const userMsg = { role: "user", content: prompt, timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const result = await agentApi.chat(prompt, context);
      const assistantMsg = { role: "assistant", content: result.response, model: result.model, timestamp: result.timestamp };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const errorMsg = { role: "assistant", content: "Error al obtener respuesta del agente.", timestamp: new Date().toISOString() };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  }, [context]);

  const clearHistory = useCallback(() => setMessages([]), []);

  return { messages, loading, sendMessage, clearHistory };
}
