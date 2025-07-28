import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

const requestSchema = z.object({
  requestorName: z.string().min(1, "Please enter requestor name"),
  requestorEmail: z.string().email("Please enter a valid email address"),
  country: z.string().min(1, "Please select a country"),
  promotionDetail: z.string().min(10, "Please enter promotion details (min 10 characters)"),
  productA: z.string().url("Please enter a valid Product A URL"),
  productALifestyle: z.string().min(1, "Please enter Product A lifestyle description"),
  productB: z.string().optional(),
  productBLifestyle: z.string().optional(),
  productC: z.string().optional(),
  productCLifestyle: z.string().optional(),
  benefitIcons: z.array(z.string()).max(3, "Maximum 3 benefit icons allowed"),
  publishingChannels: z.array(z.string()).min(1, "Please select at least one publishing channel"),
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

const benefitIconOptions = [
  "Fast Delivery", "Quality Guarantee", "24/7 Support", "Free Shipping",
  "Money Back", "Eco Friendly", "Premium Quality", "Limited Time"
];

const publishingChannelOptions = [
  "LG.COM", "DV360", "Criteo", "PMAX", "Mailing", "Social"
];

export const RequestCheckForm = ({ open, onOpenChange, onComplete }: RequestCheckFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      requestorName: "",
      requestorEmail: "",
      country: "",
      promotionDetail: "",
      productA: "",
      productALifestyle: "",
      productB: "",
      productBLifestyle: "",
      productC: "",
      productCLifestyle: "",
      benefitIcons: [],
      publishingChannels: [],
    },
  });

  const onSubmit = async (data: RequestFormData) => {
    setIsSubmitting(true);
    
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: "Request Submitted",
      description: "Promotional content request has been submitted successfully.",
    });
    
    setIsSubmitting(false);
    onComplete();
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Promotional Content Request Form</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="requestorName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Requestor Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter requestor name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="requestorEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Requestor Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter email address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
              name="promotionDetail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Promotion Detail</FormLabel>
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

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Products</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="productA"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product A URL</FormLabel>
                      <FormControl>
                        <Input placeholder="Please copy and paste the PDP url" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="productALifestyle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product A - Lifestyle</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., happy businessman in a hotel room working" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="productB"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product B URL (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Please copy and paste the PDP url" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="productBLifestyle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product B - Lifestyle (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter lifestyle description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="productC"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product C URL (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Please copy and paste the PDP url" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="productCLifestyle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product C - Lifestyle (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter lifestyle description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="benefitIcons"
              render={() => (
                <FormItem>
                  <FormLabel>Benefit Icon Select (max 3)</FormLabel>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {benefitIconOptions.map((item) => (
                      <FormField
                        key={item}
                        control={form.control}
                        name="benefitIcons"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={item}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(item)}
                                  onCheckedChange={(checked) => {
                                    const current = field.value || [];
                                    if (checked && current.length < 3) {
                                      field.onChange([...current, item]);
                                    } else if (!checked) {
                                      field.onChange(current.filter((value) => value !== item));
                                    }
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal">
                                {item}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="publishingChannels"
              render={() => (
                <FormItem>
                  <FormLabel>Publishing Channels Select</FormLabel>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {publishingChannelOptions.map((item) => (
                      <FormField
                        key={item}
                        control={form.control}
                        name="publishingChannels"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={item}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(item)}
                                  onCheckedChange={(checked) => {
                                    const current = field.value || [];
                                    if (checked) {
                                      field.onChange([...current, item]);
                                    } else {
                                      field.onChange(current.filter((value) => value !== item));
                                    }
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal">
                                {item}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
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
                {isSubmitting ? "Submitting..." : "Submit Request"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};