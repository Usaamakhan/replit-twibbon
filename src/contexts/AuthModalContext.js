'use client';

import { createContext, useContext } from 'react';

const AuthModalContext = createContext();

export const useAuthModal = () => {
  const context = useContext(AuthModalContext);
  if (!context) {
    // Provide safe defaults when context is not available
    return {
      openSignInModal: () => console.warn('AuthModal context not available'),
      openSignUpModal: () => console.warn('AuthModal context not available'),
      openForgotPasswordModal: () => console.warn('AuthModal context not available'),
      closeModal: () => console.warn('AuthModal context not available')
    };
  }
  return context;
};

export const AuthModalProvider = ({ children, value }) => {
  return (
    <AuthModalContext.Provider value={value}>
      {children}
    </AuthModalContext.Provider>
  );
};