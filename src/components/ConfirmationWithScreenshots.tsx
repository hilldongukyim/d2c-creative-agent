import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

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
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const handleWebhookSubmit = async () => {
    setIsLoading(true);
    
    // n8n 웹훅 URL (사용자가 n8n에서 생성한 웹훅 URL로 교체)
    const n8nWebhookUrl = "https://your-n8n-instance.com/webhook/your-webhook-id";
    
    try {
      const response = await fetch(n8nWebhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          mainProductUrl: formData.mainProductUrl,
          secondProductUrl: formData.secondProductUrl,
          mainEnergyLabel: formData.mainEnergyLabel,
          secondEnergyLabel: formData.secondEnergyLabel,
          timestamp: new Date().toISOString(),
          source: "twin-crew-confirmation"
        }),
      });

      if (response.ok) {
        toast({
          title: "성공",
          description: "n8n으로 데이터가 성공적으로 전송되었습니다.",
        });
        onSubmit(); // 기존 submit 함수도 실행
      } else {
        throw new Error('웹훅 전송 실패');
      }
    } catch (error) {
      console.error("n8n 웹훅 전송 오류:", error);
      toast({
        title: "오류",
        description: "n8n으로 데이터 전송에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="flex gap-3 mt-4 animate-fade-in">
      <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 max-w-[95%] w-full">
        <div className="space-y-3 text-sm">
          <div><strong>EP ID:</strong> {formData.email}</div>
          <div><strong>Main Product URL:</strong> {formData.mainProductUrl}</div>
          <div><strong>Second Product URL:</strong> {formData.secondProductUrl}</div>
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
            onClick={handleWebhookSubmit}
            disabled={isLoading}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
          >
            {isLoading ? "전송 중..." : "Confirm & Proceed"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationWithScreenshots;