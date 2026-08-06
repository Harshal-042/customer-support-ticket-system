import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';
import './ToastNotification.css';

interface Props {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
}

export const ToastNotification: React.FC<Props> = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast-notification toast-${type}`}>
      <div className="toast-content">
        {type === 'success' ? (
          <CheckCircle className="toast-icon" size={18} />
        ) : (
          <AlertCircle className="toast-icon" size={18} />
        )}
        <span className="toast-message">{message}</span>
      </div>
      <button className="toast-close" onClick={onClose} aria-label="Close notification">
        <X size={16} />
      </button>
    </div>
  );
};
