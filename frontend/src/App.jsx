import { useEffect, useState } from "react";
import Login from "./Login";
import Stock from "./Stock";
import { request, getToken, setToken, clearToken } from "./api";

export default function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      if (getToken()) {
        try {
          setUser(await request("/auth/me"));
        } catch {
          clearToken();
        }
      }
      setChecking(false);
    }

    restoreSession();

    const onExpired = () => setUser(null);
    window.addEventListener("auth-expired", onExpired);
    return () => window.removeEventListener("auth-expired", onExpired);
  }, []);

  function handleAuth({ token, user }) {
    setToken(token);
    setUser(user);
  }

  function handleLogout() {
    clearToken();
    setUser(null);
  }

  if (checking) return <main><p>Chargement...</p></main>;
  if (!user) return <Login onAuth={handleAuth} />;
  return <Stock user={user} onLogout={handleLogout} />;
}