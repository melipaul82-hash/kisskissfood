import type { Locale } from "./config";
import de from "./de";
import en from "./en";
import fr, { type Dictionary } from "./fr";

const dictionaries: Record<Locale, Dictionary> = { de, fr, en };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export type { Dictionary };
