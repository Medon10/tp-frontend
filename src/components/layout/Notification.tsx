import React from 'react';
import './Notification.css';

interface NotificationProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

export const Notification: React.FC<NotificationProps> = ({ message, type, onClose }) => {
  return (
    <div className={`notification-banner ${type}`}>
      <p>{message}</p>
      <button onClick={onClose}>&times;</button>
    </div>
  );
};