// src/constants/analyticsEvents.ts

/**
 * PostHog Analytics Event Names
 *
 * Naming convention: {category}_{entity}_{action}
 * - Use snake_case
 * - Use past tense for completed actions
 * - Group by feature/domain
 */

// ============================================
// AUTHENTICATION EVENTS
// ============================================
export const AUTH_EVENTS = {
  SIGNED_UP: 'auth_user_signed_up',
  SIGNED_IN: 'auth_user_signed_in',
  SIGN_IN_FAILED: 'auth_user_sign_in_failed',
  SIGNED_OUT: 'auth_user_signed_out',
} as const;

// ============================================
// POST EVENTS
// ============================================
export const POST_EVENTS = {
  CREATED: 'post_created',
  LIKED: 'post_liked',
  UNLIKED: 'post_unliked',
  SHARED: 'post_shared',
  DELETED: 'post_deleted',
  MEDIA_VIEWED: 'post_media_viewed',
  VIDEO_PLAYED: 'post_video_played',
  COMMENTS_OPENED: 'post_comments_opened',
  PROFILE_CLICKED: 'post_profile_clicked',
  CHALLENGE_CLICKED: 'post_challenge_clicked',
  CREATE_MODAL_OPENED: 'post_create_modal_opened',
  MEDIA_ATTACHED: 'post_media_attached',
} as const;

// ============================================
// COMMENT EVENTS
// ============================================
export const COMMENT_EVENTS = {
  CREATED: 'comment_created',
  LIKED: 'comment_liked',
  UNLIKED: 'comment_unliked',
  DELETED: 'comment_deleted',
  PROFILE_CLICKED: 'comment_profile_clicked',
} as const;

// ============================================
// CHALLENGE EVENTS
// ============================================
export const CHALLENGE_EVENTS = {
  VIEWED: 'challenge_viewed',
  COMPLETED: 'challenge_completed',
  SHARE_MODAL_OPENED: 'challenge_share_modal_opened',
  SHARED: 'challenge_shared',
  SHARE_SKIPPED: 'challenge_share_skipped',
  PATRIZIO_EXAMPLE_CLICKED: 'challenge_patrizio_example_clicked',
} as const;

// ============================================
// PROFILE EVENTS
// ============================================
export const PROFILE_EVENTS = {
  VIEWED: 'profile_viewed',
  EDITED: 'profile_edited',
  PICTURE_UPDATED: 'profile_picture_updated',
  INSTAGRAM_CLICKED: 'profile_instagram_clicked',
  ACCOUNT_DELETED: 'profile_account_deleted',
} as const;

// ============================================
// FEED EVENTS
// ============================================
export const FEED_EVENTS = {} as const;

// ============================================
// UI EVENTS
// ============================================
export const UI_EVENTS = {
  NOTIFICATIONS_OPENED: 'ui_notifications_opened',
  MENU_OPENED: 'ui_menu_opened',
  FEEDBACK_MODAL_OPENED: 'ui_feedback_modal_opened',
  FEEDBACK_SUBMITTED: 'ui_feedback_submitted',
} as const;

// ============================================
// NAVIGATION/SCREEN EVENTS
// ============================================
export const SCREEN_EVENTS = {
  VIEWED: 'screen_viewed',
} as const;

// ============================================
// USER PROPERTY KEYS (for setUserProperties)
// ============================================
export const USER_PROPERTIES = {
  EMAIL: 'email',
  USERNAME: 'username',
  DISPLAY_NAME: 'display_name',
  IS_ADMIN: 'is_admin',
  CHALLENGES_COMPLETED: 'challenges_completed',
  TOTAL_POSTS: 'total_posts',
  STREAK_COUNT: 'streak_count',
  LAST_ACTIVE: 'last_active',
  HAS_PROFILE_PICTURE: 'has_profile_picture',
  HAS_INSTAGRAM: 'has_instagram',
} as const;

// Combined export for convenience
export const ANALYTICS_EVENTS = {
  AUTH: AUTH_EVENTS,
  POST: POST_EVENTS,
  COMMENT: COMMENT_EVENTS,
  CHALLENGE: CHALLENGE_EVENTS,
  PROFILE: PROFILE_EVENTS,
  FEED: FEED_EVENTS,
  UI: UI_EVENTS,
  SCREEN: SCREEN_EVENTS,
} as const;
