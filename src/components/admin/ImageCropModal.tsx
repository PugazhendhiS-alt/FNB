import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface ImageCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (croppedImage: string) => void;
  title?: string;
  aspectRatio?: number; // width:height ratio (e.g., 3:1 = 3, 1:1 = 1, 16:9 = 1.78)
  width?: number; // target width in px
  height?: number; // target height in px
}

export const ImageCropModal = ({
  isOpen,
  onClose,
  onSave,
  title = 'Crop Image',
  aspectRatio = 3, // default 3:1 for restaurant banner
  width = 1200,
  height = 400,
}: ImageCropModalProps) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setImageSrc(e.target?.result as string);
      setZoom(1);
      setRotation(0);
    };
    reader.readAsDataURL(file);
  };

  const cropImage = () => {
    if (!imageSrc || !canvasRef.current || !imageRef.current) {
      toast.error('Error processing image');
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      toast.error('Error processing image');
      return;
    }

    const img = imageRef.current;

    // Set canvas size to target dimensions
    canvas.width = width;
    canvas.height = height;

    // Calculate crop area to maintain aspect ratio
    const imgWidth = img.naturalWidth;
    const imgHeight = img.naturalHeight;
    const imgAspectRatio = imgWidth / imgHeight;
    const targetAspectRatio = aspectRatio;

    let cropWidth = imgWidth;
    let cropHeight = imgHeight;
    let cropX = 0;
    let cropY = 0;

    if (imgAspectRatio > targetAspectRatio) {
      // Image is wider than target aspect ratio
      cropHeight = imgHeight;
      cropWidth = imgHeight * targetAspectRatio;
      cropX = (imgWidth - cropWidth) / 2;
    } else {
      // Image is taller than target aspect ratio
      cropWidth = imgWidth;
      cropHeight = imgWidth / targetAspectRatio;
      cropY = (imgHeight - cropHeight) / 2;
    }

    // Apply rotation and zoom
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    ctx.drawImage(
      img,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      canvas.width,
      canvas.height
    );

    ctx.restore();

    // Get cropped image as data URL
    const croppedImage = canvas.toDataURL('image/jpeg', 0.9);
    onSave(croppedImage);
    handleClose();
  };

  const handleClose = () => {
    setImageSrc(null);
    setZoom(1);
    setRotation(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!imageSrc ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer rounded-lg border-2 border-dashed border-input bg-secondary/20 p-8 text-center transition-colors hover:bg-secondary/40"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <p className="font-semibold text-foreground">Click to upload image</p>
              <p className="text-sm text-muted-foreground">PNG, JPG, or GIF</p>
            </div>
          ) : (
            <>
              {/* Preview */}
              <div className="flex justify-center bg-secondary/10 p-4 rounded-lg overflow-hidden">
                <div
                  style={{
                    aspectRatio: aspectRatio,
                    width: '100%',
                    maxWidth: '400px',
                    overflow: 'hidden',
                    borderRadius: '8px',
                    border: '2px solid var(--border)',
                  }}
                >
                  <img
                    ref={imageRef}
                    src={imageSrc}
                    alt="Crop preview"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transform: `scale(${zoom}) rotate(${rotation}deg)`,
                      transition: 'transform 0.2s ease-out',
                    }}
                  />
                </div>
              </div>

              {/* Controls */}
              <div className="space-y-4">
                {/* Zoom */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <ZoomIn className="h-4 w-4" />
                    Zoom
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                      className="p-1 rounded border border-input hover:bg-secondary"
                    >
                      <ZoomOut className="h-4 w-4" />
                    </button>
                    <input
                      type="range"
                      min="0.5"
                      max="3"
                      step="0.1"
                      value={zoom}
                      onChange={(e) => setZoom(parseFloat(e.target.value))}
                      className="flex-1"
                    />
                    <button
                      onClick={() => setZoom(Math.min(3, zoom + 0.1))}
                      className="p-1 rounded border border-input hover:bg-secondary"
                    >
                      <ZoomIn className="h-4 w-4" />
                    </button>
                    <span className="text-sm text-muted-foreground min-w-12 text-right">{zoom.toFixed(1)}x</span>
                  </div>
                </div>

                {/* Rotation */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <RotateCcw className="h-4 w-4" />
                    Rotation
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setRotation((rotation - 90) % 360)}
                      className="p-1 rounded border border-input hover:bg-secondary"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      step="1"
                      value={rotation}
                      onChange={(e) => setRotation(parseFloat(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-sm text-muted-foreground min-w-12 text-right">{rotation}°</span>
                  </div>
                </div>

                {/* Change Image Button */}
                <Button
                  variant="outline"
                  onClick={() => {
                    setImageSrc(null);
                    fileInputRef.current?.click();
                  }}
                  className="w-full"
                >
                  Change Image
                </Button>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={cropImage}
                  className="gradient-gold flex-1"
                >
                  Save & Crop
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>

      {/* Hidden canvas for processing */}
      <canvas ref={canvasRef} className="hidden" />
    </Dialog>
  );
};
