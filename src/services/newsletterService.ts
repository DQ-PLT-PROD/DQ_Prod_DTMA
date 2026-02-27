import { getSupabase, isSupabaseConfigured } from '../lib/supabase/client';

/**
 * Subscribe an email to the newsletter
 * @param email - The email address to subscribe
 * @throws Error if email is invalid, already subscribed, or database error
 */
export async function subscribeToNewsletter(email: string): Promise<void> {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
        throw new Error('Please enter a valid email address.');
    }

    // Check Supabase configuration
    if (!isSupabaseConfigured()) {
        throw new Error('Newsletter service is currently unavailable. Please try again later.');
    }

    const supabase = getSupabase();
    const normalizedEmail = email.trim().toLowerCase();

    const { error } = await supabase
        .from('newsletter_subscriptions')
        .insert({
            email: normalizedEmail,
            source: 'coming_soon_page'
        });

    if (error) {
        // Handle duplicate email (unique constraint violation)
        if (error.code === '23505') {
            throw new Error('This email is already subscribed to our newsletter.');
        }
        console.error('Newsletter subscription error:', error);
        throw new Error('Unable to subscribe right now. Please try again later.');
    }
}
