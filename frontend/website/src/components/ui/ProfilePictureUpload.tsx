import React, { useState, useRef, useCallback } from 'react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import { Camera, X, Check, User } from 'lucide-react';
import 'react-image-crop/dist/ReactCrop.css';

interface ProfilePictureUploadProps {
  currentImage?: string | null;
  onUpload: (file: File) => Promise<void>;
  loading?: boolean;
}

const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({
  currentImage,
  onUpload,
  loading = false
}) => {
  const [showModal, setShowModal] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>('');
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 80,
    height: 80,
    x: 10,
    y: 10
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageSrc(reader.result?.toString() || '');
        setShowModal(true);
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop({
      unit: 'px',
      width: Math.min(width, height) * 0.6,
      height: Math.min(width, height) * 0.6,
      x: (width - Math.min(width, height) * 0.6) / 2,
      y: (height - Math.min(width, height) * 0.6) / 2
    });
  }, []);

  const getCroppedImg = useCallback(
    (image: HTMLImageElement, canvas: HTMLCanvasElement, crop: PixelCrop) => {
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('No 2d context');
      }

      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      const pixelRatio = window.devicePixelRatio;

      canvas.width = crop.width * pixelRatio * scaleX;
      canvas.height = crop.height * pixelRatio * scaleY;

      ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      ctx.imageSmoothingQuality = 'high';

      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width * scaleX,
        crop.height * scaleY
      );
    },
    []
  );

  const handleSaveCrop = useCallback(async () => {
    if (
      completedCrop?.width &&
      completedCrop?.height &&
      imgRef.current &&
      previewCanvasRef.current
    ) {
      try {
        setUploading(true);
        getCroppedImg(imgRef.current, previewCanvasRef.current, completedCrop);
        
        previewCanvasRef.current.toBlob(async (blob) => {
          if (blob) {
            const file = new File([blob], 'profile-picture.jpg', { type: 'image/jpeg' });
            await onUpload(file);
            setShowModal(false);
            setImageSrc('');
          }
        }, 'image/jpeg', 0.85);
      } catch (error) {
        console.error('Error cropping image:', error);
      } finally {
        setUploading(false);
      }
    }
  }, [completedCrop, getCroppedImg, onUpload]);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  // Respect Vite environment variable VITE_API_URL for deployed backend
  // Fallback to empty string which will use the current origin
  const baseURL = (import.meta as any).env?.VITE_API_URL || '';

  return (
    <div className="relative">
      {/* Profile Picture Display */}
      <div className="relative group">
        <div className="w-32 h-32 rounded-full border-4 border-gray-200 overflow-hidden bg-gray-100 flex items-center justify-center">
          {currentImage ? (
            <img 
              src={`${baseURL}${currentImage}`} 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-16 h-16 text-gray-400" />
          )}
        </div>
        
        {/* Upload Button Overlay */}
        <button
          onClick={handleFileSelect}
          disabled={loading}
          className="absolute inset-0 rounded-full bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        >
          <Camera className="w-8 h-8 text-white" />
        </button>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={onSelectFile}
        className="hidden"
      />

      {/* Crop Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-auto">
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-semibold">Crop Profile Picture</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Crop Area */}
              <div className="mb-4">
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={1}
                  circularCrop
                >
                  <img
                    ref={imgRef}
                    alt="Crop me"
                    src={imageSrc}
                    style={{ transform: `scale(1) rotate(0deg)` }}
                    onLoad={onImageLoad}
                    className="max-h-80 max-w-full rounded"
                  />
                </ReactCrop>
              </div>

              {/* Hidden Canvas for Preview */}
              <canvas
                ref={previewCanvasRef}
                style={{
                  display: 'none'
                }}
              />

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCrop}
                  disabled={uploading || !completedCrop?.width || !completedCrop?.height}
                  className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {uploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Save Picture
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePictureUpload;
