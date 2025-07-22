import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

const requestSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  country: z.string().min(1, "Please select a country"),
  title: z.string().min(1, "Please enter a promotion title"),
  description: z.string().min(10, "Please enter a detailed description (min 10 characters)"),
  productUrl: z.string().url("Please enter a valid product URL"),
  lifestyleTheme: z.string().min(1, "Please select a lifestyle theme"),
});

type RequestFormData = z.infer<typeof requestSchema>;

interface RequestCheckFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

const countries = [
  "United States", "Canada", "United Kingdom", "Germany", "France", 
  "Japan", "Australia", "Singapore", "South Korea", "Netherlands"
];

const lifestyleThemes = [
  "Modern & Minimalist", "Urban & Trendy", "Natural & Organic", 
  "Luxury & Premium", "Family & Lifestyle", "Tech & Innovation",
  "Health & Wellness", "Adventure & Outdoor"
];

export const RequestCheckForm = ({ open, onOpenChange, onComplete }: RequestCheckFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      email: "",
      country: "",
      title: "",
      description: "",
      productUrl: "",
      lifestyleTheme: "",
    },
  });

  const onSubmit = async (data: RequestFormData) => {
    setIsSubmitting(true);
    
    // Simulate checking/processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: "Request Check Completed",
      description: "All information has been validated successfully.",
    });
    
    setIsSubmitting(false);
    onComplete();
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Request Check - Content Information</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Requestor's Email Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter email address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Promotion Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter promotion title" {...field} />
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
                  <FormLabel>Promotion Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter detailed promotion description"
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="productUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/product" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lifestyleTheme"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lifestyle Theme</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select lifestyle theme" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {lifestyleThemes.map((theme) => (
                        <SelectItem key={theme} value={theme}>
                          {theme}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-4 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Checking..." : "Complete Check"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};