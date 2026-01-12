/**
 * Utility to fix existing users with fallback email addresses
 * This can be run manually or as a migration to update users in bulk
 */
import { getSupabase } from '../lib/supabase/client';

interface UserEmailFix {
  id: string;
  azure_user_id: string;
  current_email: string;
  suggested_email?: string;
  needs_manual_review: boolean;
}

/**
 * Identifies users with fallback email addresses that need fixing
 */
export async function identifyUsersNeedingEmailFix(): Promise<UserEmailFix[]> {
  const supabase = getSupabase();
  
  try {
    console.log('🔍 Identifying users with fallback email addresses...');
    
    const { data: users, error } = await supabase
      .from('users')
      .select('id, azure_user_id, email, name')
      .or('email.eq.user@domain.com,email.like.user-%@missing-email.local');

    if (error) {
      console.error('❌ Error fetching users:', error);
      return [];
    }

    const usersNeedingFix: UserEmailFix[] = users.map(user => {
      let suggestedEmail: string | undefined;
      let needsManualReview = true;

      // Try to extract email from azure_user_id if it looks like an email
      if (user.azure_user_id && user.azure_user_id.includes('@')) {
        suggestedEmail = user.azure_user_id;
        needsManualReview = false;
      }

      return {
        id: user.id,
        azure_user_id: user.azure_user_id,
        current_email: user.email,
        suggested_email: suggestedEmail,
        needs_manual_review: needsManualReview
      };
    });

    console.log(`📊 Found ${usersNeedingFix.length} users with fallback emails:`, {
      total: usersNeedingFix.length,
      autoFixable: usersNeedingFix.filter(u => !u.needs_manual_review).length,
      needsReview: usersNeedingFix.filter(u => u.needs_manual_review).length
    });

    return usersNeedingFix;
  } catch (error) {
    console.error('❌ Error identifying users:', error);
    return [];
  }
}

/**
 * Generates a report of users with email issues
 */
export async function generateEmailFixReport(): Promise<string> {
  const usersNeedingFix = await identifyUsersNeedingEmailFix();
  
  let report = `# User Email Fix Report\n\n`;
  report += `Generated: ${new Date().toISOString()}\n\n`;
  report += `## Summary\n`;
  report += `- Total users with fallback emails: ${usersNeedingFix.length}\n`;
  report += `- Auto-fixable: ${usersNeedingFix.filter(u => !u.needs_manual_review).length}\n`;
  report += `- Need manual review: ${usersNeedingFix.filter(u => u.needs_manual_review).length}\n\n`;

  if (usersNeedingFix.length === 0) {
    report += `✅ No users found with fallback email addresses!\n`;
    return report;
  }

  report += `## Auto-Fixable Users\n`;
  const autoFixable = usersNeedingFix.filter(u => !u.needs_manual_review);
  if (autoFixable.length > 0) {
    report += `| Azure User ID | Current Email | Suggested Email |\n`;
    report += `|---------------|---------------|----------------|\n`;
    autoFixable.forEach(user => {
      report += `| ${user.azure_user_id} | ${user.current_email} | ${user.suggested_email} |\n`;
    });
  } else {
    report += `No auto-fixable users found.\n`;
  }

  report += `\n## Users Needing Manual Review\n`;
  const needsReview = usersNeedingFix.filter(u => u.needs_manual_review);
  if (needsReview.length > 0) {
    report += `| Azure User ID | Current Email | Notes |\n`;
    report += `|---------------|---------------|-------|\n`;
    needsReview.forEach(user => {
      report += `| ${user.azure_user_id} | ${user.current_email} | Requires manual investigation |\n`;
    });
  } else {
    report += `No users need manual review.\n`;
  }

  report += `\n## Next Steps\n`;
  report += `1. Review the auto-fixable users and run \`fixAutoFixableUserEmails()\` if they look correct\n`;
  report += `2. For users needing manual review, investigate their Azure AD profiles\n`;
  report += `3. Users will also be automatically fixed when they log in next time\n`;

  return report;
}

/**
 * Automatically fixes users where we can confidently determine the correct email
 */
export async function fixAutoFixableUserEmails(dryRun: boolean = true): Promise<void> {
  const supabase = getSupabase();
  const usersNeedingFix = await identifyUsersNeedingEmailFix();
  const autoFixable = usersNeedingFix.filter(u => !u.needs_manual_review && u.suggested_email);

  if (autoFixable.length === 0) {
    console.log('✅ No auto-fixable users found');
    return;
  }

  console.log(`🔧 ${dryRun ? 'DRY RUN: Would fix' : 'Fixing'} ${autoFixable.length} users...`);

  for (const user of autoFixable) {
    console.log(`${dryRun ? '🔍 Would update' : '📝 Updating'} user ${user.azure_user_id}:`, {
      from: user.current_email,
      to: user.suggested_email
    });

    if (!dryRun) {
      try {
        const { error } = await supabase
          .from('users')
          .update({
            email: user.suggested_email,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);

        if (error) {
          console.error(`❌ Failed to update user ${user.azure_user_id}:`, error);
        } else {
          console.log(`✅ Updated user ${user.azure_user_id} email`);
        }
      } catch (error) {
        console.error(`❌ Error updating user ${user.azure_user_id}:`, error);
      }
    }
  }

  if (dryRun) {
    console.log('🔍 Dry run complete. Run with dryRun=false to apply changes.');
  } else {
    console.log('✅ Email fix complete!');
  }
}

/**
 * Console helper functions for easy use in browser dev tools
 */
export const emailFixUtils = {
  // Generate and log a report
  async report() {
    const report = await generateEmailFixReport();
    console.log(report);
    return report;
  },

  // Identify users needing fixes
  async identify() {
    return await identifyUsersNeedingEmailFix();
  },

  // Dry run of fixes
  async dryRun() {
    return await fixAutoFixableUserEmails(true);
  },

  // Actually apply fixes
  async fix() {
    return await fixAutoFixableUserEmails(false);
  }
};

// Make it available globally for console use
if (typeof window !== 'undefined') {
  (window as any).emailFixUtils = emailFixUtils;
}