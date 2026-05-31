import { GoogleGenerativeAI } from "@google/generative-ai";

export const FLASH_MODEL = "gemini-3.5-flash";
export const PRO_MODEL = "gemini-3.5-flash";

export function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  return new GoogleGenerativeAI(apiKey);
}

export function getFlashModel() {
  return getGenAI().getGenerativeModel({ model: FLASH_MODEL });
}

export function getProModel() {
  return getGenAI().getGenerativeModel({ model: PRO_MODEL });
}

export function parseJsonFromText<T>(text: string): T {
  const trimmed = text.trim();
  const jsonMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = jsonMatch ? jsonMatch[1].trim() : trimmed;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("No JSON object found in model response");
  }
  return JSON.parse(raw.slice(start, end + 1)) as T;
}
