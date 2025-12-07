// components/StatusModal.tsx
import React from 'react';

interface StatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'success' | 'error'; // Opsional: persiapan jika nanti butuh modal error
}

const StatusModal: React.FC<StatusModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  type = 'success' 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity">
      {/* Modal Card */}
      <div className="relative w-full max-w-sm transform overflow-hidden rounded-2xl bg-white p-6 text-center shadow-xl transition-all animate-in fade-in zoom-in duration-200">
        
        {/* Tombol Close (X) */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Icon Bagian Tengah */}
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            {type === 'success' ? (
                 <svg
                 className="h-10 w-10 text-green-500"
                 fill="none"
                 stroke="currentColor"
                 viewBox="0 0 24 24"
                 xmlns="http://www.w3.org/2000/svg"
               >
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
               </svg>
            ) : (
                // Placeholder icon untuk error (jika nanti type='error' dipakai)
                <svg className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )}
        </div>

        {/* Judul */}
        <h3 className="mb-2 text-2xl font-bold text-gray-900">
          {title}
        </h3>

        {/* Pesan Deskripsi */}
        <p className="text-sm text-gray-500">
          {message}
        </p>
      </div>
    </div>
  );
};

export default StatusModal;