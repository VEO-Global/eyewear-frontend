import { toast } from "react-toastify";
import store from "../redux/store";
import { addNotification } from "../redux/notification/notificationSlice";

function pushToast(type, message, options) {
  store.dispatch(
    addNotification({
      type,
      message,
    })
  );

  toast[type](message, options);
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
