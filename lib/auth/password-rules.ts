/**
 * The one password rule of the platform (backend: Application/Auth/PasswordRules.cs):
 * at least 8 characters, letters and numbers, and a special character.
 */
import { z } from "zod";
import { tk } from "@/lib/i18n/translate";

export const PASSWORD_RULES = [
  { id: "length", label: tk("At Least 8 Characters"), test: (p: string) => p.length >= 8 },
  { id: "mix", label: tk("Use Letters & Numbers"), test: (p: string) => /\p{L}/u.test(p) && /\d/.test(p) },
  { id: "special", label: tk("Include Special Characters (! ^ # @ $)"), test: (p: string) => /[^\p{L}\p{N}]/u.test(p) },
] as const;

export const passwordSchema = z
  .string()
  .min(1, tk("Password is required"))
  .max(128, tk("Password is too long"))
  .refine(PASSWORD_RULES[0].test, tk("Use at least 8 characters"))
  .refine(PASSWORD_RULES[1].test, tk("Use letters and numbers"))
  .refine(PASSWORD_RULES[2].test, tk("Include a special character, for example ! @ # $"));
