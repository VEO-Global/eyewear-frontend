import { useEffect } from "react";
import { useDispatch } from "react-redux";
import AppRouter from "./router/AppRouter";
import { fetchProfile, logout, restoreSessionFromToken } from "./redux/auth/authSlice";
import { fetchCart } from "./redux/cart/cartSlice";
import { fetchFavorites } from "./redux/favorites/favoriteSlice";
import { fetchNotifications } from "./redux/notification/notificationSlice";
import { UNAUTHORIZED_EVENT, getAccessToken } from "./services/api";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = getAccessToken();

    if (!token) {
      return undefined;
    }

    dispatch(restoreSessionFromToken(token));
    dispatch(fetchProfile());
    dispatch(fetchCart());
    dispatch(fetchFavorites());
    dispatch(fetchNotifications());

    return undefined;
  }, [dispatch]);

  useEffect(() => {
    function handleUnauthorized() {
      dispatch(logout());
      window.location.href = "/auth/login";
    }

    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);

    return () => {
      window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    };
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <AppRouter />
    </div>
  );
}

export default App;
