const ACTIVE_CHAT_KEY = 'apnagpt_active_chat_id';

/**
 * Get the last active chat ID from localStorage
 */
export function getSavedActiveChatId() {
  try {
    return localStorage.getItem(ACTIVE_CHAT_KEY) || null;
  } catch (err) {
    console.error('Failed to get active chat ID from storage:', err);
    return null;
  }
}

/**
 * Save active chat ID to localStorage
 */
export function saveActiveChatId(chatId) {
  try {
    if (chatId) {
      localStorage.setItem(ACTIVE_CHAT_KEY, chatId);
    } else {
      localStorage.removeItem(ACTIVE_CHAT_KEY);
    }
  } catch (err) {
    console.error('Failed to save active chat ID to storage:', err);
  }
}
