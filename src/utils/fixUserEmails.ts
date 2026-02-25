/**
 * Utility to fix existing users with fallback email addresses
 * This can be run manually or as a migration to update users in bulk
 *
 * Usage (browser dev tools console):
 *   emailFixUtils.report()    — generate a report of affected users
 *   emailFixUtils.dryRun()    — preview changes without applying
 *   emailFixUtils.fix()       — apply changes
 */
import { getSupabase } from '../lib/supabase/client';

interface UserEmailFix {
  id: string;
  azure_user_id: string;
  current_email: string;
  suggested_email?: string;
  needs_manual_review: boolean;
}

async function identifyUsersNeedingEmailFix(): Promise<UserEmailFix[]> {
  const supabase = getSupabase();

  try {
    console.log('🔍 Identifying users with fallback email addresses...');

    const { data: users, error } = await supabase
      .from('users')
      .select('id, azure_user_id, email, name')
      .or('email.eq.user@domain.com,email.like.user-%@temp.com,email.like.user-%@missing-email.local');

    if (error) {
      console.error('❌ Error fetching users:', error);
      return [];
    }

    const usersNeedingFix: UserEmailFix[] = (users ?? []).map(user => {
      let suggestedEmail: string | undefined;
      let needsManualReview = true;

      // If azure_user_id looks like an email, use it as suggested email
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

    console.log(`📊 Found ${usersNeedingFix.length} users with fallback emails`, {
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

async function generateEmailFixReport(): Promise<string> {
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

  const autoFixable = usersNeedingFix.filter(u => !u.needs_manual_review);
  report += `## Auto-Fixable Users\n`;
  if (autoFixable.length > 0) {
    report += `| Azure User ID | Current Email | Suggested Email |\n`;
    report += `|---------------|---------------|-----------------|\n`;
    autoFixable.forEach(user => {
      report += `| ${user.azure_user_id} | ${user.current_email} | ${user.suggested_email} |\n`;
    });
  } else {
    report += `None.\n`;
  }

  const needsReview = usersNeedingFix.filter(u => u.needs_manual_review);
  report += `\n## Users Needing Manual Review\n`;
  if (needsReview.length > 0) {
    report += `| Azure User ID | Current Email | Notes |\n`;
    report += `|---------------|---------------|-------|\n`;
    needsReview.forEach(user => {
      report += `| ${user.azure_user_id} | ${user.current_email} | Requires manual investigation |\n`;
    });
  } else {
    report += `None.\n`;
  }

  report += `\n## Next Steps\n`;
  report += `1. Review auto-fixable users and run \`emailFixUtils.fix()\` if they look correct\n`;
  report += `2. For users needing manual review, investigate their Azure AD profiles\n`;
  report += `3. Users will also be automatically updated on next login\n`;

  return report;
}

async function fixAutoFixableUserEmails(dryRun = true): Promise<void> {
  const supabase = getSupabase();
  const usersNeedingFix = await identifyUsersNeedingEmailFix();
  const autoFixable = usersNeedingFix.filter(u => !u.needs_manual_review && u.suggested_email);

  if (autoFixable.length === 0) {
    console.log('✅ No auto-fixable users found');
    return;
  }

  console.log(`🔧 ${dryRun ? 'DRY RUN — would fix' : 'Fixing'} ${autoFixable.length} users...`);

  for (const user of autoFixable) {
    console.log(`${dryRun ? '🔍 Would update' : '📝 Updating'} user ${user.azure_user_id}:`, {
      from: user.current_email,
      to: user.suggested_email
    });

    if (!dryRun) {
      try {
        const { error } = await supabase
          .from('users')
          .update({ email: user.suggested_email, updated_at: new Date().toISOString() })
          .eq('id', user.id);

        if (error) {
          console.error(`❌ Failed to update user ${user.azure_user_id}:`, error);
        } else {
          console.log(`✅ Updated user ${user.azure_user_id}`);
        }
      } catch (error) {
        console.error(`❌ Error updating user ${user.azure_user_id}:`, error);
      }
    }
  }

  if (dryRun) {
    console.log('🔍 Dry run complete. Run emailFixUtils.fix() to apply changes.');
  } else {
    console.log('✅ Email fix complete!');
  }
}

export const emailFixUtils = {
  async report() {
    const report = await generateEmailFixReport();
    console.log(report);
    return report;
  },
  async identify() {
    return await identifyUsersNeedingEmailFix();
  },
  async dryRun() {
    return await fixAutoFixableUserEmails(true);
  },
  async fix() {
    return await fixAutoFixableUserEmails(false);
  }
};

// Expose globally for easy browser console access
if (typeof window !== 'undefined') {
  (window as any).emailFixUtils = emailFixUtils;
}
