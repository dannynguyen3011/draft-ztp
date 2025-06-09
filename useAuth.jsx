import React, { useState, useEffect, useRef } from "react";
import Keycloak from "keycloak-js";

// const useAuth = () => {
//   const [isLogin, setLogin] = useState(true);
//   return isLogin;
// };

const client = new Keycloak({
  // url: import.meta.env.VITE_KEYCLOAK_URL,
  // realm: import.meta.env.VITE_KEYCLOAK_REALM,
  // clientId: import.meta.env.VITE_KEYCLOAK_CLIENT,
  url: "http://localhost:8080",
  realm: "demo",
  clientId: "demo-client",
});

const useAuth = () => {
  const isRun = useRef(false);
  const [token, setToken] = useState(null);
  const [isLogin, setLogin] = useState(false);

  useEffect(() => {
    if (isRun.current) return;

    isRun.current = true;
    client
      .init({
        onLoad: "check-sso",
        checkLoginIframe: false,
      })
      .then((res) => {
        setLogin(res);
        setToken(client.token);
      });
  }, []);

  return isLogin;
  return [isLogin, token]; 
};

export default useAuth;