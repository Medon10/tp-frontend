import React from 'react';
import './ConfirmationModal.css'; 

interface ConfirmationModalProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmButtonClass?: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirmar',
  cancelText = 'No',
  confirmButtonClass = 'btn-danger'
}) => {
  return (
    <div className="modal-backdrop">
      <div className="confirmation-modal">
        <p className="confirmation-message">{message}</p>
        <div className="confirmation-actions">
          <button className="btn btn-outline" onClick={onCancel}>
            {cancelText}
          </button>
          <button className={`btn ${confirmButtonClass}`} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};