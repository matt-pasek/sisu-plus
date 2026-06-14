import type { NotificationDeliveryMode } from '@/app/types/NotificationDeliveryMode.type';
import type { NotificationType } from '@/app/types/NotificationType.type';

export type NotificationSource = 'moodle' | 'sisu';

export interface CachedMoodleDeadline {
  course: string | null;
  dueAt: string;
  id: string;
  title: string;
}

export interface CachedRegistrationEvent {
  closesAt: string | null;
  courseId: string;
  enrolled: boolean;
  id: string;
  name: string;
  opensAt: string | null;
}

export interface NotificationCache {
  moodle: {
    deadlines: CachedMoodleDeadline[];
    lastFetch: number | null;
  };
  scheduledAlarms: string[];
  sisu: {
    lastSync: number | null;
    registrations: CachedRegistrationEvent[];
  };
  unread: QueuedInAppNotification[];
}

export interface NotificationPayload {
  body: string;
  eventId: string;
  source: NotificationSource;
  title: string;
  type: NotificationType;
}

export interface QueuedInAppNotification extends NotificationPayload {
  createdAt: number;
  id: string;
  read: boolean;
}

export interface NotificationDeliveryDecision {
  desktopSent: boolean;
  mode: NotificationDeliveryMode;
  visibleTabCount: number;
}

export interface SisuNotificationSyncPayload {
  registrations: CachedRegistrationEvent[];
  syncedAt?: number;
}
