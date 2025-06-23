import React from 'react';
import './ConfirmModal.css';

export default function ConfirmModal({ open, title, onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div className="confirm-overlay">
      <div className="confirm-card">
        <h3>{title}</h3>
        <div className="confirm-buttons">
          <button className="btn btn-no" onClick={onCancel}>Não</button>
          <button className="btn btn-yes" onClick={onConfirm}>Sim</button>
        </div>
      </div>
    </div>
  );
}
