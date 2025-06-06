import { useCallback, useEffect, useState } from "react";
import ConnectSDK, { SDK_EVENT } from "@useparagon/connect";

const paragon = new ConnectSDK({
  ZEUS_PUBLIC_URL: "https://zeus.useparagon.com",
  DASHBOARD_PUBLIC_URL: "https://dashboard.useparagon.com",
  CONNECT_PUBLIC_URL: "https://connect.useparagon.com",
  DASHBOARD_PUBLIC_URL: "https://dashboard.useparagon.com",
  PASSPORT_PUBLIC_URL: "https://passport.useparagon.com",
  WORKER_PROXY_PUBLIC_URL: "https://proxy.useparagon.com",
});

if (typeof window !== "undefined") {
  window.paragon = paragon;
}

export default function useParagon(paragonUserToken) {
  const [user, setUser] = useState(paragon.getUser());
  const [error, setError] = useState();

  const updateUser = useCallback(() => {
    const authedUser = paragon.getUser();
    if (authedUser.authenticated) {
      setUser({ ...authedUser });
    }
  }, []);

  // Listen for account state changes
  useEffect(() => {
    paragon.subscribe(SDK_EVENT.ON_INTEGRATION_INSTALL, updateUser);
    paragon.subscribe("onIntegrationUninstall", updateUser);
    return () => {
      paragon.unsubscribe("onIntegrationInstall", updateUser);
      paragon.unsubscribe("onIntegrationUninstall", updateUser);
    };
  }, []);

  useEffect(() => {
    if (!error) {
      paragon
        .authenticate(
          process.env.NEXT_PUBLIC_PARAGON_PROJECT_ID,
          paragonUserToken
        )
        .then(() => {
          const authedUser = paragon.getUser();
          if (authedUser.authenticated) {
            setUser(authedUser);
          }
        })
        .catch(setError);
    }
  }, [error, paragonUserToken]);

  return {
    paragon,
    user,
    error,
    updateUser,
  };
}
