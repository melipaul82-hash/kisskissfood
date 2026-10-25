// Public values of the Kiss Kiss Food Supabase project. The publishable key is meant to be in the browser:
// what it can do is limited by the Row Level Security rules in the database.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://rsieepuhkocoklhfljmj.supabase.co";
export const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_OLnitf4aLu-u9BOPnNw7-Q_Idxl5t3p";
