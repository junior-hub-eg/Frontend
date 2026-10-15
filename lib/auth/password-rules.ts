/**
 * The one password rule of the platform (backend: Application/Auth/PasswordRules.cs):
 * at least 8 characters, letters and numbers, and a special character.
 */
import { z } from "zod";

export const PASSWORD_RULES = [
  { id: "length", label: "At Least 8 Characters", test: (p: string) => p.length >= 8 },
  { id: "mix", label: "Use Letters & Numbers", test: (p: string) => /\p{L}/u.test(p) && /\d/.test(p) },
  { id: "special", label: "Include Special Characters (! ^ # @ $)", test: (p: string) => /[^\p{L}\p{N}]/u.test(p) },
] as const;

export const passwordSchema = z
  .string()
  .min(1, "Password is required")
  .max(128, "Password is too long")
  .refine(PASSWORD_RULES[0].test, "Use at least 8 characters")
  .refine(PASSWORD_RULES[1].test, "Use letters and numbers")
  .refine(PASSWORD_RULES[2].test, "Include a special character, for example ! @ # $");
