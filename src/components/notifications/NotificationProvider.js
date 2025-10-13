"use client";

import { useNotifications } from '@/hooks/useNotifications';
import NotificationToast from './NotificationToast';

export default function NotificationProvider({ children }) {
  const { latestNotification, clearLatestNotification } = useNotifications();
  
  const handleClose = () => {
    clearLatestNotification();
  };
  
  return (
    <>
      {children}
      
      {latestNotification && (
        <NotificationToast 
          notification={latestNotification}
          onClose={handleClose}
        />
      )}
    </>
  );
}
