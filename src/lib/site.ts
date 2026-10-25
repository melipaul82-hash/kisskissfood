/**
 * Company facts used across the site. Everything here comes from the owner.
 * Empty values are simply not displayed, so fill them in when they are known.
 */
export const site = {
  name: "Kiss Kiss Food",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://kisskissfood.site",
  owner: "Meli Paul",
  street: "Rostocker Str. 41",
  postalCode: "70376",
  city: "Stuttgart",
  country: "Deutschland",
  // Address shown on the brand material. Make sure this mailbox exists on the domain you use.
  email: "info@kisskissfood.com",
  phone: "",
  // Legal details still to be completed (Impressum): leave empty until known.
  legalForm: "", // e.g. "Einzelunternehmen"
  vatId: "", // USt-IdNr., if any
  register: "", // Handelsregister entry, if any
  socials: {
    tiktok: "",
    instagram: "",
    facebook: "",
    linkedin: "",
  },
  whatsappNumber: (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "").replace(/\D/g, ""),
} as const;

/** Link that opens a WhatsApp chat with a prefilled message, or null if no number is configured yet. */
export function whatsappLink(message: string): string | null {
  if (!site.whatsappNumber) return null;
  return `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
