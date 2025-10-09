"use client";

import { useFCM } from '@/hooks/useFCM';
import NotificationToast from './NotificationToast';

export default function NotificationProvider({ children }) {
  const { foregroundNotification, clearNotification } = useFCM();
  
  return (
    <>
      {children}
      
      {foregroundNotification && (
        <NotificationToast 
          notification={foregroundNotification}
          onClose={clearNotification}
        />
      )}
    </>
  );
}
