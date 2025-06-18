import React, { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, X, Redo, Check } from "lucide-react";

interface CameraComponentProps {
  onCapture: (imageData: string) => void;
  buttonText?: string;
}

const CameraComponent: React.FC<CameraComponentProps> = ({ 
  onCapture, 
  buttonText = "Capture Photo" 
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Start/stop camera when the dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      if (!stream) {
        startCamera();
      }
      return () => {
        if (stream) {
          stream.getTracks().forEach(track => {
            track.stop();
          });
          setStream(null);
        }
      };
    } else {
      // When dialog closes, stop the stream and reset the state
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
      setCapturedImage(null);
    }
  }, [isOpen]);

  const startCamera = async () => {
    try {
      // First check if we have permission to access the camera
      const permissionResult = await navigator.permissions.query({ name: 'camera' as PermissionName });
      
      if (permissionResult.state === 'denied') {
        alert('Camera permission was denied. Please enable it in your browser settings and try again.');
        return;
      }

      // Request camera access with specific constraints
      const constraints = {
        video: { 
          facingMode: 'environment', // Use the rear camera if available
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false 
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        // Play the video to start the camera
        videoRef.current.play().catch(error => {
          console.error("Error playing video:", error);
          alert("Error starting camera. Please try again or check your browser settings.");
        });
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      let errorMessage = "Error accessing camera. ";
      
      if (error instanceof DOMException) {
        if (error.name === 'NotAllowedError') {
          errorMessage += "Permission was denied. Please check your browser settings to allow camera access.";
        } else if (error.name === 'NotFoundError') {
          errorMessage += "No camera found. Please check if your device has a camera.";
        } else {
          errorMessage += error.message;
        }
      }
      
      alert(errorMessage);
      setIsOpen(false); // Close the dialog on error
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw current video frame to canvas
      const context = canvas.getContext("2d");
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to data URL
        const imageData = canvas.toDataURL("image/jpeg");
        setCapturedImage(imageData);
      }
    }
  }, []);

  const retakePhoto = () => {
    setCapturedImage(null);
  };

  const confirmPhoto = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      setCapturedImage(null);
      setIsOpen(false);
      stopCamera();
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      stopCamera();
      setCapturedImage(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="secondary" className="gap-2">
          <Camera className="h-4 w-4" />
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Take a Photo</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <Card>
            <CardContent className="p-0 relative">
              {!capturedImage ? (
                // Camera view
                <div className="relative overflow-hidden rounded-md bg-black aspect-video">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                </div>
              ) : (
                // Captured image preview
                <div className="relative overflow-hidden rounded-md bg-black aspect-video">
                  <img
                    src={capturedImage}
                    alt="Captured"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="flex justify-center gap-4 mt-4">
            {!capturedImage ? (
              <>
                <Button variant="outline" size="icon" onClick={() => setIsOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
                <Button onClick={capturePhoto} className="gap-2">
                  <Camera className="h-4 w-4" />
                  Capture
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="icon" onClick={retakePhoto}>
                  <Redo className="h-4 w-4" />
                </Button>
                <Button onClick={confirmPhoto} className="gap-2">
                  <Check className="h-4 w-4" />
                  Use Photo
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CameraComponent;
