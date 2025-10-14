import { useState } from "react";

function ImageModal({ src, alt = "Image preview", onClose }) {
  return (
    <div
      onClick={onClose} // klik overlay untuk close
      className="fixed inset-0 flex items-center justify-center bg-black/60 z-50"
    >
      <div
        onClick={(e) => e.stopPropagation()} // biar klik dalam modal ga nutup
        className="relative bg-white rounded-2xl shadow-lg p-4 max-w-lg w-full"
      >
        {/* Tombol close */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-black"
        >
          ✕
        </button>

        {/* Gambar */}
        <img src={src} alt={alt} className="rounded-xl w-full h-auto" />
      </div>
    </div>
  );
}

export default function ImagePreview({ images }) {
  const [selectedImage, setSelectedImage] = useState(null);

  return (
    <>
      <div className="flex gap-2 flex-wrap">
        {images.map((image, imgIndex) => (
          <img
            key={imgIndex}
            src={image}
            alt={`Mockup ${imgIndex + 1}`}
            className="w-16 h-16 object-cover rounded border border-gray-200 cursor-pointer"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
            onClick={() => setSelectedImage(image)} // klik thumbnail → buka modal
          />
        ))}
      </div>

      {/* Modal */}
      {selectedImage && (
        <ImageModal
          src={selectedImage}
          alt="Preview"
          onClose={() => setSelectedImage(null)}
        />
      )}
    </>
  );
}