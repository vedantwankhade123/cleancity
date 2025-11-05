import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { toast } from "@/hooks/use-toast";
import { CheckCircle, User, Mail, FileText, MessageSquare } from "lucide-react";

// Form validation schema
const contactFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

const ContactSection: React.FC = () => {
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = (values: ContactFormValues) => {
    // In a real application, you would send this to your backend
    console.log(values);
    
    // Show success message
    toast({
      title: "Message Sent",
      description: "Thank you for contacting us. We'll get back to you soon!",
    });
    
    // Reset form
    form.reset();
  };

  return (
    <section id="contact" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-900 text-gray-300 rounded-2xl p-8 md:p-12 lg:p-16 relative overflow-hidden">
          {/* Green gradient overlay */}
          <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-[1500px] h-[1500px] bg-[radial-gradient(circle,rgba(34,197,94,0.15)_0%,rgba(34,197,94,0)_60%)]"></div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
            {/* Left Column: Info */}
            <div className="space-y-8">
              <h2 className="text-4xl lg:text-5xl font-bold text-white">Get In Touch</h2>
              <p className="text-lg text-gray-400">
                Have a question, feedback, or a partnership proposal? We'd love to hear from you. Our team is ready to answer all your questions.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span>We respond to all inquiries within 24 hours.</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span>Your feedback helps us improve our services.</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span>Connect directly with our dedicated support team.</span>
                </li>
              </ul>
              <div className="pt-8 border-t border-gray-700/50">
                <p className="text-gray-400 mb-2">Or reach us directly:</p>
                <a href="mailto:vedantwankhade47@gmail.com" className="text-lg font-medium text-white hover:text-primary transition-colors">
                  vedantwankhade47@gmail.com
                </a>
              </div>
            </div>
            
            {/* Right Column: Form */}
            <div>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-400">Full name*</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                              <Input 
                                {...field} 
                                className="bg-gray-800/50 border-gray-700 rounded-lg pl-10 focus:border-primary focus:ring-primary placeholder:text-gray-500"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-400">Email*</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                              <Input 
                                type="email" 
                                {...field} 
                                className="bg-gray-800/50 border-gray-700 rounded-lg pl-10 focus:border-primary focus:ring-primary placeholder:text-gray-500"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-400">Subject*</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                            <Input 
                              {...field} 
                              className="bg-gray-800/50 border-gray-700 rounded-lg pl-10 focus:border-primary focus:ring-primary placeholder:text-gray-500"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-400">Message*</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <MessageSquare className="absolute left-3 top-4 h-4 w-4 text-gray-500" />
                            <Textarea 
                              className="bg-gray-800/50 border-gray-700 rounded-lg pl-10 pt-3 focus:border-primary focus:ring-primary placeholder:text-gray-500 resize-none" 
                              rows={4} 
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full py-3 px-4 bg-primary text-white font-semibold rounded-full hover:bg-primary/90 transition-colors text-lg h-auto"
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting ? "Sending..." : "Submit Inquiry"}
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;