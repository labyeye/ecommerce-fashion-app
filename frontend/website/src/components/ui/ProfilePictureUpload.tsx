import React, { useState, useRef, useCallback } from 'react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import { Camera, X, Check, User, Loader } from 'lucide-react';
import 'react-image-crop/dist/ReactCrop.css';
import { uploadImageToImageKit } from '../../services/imageKitService';

interface ProfilePictureUploadProps {
  currentImage?: string | null;
  onUpload: (imageUrl: string) => Promise<void>;
  loading?: boolean;
  authToken?: string;
}

const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({
  currentImage,
  onUpload,
  loading = false,
  authToken
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
  const [uploadError, setUploadError] = useState<string>('');
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(selectedFile.type)) {
        setUploadError('Only JPEG, PNG, and WebP images are allowed');
        return;
      }

      // Validate file size (5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setUploadError('Image size must be less than 5MB');
        return;
      }

      // Clear any previous errors
      setUploadError('');
      setUploadSuccess(false);

      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageSrc(reader.result?.toString() || '');
        setShowModal(true);
      });
      reader.readAsDataURL(selectedFile);
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
        setUploadError('');
        setUploadSuccess(false);
        
        // Crop the image
        getCroppedImg(imgRef.current, previewCanvasRef.current, completedCrop);
        
        // Convert canvas to blob
        const blob = await new Promise<Blob>((resolve) => {
          previewCanvasRef.current?.toBlob((blob) => {
            if (blob) resolve(blob);
          }, 'image/jpeg', 0.85);
        });

        if (!blob) {
          throw new Error('Failed to process cropped image');
        }

        // Create file from blob
        const file = new File([blob], 'profile-picture.jpg', { type: 'image/jpeg' });
        
        // Upload to ImageKit
        if (!authToken) {
          throw new Error('Authentication token is required');
        }
        
        const uploadResult = await uploadImageToImageKit(file, authToken, `profile-${Date.now()}`);
        
        if (!uploadResult.success || !uploadResult.url) {
          throw new Error(uploadResult.error || 'Upload failed');
        }

        // Call parent component's upload handler with the ImageKit URL
        await onUpload(uploadResult.url);
        
        setUploadSuccess(true);
        setShowModal(false);
        setImageSrc('');
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to upload image';
        console.error('Error uploading image:', error);
        setUploadError(errorMessage);
      } finally {
        setUploading(false);
      }
    }
  }, [completedCrop, getCroppedImg, onUpload]);

  const handleFileSelect = () => {
    setUploadError('');
    setUploadSuccess(false);
    fileInputRef.current?.click();
  };

  const handleCloseModal = () => {
    if (!uploading) {
      setShowModal(false);
      setImageSrc('');
      setUploadError('');
      setUploadSuccess(false);
    }
  };

  return (
    <div className="relative">
      {/* Success Message */}
      {uploadSuccess && (
        <div className="absolute -top-12 left-0 right-0 bg-green-100 border border-green-400 text-green-700 px-3 py-2 rounded text-sm text-center mb-2">
          Profile picture updated successfully!
        </div>
      )}

      {/* Error Message */}
      {uploadError && (
        <div className="absolute -top-12 left-0 right-0 bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm text-center mb-2">
          {uploadError}
        </div>
      )}

      {/* Profile Picture Display */}
      <div className="relative group">
        <div className="w-32 h-32 rounded-full border-4 border-gray-200 overflow-hidden bg-gray-100 flex items-center justify-center">
          {currentImage ? (
            <img 
              src={currentImage} 
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
          disabled={loading || uploading}
          className="absolute inset-0 rounded-full bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 disabled:cursor-not-allowed"
        >
          {loading || uploading ? (
            <Loader className="w-8 h-8 text-white animate-spin" />
          ) : (
            <Camera className="w-8 h-8 text-white" />
          )}
        </button>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={onSelectFile}
        className="hidden"
        disabled={loading || uploading}
      />

      {/* Crop Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold">Crop Profile Picture</h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600"
                  disabled={uploading}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Error display in modal */}
              {uploadError && (
                <div className="mb-3 bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
                  {uploadError}
                </div>
              )}

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
                  onClick={handleCloseModal}
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
                      Uploading to ImageKit...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Upload & Save
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
