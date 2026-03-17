import { apiConfig } from "../config/apiConfig";

const API_SUBSCRIPTION_KEY = import.meta.env.VITE_AZURE_APIM_SUBSCRIPTION_KEY || "5881e307d1704219ae2e3759e6c5f1f0";

// ── Type Definitions ────────────────────────────────────────────────────

export interface NotificationTemplate {
  templateId: number;
  templateName: string;
  templateType: string;
  templatePayload: string;
  templateDescription: string;
  templateStatus: number;
  createdOn: string;
  modifiedOn: string;
}

export interface EventNotification {
  eventNotificationId: number;
  eventId: number;
  templateId: number;
  template: NotificationTemplate;
  notificationType: string;
  notificationLevel: string;
  isActive: number;
}

export interface NotificationEvent {
  eventId: number;
  eventDescription: string;
  eventName: string;
  createdOn: string;
  modifiedOn: string;
  eventNotifications: EventNotification[];
}

export interface NotificationSearchResponse {
  records: NotificationEvent[];
  noOfRows: number;
  totalRecords: number;
}

export interface GroupedNotification {
  eventId: number;
  eventDescription: string;
  eventName: string;
  notifications: {
    eventNotificationId: number;
    notificationType: string;
    notificationLevel: string;
    isActive: boolean;
    templateName: string;
  }[];
}

// ── API Service Functions ────────────────────────────────────────────

/**
 * Fetch all available notifications from the API
 */
export async function fetchNotificationEvents(accessToken: string): Promise<NotificationEvent[]> {
  try {
    
    const payload = {
      isActive: null,
      pageOffset: 0,
      pageSize: 1000, // High page size to fetch all notifications
      event: null,
      templateId: null,
    };

    const response = await fetch(apiConfig.endpoints.notificationEventsSearch, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        "Ocp-Apim-Subscription-Key": API_SUBSCRIPTION_KEY,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data: NotificationSearchResponse = await response.json();
    return data.records || [];
  } catch (error) {
    console.error("Failed to fetch notification events:", error);
    throw error;
  }
}

/**
 * Group notifications by event for easier UI handling
 * Each event shows its notifications (SMS, Email, In-App) in a single row
 */
export function flattenNotifications(events: NotificationEvent[]): GroupedNotification[] {
  return events.map((event) => ({
    eventId: event.eventId,
    eventDescription: event.eventDescription,
    eventName: event.eventName,
    notifications: event.eventNotifications.map((notification) => ({
      eventNotificationId: notification.eventNotificationId,
      notificationType: notification.notificationType,
      notificationLevel: notification.notificationLevel,
      isActive: notification.isActive === 1,
      templateName: notification?.template?.templateName ?? null,
    })),
  }));
}

/**
 * Get a readable label for notification type
 */
export function getNotificationTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    email: "Email",
    sms: "SMS",
    inapp: "In-App",
    Email: "Email",
    SMS: "SMS",
    InApp: "In-App",
    EMAIL: "Email",
    INAPP: "In-App",
  };
  return labels[type] || type;
}

/**
 * Update notification event status
 * @param eventId - The event ID to update
 * @param eventName - Event name
 * @param eventDescription - Event description
 * @param eventNotifications - Array of notifications to update
 * @param accessToken - Bearer token for authentication
 */
export async function updateEventNotificationStatus(
  eventId: number,
  eventName: string,
  eventDescription: string,
  eventNotifications: Array<{
    templateId: number;
    notificationType: string;
    notificationLevel: string;
    isActive: boolean;
  }>,
  accessToken: string
): Promise<void> {
  try {
    const payload = {
      eventName,
      eventDescription,
      eventNotifications: eventNotifications.map((n) => ({
        templateId: n.templateId,
        notificationType: n.notificationType,
        notificationLevel: n.notificationLevel,
        isActive: n.isActive ? 1 : 0,
      })),
    };

    const response = await fetch(
      `https://ndoms-dev-apim.azure-api.net/notification/dev/v1/events/updateEventandTemplate/${eventId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          "Ocp-Apim-Subscription-Key": API_SUBSCRIPTION_KEY,
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to update notification: ${response.status}`);
    }
  } catch (error) {
    console.error("Failed to update event notification status:", error);
    throw error;
  }
}

