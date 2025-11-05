import React from "react";
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
import { Image, X, FileText, Camera, MapPin, Send } from "lucide-react";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import CameraComponent from "@/components/ui/camera";
import MapComponent from "@/components/ui/map";
import { toast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet";

// Extended schema with file validation
const reportFormSchema = insertReportSchema.extend({
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
      imageUrl: "",
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
      let imageUrl = "";
      if (data.imageFile instanceof File) {
        imageUrl = await fileToBase64(data.imageFile);
      } else if (typeof data.imageFile === "string") {
        imageUrl = data.imageFile;
      }
      
      const { imageFile, ...reportData } = data;
      
      const response = await apiRequest("POST", "/api/reports", {
        ...reportData,
        imageUrl,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit report");
      }
      
      return response.json();
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
        
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Report a Waste Issue</h1>
              <p className="text-lg text-gray-600">
                Help us keep your community clean. Fill out the details below.
              </p>
            </div>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                  {/* Left Column: Details */}
                  <div className="lg:col-span-3">
                    <Card className="h-full">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-primary" />
                          1. Describe the Issue
                        </CardTitle>
                        <CardDescription>
                          Provide a clear title and a detailed description of the waste problem.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Report Title</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="e.g., Overflowing trash bin on Main St." 
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
                                  placeholder="Describe the waste issue in detail. Mention the type of waste, approximate quantity, and any other relevant information." 
                                  className="resize-none" 
                                  rows={10} 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Right Column: Photo & Location */}
                  <div className="lg:col-span-2 space-y-8">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Camera className="h-5 w-5 text-primary" />
                          2. Add a Photo
                        </CardTitle>
                        <CardDescription>
                          A clear photo helps us assess the situation better.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <FormField
                          control={form.control}
                          name="imageFile"
                          render={({ field: { value, onChange, ...field } }) => (
                            <FormItem>
                              <FormControl>
                                <div className="space-y-4">
                                  {!preview ? (
                                    <div className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                      <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center pt-5 pb-6 cursor-pointer w-full h-full">
                                        <Image className="w-10 h-10 text-gray-400 mb-3" />
                                        <p className="mb-2 text-sm text-gray-500">
                                          <span className="font-semibold">Click to upload</span> or drag & drop
                                        </p>
                                        <p className="text-xs text-gray-500">PNG, JPG, JPEG (MAX. 10MB)</p>
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
                                        className="w-full h-48 rounded-md object-cover"
                                      />
                                      <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-2 right-2 h-8 w-8"
                                        onClick={handleClearImage}
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  )}
                                  {!preview && (
                                    <div className="flex justify-center">
                                      <CameraComponent onCapture={handleCameraCapture} buttonText="Capture with Camera" />
                                    </div>
                                  )}
                                  {fileError && <p className="text-sm text-red-500 text-center">{fileError}</p>}
                                </div>
                              </FormControl>
                              <FormMessage className="text-center pt-2" />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-primary" />
                          3. Pin the Location
                        </CardTitle>
                        <CardDescription>
                          Use the map to mark the exact location of the waste.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <FormField
                          control={form.control}
                          name="latitude"
                          render={() => (
                            <FormItem>
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
                      </CardContent>
                    </Card>
                  </div>
                </div>
                
                <div className="mt-8 flex justify-end">
                  <Button 
                    type="submit" 
                    size="lg"
                    className="w-full sm:w-auto px-8 gap-2"
                    disabled={createReportMutation.isPending}
                  >
                    {createReportMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Submit Report
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default ReportForm;