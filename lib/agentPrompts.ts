import { PLAIN_LANGUAGE_RULES } from "@/lib/labValueNames";

export { PLAIN_LANGUAGE_RULES };

export function withPlainLanguageRules(instructions: string): string {
  return `${instructions.trim()}\n\n${PLAIN_LANGUAGE_RULES}`;
}
