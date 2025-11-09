import { useState } from "react";

export default function ImageModal({ src, alt = "Image preview", triggerLabel = "Lihat" }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Tombol trigger */}
      <button
        onClick={() => setIsOpen(true)}
        className="text-primaryColor underline font-montserrat font-bold text-sm"
      >
        {triggerLabel}
      </button>

      {/* Modal */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)} // klik overlay untuk close
          className="fixed inset-0 flex items-center justify-center bg-black/60 z-50"
        >
          <div
            onClick={(e) => e.stopPropagation()} // biar klik dalam modal ga nutup
            className="relative bg-white rounded-2xl shadow-lg p-4 max-w-lg w-full"
          >
            {/* Tombol close */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-2 right-2 text-gray-600 hover:text-black"
            >
              ✕
            </button>

            {/* Gambar */}
            <img
              src={src}
              alt={alt}
              className="rounded-xl w-full h-auto"
            />
          </div>
        </div>
      )}
    </>
  );
}