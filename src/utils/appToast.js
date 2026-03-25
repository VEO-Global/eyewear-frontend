import { toast } from "react-toastify";
import store from "../redux/store";
import {
  addNotification,
  normalizeNotificationMessage,
} from "../redux/notification/notificationSlice";

function pushToast(type, message, options) {
  const normalizedMessage = normalizeNotificationMessage(message);

  store.dispatch(
    addNotification({
      type,
      message: normalizedMessage,
    })
  );

  toast[type](normalizedMessage, options);
}

export const appToast = {
  success(message, options) {
    pushToast("success", message, options);
  },
  error(message, options) {
    pushToast("error", message, options);
  },
  warning(message, options) {
    pushToast("warning", message, options);
  },
  info(message, options) {
    pushToast("info", message, options);
  },
};
