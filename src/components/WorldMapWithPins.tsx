import React, { useState } from 'react';
import { MapPin } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import worldMap from '@/assets/world-map-illustrated.png';

interface Country {
  name: string;
  x: number; // percentage from left
  y: number; // percentage from top
  nameKo: string;
}

const countries: Country[] = [
  { name: 'Peru', nameKo: '페루', x: 24, y: 58 },
  { name: 'Argentina', nameKo: '아르헨티나', x: 29, y: 74 },
  { name: 'Thailand', nameKo: '태국', x: 73, y: 50 },
  { name: 'Egypt', nameKo: '이집트', x: 54, y: 42 },
  { name: 'Panama', nameKo: '파나마', x: 23, y: 51 },
  { name: 'Japan', nameKo: '일본', x: 83, y: 38 },
];

const WorldMapWithPins = () => {
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handlePinClick = (country: Country) => {
    setSelectedCountry(country);
    setIsDialogOpen(true);
  };

  const handleConfirm = async () => {
    if (!selectedCountry) return;

    setIsProcessing(true);
    
    // TODO: n8n workflow webhook URL을 여기에 추가하세요
    const webhookUrl = 'YOUR_N8N_WEBHOOK_URL_HERE';
    
    try {
      // n8n workflow 트리거
      await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'no-cors',
        body: JSON.stringify({
          country: selectedCountry.name,
          countryKo: selectedCountry.nameKo,
          timestamp: new Date().toISOString(),
        }),
      });

      toast({
        title: '프로모션 배너 QA 시작',
        description: `${selectedCountry.nameKo} 프로모션 배너 QA가 시작되었습니다.`,
      });
      
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error triggering workflow:', error);
      toast({
        title: '오류 발생',
        description: 'QA 워크플로우를 시작할 수 없습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="relative w-full max-w-6xl">
          <img 
            src={worldMap} 
            alt="World Map" 
            className="w-full h-auto"
          />
          
          {countries.map((country) => (
            <button
              key={country.name}
              onClick={() => handlePinClick(country)}
              className="absolute transform -translate-x-1/2 -translate-y-full hover:scale-125 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-primary rounded-full"
              style={{
                left: `${country.x}%`,
                top: `${country.y}%`,
              }}
              aria-label={`${country.nameKo} 선택`}
            >
              <MapPin 
                className="w-8 h-8 text-primary drop-shadow-lg" 
                fill="currentColor"
              />
            </button>
          ))}
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>프로모션 배너 QA 실행</DialogTitle>
            <DialogDescription>
              {selectedCountry && (
                <>
                  <span className="font-semibold text-foreground">{selectedCountry.nameKo}</span>
                  의 프로모션 배너 QA를 진행하시겠습니까?
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isProcessing}
            >
              취소
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isProcessing}
            >
              {isProcessing ? '실행 중...' : '실행'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WorldMapWithPins;
