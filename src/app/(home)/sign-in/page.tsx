"use client"
import React, { useEffect } from 'react';
import { auth } from '../../../lib/firebase/firebaseConfig';
import 'firebaseui/dist/firebaseui.css';
import FirebaseSignIn from '~/components/FirebaseSignIn';
import { redirect } from "next/navigation";

const HomePage = () => {
  const config = {
    signInOptions: [
      {
        provider: 'google.com', // Login con Google
        scopes: ['profile', 'email'],
      },
      // {
      //   provider: 'facebook.com', // Login con Facebook
      //   scopes: ['public_profile', 'email'],
      // },
      // 'password', // Login con email y contraseña
      // 'phone',    // Login con teléfono
    ],
    signInFlow: 'popup',         // Opciones: 'popup' o 'redirect'
    signInSuccessUrl: '/drive', // Redirección después de login exitoso
    tosUrl: '/terms-of-service',    // URL de términos de servicio
    privacyPolicyUrl: '/privacy-policy' // URL de política de privacidad
  };
  const user: any = auth.currentUser;
  if (user) {
    return redirect("/drive");
  }
  return <><FirebaseSignIn config={config} /><footer className="mt-16 text-sm text-neutral-500">
    © {new Date().getFullYear()} TerraNova Drive. All rights reserved.
  </footer></>
};

export default HomePage;
