import type { MetadataRoute } from "next";
import { locales } from "@/i18n/config";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/impressum", "/datenschutz"];
  return locales.flatMap((l) =>
    pages.map((p) => ({
      url: `${site.url}/${l}${p}`,
      changeFrequency: "monthly" as const,
      priority: p === "" ? 1 : 0.3,
    }))
  );
}
