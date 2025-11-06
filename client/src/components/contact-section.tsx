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
import { Send, Mail, Phone, MapPin, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useFileUpload } from "@/hooks/use-file-upload";
import { cn } from "@/lib/utils";

// Form validation schema
const contactFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  phone: z
    .string()
    .optional()
    .refine((v) => !v || /^(\+\d{1,3}[- ]?)?\d{7,15}$/.test(v), {
      message: "Enter a valid phone number",
    }),
  services: z.array(z.string()).min(1, "Select at least one service"),
  budget: z.string().min(1, "Select a budget range"),
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
      phone: "",
      services: [],
      budget: "",
      message: "",
    },
  });

  const { file, handleFileChange, error: fileError, clearFile } = useFileUpload({
    maxSizeInMB: 15,
    acceptedTypes: ["image/jpeg", "image/png", "image/jpg", "application/pdf"],
  });

  const onSubmit = (values: ContactFormValues) => {
    console.log(values);
    toast({
      title: "Message Sent!",
      description: "Thank you for reaching out. We'll get back to you shortly.",
    });
    form.reset();
    clearFile();
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email Us",
      value: "vedantwankhade47@gmail.com",
      href: "mailto:vedantwankhade47@gmail.com",
    },
    {
      icon: Phone,
      title: "Call Us",
      value: "+91 9175988560",
      href: "tel:+919175988560",
    },
    {
      icon: MapPin,
      title: "Visit Us",
      value: "Amravati, Maharashtra, India",
    },
  ];

  const serviceOptions = ["Consulting", "Design", "Development", "Maintenance"];
  const budgetOptions = ["Less than $10K", "$10K - $50K", "More than $50K"];

  return (
    <section
      id="contact"
      className="relative py-12 sm:py-14 bg-gradient-to-br from-emerald-900 via-emerald-800 to-green-800 text-white dark:from-emerald-950 dark:via-emerald-900 dark:to-green-900"
    >
      <div className="pointer-events-none absolute inset-0 mix-blend-soft-light">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.25),transparent_40%)]" />
      </div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-start">
          {/* Left Column: Info */}
          <div className="space-y-6">
            <div className="max-w-md">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Tell us about your project</h2>
              <ul className="mt-4 space-y-2 text-emerald-100/90 text-sm">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-300" /> We will respond to you within 12 hours</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-300" /> We'll sign an NDA if requested</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-300" /> Access to dedicated consultant specialists</li>
              </ul>
            </div>
            <div className="space-y-4">
              {contactInfo.map((item, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-400/15 text-emerald-200 ring-1 ring-inset ring-emerald-300/20">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-white/95">{item.title}</h3>
                    {item.href ? (
                      <a href={item.href} className="text-emerald-100 hover:text-white transition-colors">
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-emerald-100">{item.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <a
              href="mailto:vedantwankhade47@gmail.com"
              className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold bg-white/10 hover:bg-white/15 ring-1 ring-white/10 transition"
            >
              Book a free call
            </a>
          </div>

          {/* Right Column: Form */}
          <Card className="w-full shadow-lg border-emerald-400/20 bg-white/5 backdrop-blur supports-[backdrop-filter]:bg-white/5 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Send us a message</CardTitle>
              <CardDescription className="text-emerald-100/80">Fill out the form and we'll get back to you.</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  {/* Service chips */}
                  <FormField
                    control={form.control}
                    name="services"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-emerald-100/90">Service</FormLabel>
                        <div className="flex flex-wrap gap-2">
                          {serviceOptions.map((opt) => {
                            const active = field.value?.includes(opt as any);
                            return (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => {
                                  const next = active
                                    ? (field.value as any[]).filter((v) => v !== opt)
                                    : ([...(field.value as any[] || []), opt]);
                                  field.onChange(next);
                                }}
                                className={cn(
                                  "rounded-full px-3 py-1 text-xs ring-1 transition",
                                  active
                                    ? "bg-emerald-400 text-emerald-950 ring-emerald-300"
                                    : "bg-white/5 text-emerald-100 ring-white/10 hover:bg-white/10"
                                )}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Budget chips */}
                  <FormField
                    control={form.control}
                    name="budget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-emerald-100/90">Budget</FormLabel>
                        <div className="flex flex-wrap gap-2">
                          {budgetOptions.map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => field.onChange(opt)}
                              className={cn(
                                "rounded-full px-3 py-1 text-xs ring-1 transition",
                                field.value === opt
                                  ? "bg-emerald-400 text-emerald-950 ring-emerald-300"
                                  : "bg-white/5 text-emerald-100 ring-white/10 hover:bg-white/10"
                              )}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-emerald-100/90">Full name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="John Doe" className="h-9 text-sm bg-white/10 border-emerald-400/20 placeholder:text-emerald-100/60 focus-visible:ring-emerald-400/40" />
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
                        <FormLabel className="text-emerald-100/90">Email</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} placeholder="you@example.com" className="h-9 text-sm bg-white/10 border-emerald-400/20 placeholder:text-emerald-100/60 focus-visible:ring-emerald-400/40" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-emerald-100/90">Phone (optional)</FormLabel>
                        <FormControl>
                          <Input type="tel" {...field} placeholder="+91 98765 43210" className="h-9 text-sm bg-white/10 border-emerald-400/20 placeholder:text-emerald-100/60 focus-visible:ring-emerald-400/40" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-emerald-100/90">Subject</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="How can we help?" className="h-9 text-sm bg-white/10 border-emerald-400/20 placeholder:text-emerald-100/60 focus-visible:ring-emerald-400/40" />
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
                        <FormLabel className="text-emerald-100/90">Message</FormLabel>
                        <FormControl>
                          <Textarea
                            className="resize-none bg-white/10 border-emerald-400/20 placeholder:text-emerald-100/60 focus-visible:ring-emerald-400/40 text-sm"
                            rows={4}
                            {...field}
                            placeholder="Enter your message here..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full gap-2 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 py-2.5 text-sm font-semibold shadow-sm"
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting ? "Sending..." : "Send Message"}
                    <Send className="h-4 w-4" />
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