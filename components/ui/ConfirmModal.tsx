// components/ui/ConfirmModal.tsx
import React from 'react';
import Button from './Button'; // Kita pakai button yang sudah ada

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean; // Kalau true, tombolnya jadi merah (misal: Logout/Hapus)
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Ya, Lanjutkan", 
  cancelText = "Batal",
  isDanger = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl scale-100">
        
        {/* Icon Tanda Tanya / Warning */}
        <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full ${isDanger ? 'bg-red-100' : 'bg-blue-100'}`}>
          <svg className={`h-8 w-8 ${isDanger ? 'text-red-500' : 'text-blue-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h3 className="mb-2 text-xl font-bold text-gray-900">{title}</h3>
        <p className="mb-6 text-sm text-gray-500">{message}</p>

        <div className="flex gap-3 justify-center">
            <button 
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition"
            >
                {cancelText}
            </button>
            <button 
                onClick={() => { onConfirm(); onClose(); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition shadow-lg ${isDanger ? 'bg-red-600 hover:bg-red-700 shadow-red-200' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'}`}
            >
                {confirmText}
            </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;