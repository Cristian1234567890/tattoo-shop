/**
 * Avatar Resolution Utility
 * Ensures Google OAuth profile pictures and custom uploads are permanent
 * and NEVER overwritten by project placeholder defaults.
 */

export const isGenericPlaceholder = (url?: string | null): boolean => {
  if (!url || typeof url !== 'string') return true;
  const lower = url.toLowerCase().trim();
  return (
    lower === '' ||
    lower.includes('tatto-default-profile.png') ||
    lower.includes('gb tattoo.jpg') ||
    lower.includes('tattoo machine rotary.png')
  );
};

export const getEffectiveUserAvatar = (user: any): string => {
  if (!user) return '';

  // 1. Check local override only if it is NOT a generic placeholder
  if (typeof window !== 'undefined') {
    const override = localStorage.getItem('user_avatar_override') || '';
    if (override && !isGenericPlaceholder(override)) {
      return override;
    }
    // Clean up stale generic placeholders from localStorage
    if (override && isGenericPlaceholder(override)) {
      localStorage.removeItem('user_avatar_override');
    }
  }

  // 2. Google OAuth provider picture from identities (highest fidelity)
  const identityPic =
    user?.identities?.[0]?.identity_data?.picture ||
    user?.identities?.[0]?.identity_data?.avatar_url ||
    user?.app_metadata?.provider_avatar;

  if (identityPic && !isGenericPlaceholder(identityPic)) {
    return identityPic;
  }

  // 3. User metadata pictures
  const meta = user?.user_metadata || {};
  const metaCandidates = [
    meta.picture,
    meta.avatar_url,
    meta.profile,
    meta.avatar,
    user.avatar_url,
    user.picture,
    user.profile,
  ];

  for (const candidate of metaCandidates) {
    if (candidate && typeof candidate === 'string' && !isGenericPlaceholder(candidate)) {
      return candidate;
    }
  }

  // 4. If all else fails, return empty so consumer component can render fallback initial/icon
  return '';
};
