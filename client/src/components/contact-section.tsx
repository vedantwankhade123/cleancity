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
import { Send, CheckCircle } from "lucide-react";

// Form validation schema
const contactFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

const ContactSection: React.FC = () => {
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  const onSubmit = (values: ContactFormValues) => {
    // In a real application, you would send this to your backend
    console.log(values);
    
    // Show success message
    toast({
      title: "Message Sent!",
      description: "Thank you for reaching out. We'll get back to you shortly.",
    });
    
    // Reset form
    form.reset();
  };

  const benefits = [
    "We will respond to you within 24 hours",
    "Your feedback helps us improve",
    "Connect with our dedicated team",
  ];

  return (
    <section id="contact" className="bg-gray-900 text-white py-20 sm:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Column: Info */}
          <div className="relative">
            <div className="space-y-8">
              <h2 className="text-4xl md:text-5xl font-bold">
                Get In Touch
              </h2>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-primary" />
                    <span className="text-lg text-gray-300">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative mt-12 p-8 rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 via-gray-900 to-gray-900 border border-white/10">
               <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-primary/30 rounded-full blur-3xl opacity-40"></div>
              <div className="relative z-10">
                <p className="text-lg font-medium text-white">
                  vedantwankhade47@gmail.com
                </p>
                <p className="mt-2 text-gray-400">
                  Have an urgent inquiry or want to partner with us?
                </p>
                <Button
                  asChild
                  variant="outline"
                  className="mt-6 bg-white/10 border-white/20 hover:bg-white/20 text-white"
                >
                  <a href="mailto:vedantwankhade47@gmail.com">Email Us Directly</a>
                </Button>
              </div>
            </div>
          </div>
          
          {/* Right Column: Form */}
          <div className="p-8 bg-gray-800/50 rounded-2xl border border-white/10">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-400">Full name*</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="John Doe" 
                            className="bg-transparent border-0 border-b border-gray-600 rounded-none focus:ring-0 focus:border-primary px-1 pb-2"
                          />
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
                          <Input 
                            type="email" 
                            {...field} 
                            placeholder="you@example.com" 
                            className="bg-transparent border-0 border-b border-gray-600 rounded-none focus:ring-0 focus:border-primary px-1 pb-2"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-400">Message*</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={4}
                          {...field}
                          placeholder="Tell us about your inquiry..."
                          className="bg-transparent border-0 border-b border-gray-600 rounded-none focus:ring-0 focus:border-primary px-1 pb-2 resize-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full gap-2 bg-white text-gray-900 hover:bg-gray-200 rounded-full py-6 text-lg font-semibold"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? "Sending..." : "Submit Inquiry"}
                  <Send className="h-5 w-5" />
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;