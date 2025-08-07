import { Button } from "@/components/ui/button";

interface FormData {
  email: string;
  mainProductUrl: string;
  secondProductUrl: string;
  mainEnergyLabel?: string;
  secondEnergyLabel?: string;
}

interface ConfirmationWithScreenshotsProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  onGoBack: () => void;
  onSubmit: () => void;
}

const ConfirmationWithScreenshots = ({ 
  formData, 
  onGoBack, 
  onSubmit 
}: ConfirmationWithScreenshotsProps) => {
  return (
    <div className="flex gap-3 mt-4 animate-fade-in">
      <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 max-w-[95%] w-full">
        <div className="space-y-3 text-sm">
          <div><strong>EP ID:</strong> {formData.email}</div>
          <div><strong>Main Product URL:</strong> {formData.mainProductUrl}</div>
          <div><strong>Main Product's energy Label:</strong> {formData.mainEnergyLabel || 'Not provided'}</div>
          <div><strong>Second Product URL:</strong> {formData.secondProductUrl}</div>
          <div><strong>Second product url's energy label:</strong> {formData.secondEnergyLabel || 'Not provided'}</div>
        </div>

        <p className="text-sm text-muted-foreground mt-4">
          Is this information correct? Please confirm to proceed.
        </p>
        
        <div className="flex gap-2 mt-4">
          <Button 
            variant="outline"
            size="sm"
            onClick={onGoBack}
          >
            Edit Information
          </Button>
          <Button 
            size="sm"
            onClick={onSubmit}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
          >
            Confirm & Proceed
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationWithScreenshots;