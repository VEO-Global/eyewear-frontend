import { api } from "./api";

export const notificationService = {
  getNotifications() {
    return api.get("/notifications").then((response) => response.data);
  },
  getUnreadCount() {
    return api.get("/notifications/unread-count").then((response) => response.data);
  },
  markAsRead(id) {
    return api.patch(`/notifications/${id}/read`).then((response) => response.data);
  },
  markAllAsRead() {
    return api.patch("/notifications/read-all").then((response) => response.data);
  },
  removeNotification(id) {
    return api.delete(`/notifications/${id}`).then((response) => response.data);
  },
};

export default notificationService;
