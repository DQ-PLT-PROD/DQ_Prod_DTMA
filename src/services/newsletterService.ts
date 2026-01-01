import { getSupabase, isSupabaseConfigured } from "../lib/supabase/client";

const EMAIL_REGEX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/i;

export async function subscribeToNewsletter(email: string, source = "footer"): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail || !EMAIL_REGEX.test(normalizedEmail)) {
    throw new Error("Please enter a valid email address.");
  }

  if (!isSupabaseConfigured()) {
    throw new Error("Subscription service is not configured. Please try again later.");
  }

  const supabase = getSupabase();

  const { error } = await supabase
    .from("newsletter_subscriptions")
    .insert({ email: normalizedEmail, source });

  if (error) {
    // 23505 = unique violation
    if ((error as any)?.code === "23505") {
      throw new Error("You're already subscribed with this email.");
    }
    throw new Error("Unable to save your subscription right now. Please try again.");
  }
}
