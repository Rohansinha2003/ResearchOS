import React from 'react';
import './FeatureModal.css';

interface FeatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function FeatureModal({ isOpen, onClose, title, children }: FeatureModalProps) {
  if (!isOpen) return null;

  return (
    <div className="feature-modal-overlay" onClick={onClose}>
      <div className="feature-modal" onClick={e => e.stopPropagation()}>
        <div className="feature-modal-header">
          <h2>{title}</h2>
          <button className="feature-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="feature-modal-content">
          {children}
        </div>
      </div>
    </div>
  );
}
