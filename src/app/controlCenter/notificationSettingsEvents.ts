export const OPEN_NOTIFICATION_SETTINGS_EVENT = 'sisuplus:open-notification-settings';

export const requestNotificationSettingsOpen = () => {
  window.dispatchEvent(new CustomEvent(OPEN_NOTIFICATION_SETTINGS_EVENT));
};
