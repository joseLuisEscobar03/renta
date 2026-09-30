import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, footer, maxWidth = 'max-w-lg' }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen]);

  // Manejo de light-dismiss y cancel event
  const handleCancel = (e) => {
    e.preventDefault();
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === dialogRef.current) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      onCancel={handleCancel}
      onClick={handleBackdropClick}
      closedby="any"
      aria-labelledby="modal-title"
      className={`fixed inset-0 m-auto p-0 rounded-card bg-brand-surface border border-brand-border shadow-modal w-full ${maxWidth} max-h-[90vh] flex flex-col z-50 text-brand-text`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-brand-border bg-brand-surface sticky top-0 z-10">
        <h2 id="modal-title" className="text-base font-semibold text-brand-text">
          {title}
        </h2>
        <button
          onClick={onClose}
          type="button"
          aria-label="Cerrar modal"
          className="w-7 h-7 rounded-full flex items-center justify-center bg-brand-surface2 hover:bg-brand-border text-brand-text2 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body con scroll */}
      <div className="p-6 overflow-y-auto space-y-4 text-sm flex-1">
        {children}
      </div>

      {/* Footer */}
      {footer && (
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-brand-border bg-brand-surface sticky bottom-0 z-10">
          {footer}
        </div>
      )}
    </dialog>
  );
}
