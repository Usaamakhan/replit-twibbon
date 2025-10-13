"use client";

import { useNotifications } from '@/hooks/useNotifications';
import NotificationToast from './NotificationToast';

export default function NotificationProvider({ children }) {
  const { latestNotification, clearLatestNotification, markAsRead } = useNotifications();
  
  const handleClose = () => {
    if (latestNotification && !latestNotification.read) {
      markAsRead(latestNotification.id);
    }
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
