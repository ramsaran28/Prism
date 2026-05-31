import type { AgentId } from "@/lib/types";

export const AGENT_MIN_MS: Record<AgentId, number> = {
  scan: 1800,
  risk: 1400,
  explain: 2000,
  translate: 1000,
  guide: 1200,
  score: 1800,
};

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withMinimumDelay<T>(
  ms: number,
  fn: () => Promise<T>
): Promise<T> {
  const [result] = await Promise.all([fn(), delay(ms)]);
  return result;
}
