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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Mail, Phone, MapPin, Send, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

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
        <div className="max-w-5xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Get In Touch</h2>
          <p className="text-lg text-gray-600">
            We'd love to hear from you! Whether you have a question, feedback, or a partnership proposal, our team is ready to answer all your questions.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left Column: Contact Info */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-800">Contact Information</h3>
              <p className="text-gray-600 mb-6">
                Fill up the form and our team will get back to you within 24 hours.
              </p>
              <ul className="space-y-4 text-gray-700">
                <li className="flex items-center gap-4">
                  <Phone className="w-5 h-5 text-primary" />
                  <span>+91 9175988560</span>
                </li>
                <li className="flex items-center gap-4">
                  <Mail className="w-5 h-5 text-primary" />
                  <span>vedantwankhade47@gmail.com</span>
                </li>
                <li className="flex items-start gap-4">
                  <MapPin className="w-5 h-5 text-primary mt-1" />
                  <span>Amravati, Maharashtra, India</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-800">Follow Us</h3>
              <div className="flex space-x-4">
                <a href="#" className="p-3 bg-white rounded-full shadow-md text-gray-600 hover:text-primary hover:bg-primary/10 transition-colors">
                  <Facebook size={20} />
                </a>
                <a href="#" className="p-3 bg-white rounded-full shadow-md text-gray-600 hover:text-primary hover:bg-primary/10 transition-colors">
                  <Twitter size={20} />
                </a>
                <a href="#" className="p-3 bg-white rounded-full shadow-md text-gray-600 hover:text-primary hover:bg-primary/10 transition-colors">
                  <Instagram size={20} />
                </a>
                <a href="#" className="p-3 bg-white rounded-full shadow-md text-gray-600 hover:text-primary hover:bg-primary/10 transition-colors">
                  <Linkedin size={20} />
                </a>
              </div>
            </div>
          </div>
          
          {/* Right Column: Form */}
          <Card className="border-gray-200 shadow-lg">
            <CardHeader>
              <CardTitle>Send us a Message</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your name" {...field} />
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
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="your@email.com" {...field} />
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
                        <FormLabel>Subject</FormLabel>
                        <FormControl>
                          <Input placeholder="How can we help?" {...field} />
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
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Your message here..." 
                            className="resize-none" 
                            rows={4} 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full py-3 px-4 bg-primary text-white font-medium rounded-md hover:bg-primary/90 transition-colors gap-2"
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting ? "Sending..." : <>Send Message <Send className="h-4 w-4" /></>}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;