import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { insertReportSchema } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useFileUpload } from "@/hooks/use-file-upload";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { fileToBase64 } from "@/lib/utils";
import { Image, Upload, X } from "lucide-react";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import CameraComponent from "@/components/ui/camera";
import MapComponent from "@/components/ui/map";
import { toast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet";

// Extended schema with file validation
const reportFormSchema = insertReportSchema.extend({
  // These fields will be added programmatically later
  imageFile: z.any()
    .refine(file => 
      file && (file instanceof File || typeof file === "string"), 
      "Please upload an image or take a photo"
    ),
});

type ReportFormValues = z.infer<typeof reportFormSchema>;

const ReportForm: React.FC = () => {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const {
    file,
    preview,
    error: fileError,
    handleFileChange,
    setImage,
    clearFile,
  } = useFileUpload();

  // Initialize form
  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      title: "",
      description: "",
      imageFile: undefined,
      latitude: "",
      longitude: "",
      address: "",
      userId: user?.id || 0,
      imageUrl: "", // Add default imageUrl field
    },
  });

  // Handle location selection
  const handleLocationSelect = (latitude: string, longitude: string, address: string) => {
    form.setValue("latitude", latitude);
    form.setValue("longitude", longitude);
    form.setValue("address", address);
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileChange(e.target.files[0]);
      form.setValue("imageFile", e.target.files[0]);
    }
  };

  // Handle camera capture
  const handleCameraCapture = (imageData: string) => {
    setImage(imageData);
    form.setValue("imageFile", imageData);
  };

  // Handle image clear
  const handleClearImage = () => {
    clearFile();
    form.setValue("imageFile", undefined);
  };

  // Create report mutation
  const createReportMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log("Submitting report with data:", data);
      
      // Convert image to base64 if it's a File
      let imageUrl = "";
      if (data.imageFile instanceof File) {
        imageUrl = await fileToBase64(data.imageFile);
      } else if (typeof data.imageFile === "string") {
        // Camera capture is already a base64 string
        imageUrl = data.imageFile;
      }
      
      // Remove imageFile and use imageUrl
      const { imageFile, ...reportData } = data;
      
      // Log the actual data being sent to the server
      console.log("Sending to server:", {
        ...reportData,
        imageUrl: imageUrl.substring(0, 50) + "..." // Truncate for logging
      });
      
      try {
        const response = await apiRequest("POST", "/api/reports", {
          ...reportData,
          imageUrl,
        });
        
        // Check if response is ok
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Server error:", errorData);
          throw new Error(errorData.message || "Failed to submit report");
        }
        
        return response.json();
      } catch (error) {
        console.error("Report submission error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
      toast({
        title: "Success!",
        description: "Your waste report has been submitted successfully.",
      });
      navigate("/user/dashboard");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit report. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (values: ReportFormValues) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to submit a report",
        variant: "destructive",
      });
      return;
    }

    createReportMutation.mutate({
      ...values,
      userId: user.id,
    });
  };

  return (
    <>
      <Helmet>
        <title>Submit Report | CleanCity</title>
        <meta name="description" content="Report waste in your area. Upload a photo, mark the location, and help keep your city clean." />
      </Helmet>
      
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8 lg:pt-28">
          {/* Spacing adjustments: 
             - Mobile: pt-24 (6rem) for fixed navbar
             - Desktop: lg:pt-28 (7rem) for larger screens with fixed navbar
             - Bottom padding: pb-8 (2rem) for consistent spacing */}
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle>Submit New Waste Report</CardTitle>
              <CardDescription>
                Help keep your community clean by reporting waste in your area.
                You'll earn reward points for verified reports.
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <Form {...form}>
                <form 
                  onSubmit={form.handleSubmit(onSubmit)} 
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Report Title</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Brief title for your report" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe the waste issue in detail..." 
                            className="resize-none" 
                            rows={4} 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="imageFile"
                    render={({ field: { value, onChange, ...field } }) => (
                      <FormItem>
                        <FormLabel>Upload Photos</FormLabel>
                        <FormControl>
                          <div className="space-y-4">
                            {!preview ? (
                              <div className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center pt-5 pb-6 cursor-pointer w-full h-full">
                                  <Image className="w-10 h-10 text-gray-400 mb-3" />
                                  <p className="mb-2 text-sm text-gray-500">
                                    <span className="font-semibold">Click to upload</span> or drag and drop
                                  </p>
                                  <p className="text-xs text-gray-500">PNG, JPG or JPEG (MAX. 10MB)</p>
                                </label>
                                <input
                                  id="dropzone-file"
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={handleFileInputChange}
                                  {...field}
                                />
                              </div>
                            ) : (
                              <div className="relative">
                                <img
                                  src={preview}
                                  alt="Preview"
                                  className="max-h-64 mx-auto rounded-md object-contain"
                                />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="icon"
                                  className="absolute top-2 right-2"
                                  onClick={handleClearImage}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                            
                            {!preview && (
                              <div className="flex gap-2">
                                <CameraComponent
                                  onCapture={handleCameraCapture}
                                  buttonText="Capture Photo"
                                />
                                {fileError && (
                                  <p className="text-sm text-red-500">{fileError}</p>
                                )}
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="latitude"
                    render={() => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <MapComponent
                            onLocationSelect={handleLocationSelect}
                            initialLatitude={form.getValues("latitude")}
                            initialLongitude={form.getValues("longitude")}
                            initialAddress={form.getValues("address")}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={createReportMutation.isPending}
                  >
                    {createReportMutation.isPending ? (
                      <>Submitting Report...</>
                    ) : (
                      <>Submit Report</>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default ReportForm;
