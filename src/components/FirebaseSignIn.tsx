import React, { FC, useCallback, useEffect, useState } from "react";
import { auth } from "../lib/firebase/firebaseConfig";
import { onAuthStateChanged, getRedirectResult } from "firebase/auth";
import { redirect } from "next/navigation";

interface Props {
  config: firebaseui.auth.Config;
}

const FirebaseSignIn: FC<Props> = ({ config }) => {
  const [loading, setLoading] = useState(true);  // Estado para indicar carga
  const user = auth.currentUser;
  if (user) {
    return redirect("/drive");
  }
  const loadFirebaseui = useCallback(async () => {
    const firebaseui = await import("firebaseui");
    const firebaseUi = new firebaseui.auth.AuthUI(auth);
    firebaseUi.start("#firebaseui-auth-container", config);
  }, [config]);

  // Verifica si hay un usuario autenticado después del redirect
  useEffect(() => {
    const checkRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result && result.user) {
          console.log("User logged in via redirect:", result.user);
        }
      } catch (err) {
        console.error("Redirect login failed:", err);
      } finally {
        setLoading(false);  // Termina la carga
      }
    };

    checkRedirectResult();
  }, []);

  // Listener para cambios en el estado de autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setLoading(false);  // Termina la carga cuando hay cambio en el estado
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    loadFirebaseui();
  }, [loadFirebaseui]);

  if (loading) {
    return (
      <div className="text-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg">
        <div id="firebaseui-auth-container"></div>
    </div>
  );
};

export default FirebaseSignIn;
