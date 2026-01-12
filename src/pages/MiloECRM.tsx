import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Download, RotateCcw, Type } from "lucide-react";

interface LayoutTemplate {
  id: string;
  name: string;
  cleanImage: string;
  previewImage: string;
  textFields: TextFieldConfig[];
}

interface TextFieldConfig {
  id: string;
  label: string;
  defaultValue: string;
  x: number;
  y: number;
  fontSize: number;
  fontWeight: string;
  fontStyle: string;
  color: string;
  maxWidth?: number;
}

interface TextFieldValue {
  [key: string]: string;
}

const layoutTemplates: LayoutTemplate[] = [
  {
    id: 'coupon-20',
    name: '20% Discount Coupon',
    cleanImage: '/lovable-uploads/milo-coupon-clean.png',
    previewImage: '/lovable-uploads/milo-coupon-20.png',
    textFields: [
      {
        id: 'headline',
        label: 'Headline',
        defaultValue: 'Exclusive Discount',
        x: 55,
        y: 65,
        fontSize: 18,
        fontWeight: '500',
        fontStyle: 'italic',
        color: '#FFFFFF',
        maxWidth: 180,
      },
      {
        id: 'subheadline',
        label: 'Subheadline',
        defaultValue: 'for you',
        x: 55,
        y: 88,
        fontSize: 18,
        fontWeight: '500',
        fontStyle: 'italic',
        color: '#FFFFFF',
        maxWidth: 180,
      },
      {
        id: 'discount',
        label: 'Discount Amount',
        defaultValue: '20%',
        x: 55,
        y: 145,
        fontSize: 42,
        fontWeight: '700',
        fontStyle: 'normal',
        color: '#FFFFFF',
        maxWidth: 120,
      },
      {
        id: 'discountLabel',
        label: 'Discount Label',
        defaultValue: 'OFF',
        x: 153,
        y: 145,
        fontSize: 28,
        fontWeight: '300',
        fontStyle: 'normal',
        color: '#FFFFFF',
        maxWidth: 80,
      },
    ],
  },
];

const MiloECRM: React.FC = () => {
  const navigate = useNavigate();
  const [selectedLayout, setSelectedLayout] = useState<LayoutTemplate | null>(null);
  const [textValues, setTextValues] = useState<TextFieldValue>({});
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleLayoutSelect = (layout: LayoutTemplate) => {
    setSelectedLayout(layout);
    const initialValues: TextFieldValue = {};
    layout.textFields.forEach(field => {
      initialValues[field.id] = field.defaultValue;
    });
    setTextValues(initialValues);
  };

  const handleTextChange = (fieldId: string, value: string) => {
    setTextValues(prev => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const handleReset = () => {
    if (!selectedLayout) return;
    const initialValues: TextFieldValue = {};
    selectedLayout.textFields.forEach(field => {
      initialValues[field.id] = field.defaultValue;
    });
    setTextValues(initialValues);
  };

  const handleDownload = useCallback(async () => {
    if (!selectedLayout || !canvasRef.current) return;
    
    setIsDownloading(true);
    
    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Load the clean image
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = selectedLayout.cleanImage;
      });

      // Set canvas size to match image
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw the clean image
      ctx.drawImage(img, 0, 0);

      // Calculate scale factor (preview is displayed at fixed size)
      const previewWidth = 400;
      const scaleX = img.width / previewWidth;
      const scaleY = img.height / (previewWidth * (img.height / img.width));

      // Draw text fields
      selectedLayout.textFields.forEach(field => {
        const text = textValues[field.id] || field.defaultValue;
        
        ctx.font = `${field.fontStyle} ${field.fontWeight} ${field.fontSize * scaleX}px "LG EI Text", sans-serif`;
        ctx.fillStyle = field.color;
        ctx.textBaseline = 'middle';
        
        ctx.fillText(text, field.x * scaleX, field.y * scaleY);
      });

      // Download
      const link = document.createElement('a');
      link.download = `milo-${selectedLayout.id}-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsDownloading(false);
    }
  }, [selectedLayout, textValues]);

  const handleBack = () => {
    if (selectedLayout) {
      setSelectedLayout(null);
      setTextValues({});
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <img 
              src="/lovable-uploads/milo-profile.png" 
              alt="Milo" 
              className="h-10 w-10 rounded-full object-cover"
            />
            <div>
              <h1 className="text-lg font-semibold text-foreground">Milo</h1>
              <p className="text-sm text-muted-foreground">eCRM Designer</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {!selectedLayout ? (
          // Layout Selection View
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-foreground">Select a Layout</h2>
              <p className="text-muted-foreground">Choose an email layout template to customize</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {layoutTemplates.map(layout => (
                <Card 
                  key={layout.id}
                  className="cursor-pointer hover:border-primary transition-colors group"
                  onClick={() => handleLayoutSelect(layout)}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{layout.name}</CardTitle>
                    <CardDescription className="text-xs">
                      {layout.textFields.length} editable fields
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="relative aspect-[16/9] rounded-lg overflow-hidden bg-muted">
                      <img 
                        src={layout.previewImage} 
                        alt={layout.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          // Editor View
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Preview Panel */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Preview</h2>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleReset}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                  <Button size="sm" onClick={handleDownload} disabled={isDownloading}>
                    <Download className="h-4 w-4 mr-2" />
                    {isDownloading ? 'Downloading...' : 'Download PNG'}
                  </Button>
                </div>
              </div>

              {/* Live Preview */}
              <div className="relative bg-muted rounded-xl p-4 flex items-center justify-center">
                <div className="relative" style={{ width: '400px' }}>
                  <img 
                    src={selectedLayout.cleanImage} 
                    alt="Layout template"
                    className="w-full h-auto"
                  />
                  {/* Text Overlays */}
                  {selectedLayout.textFields.map(field => (
                    <div
                      key={field.id}
                      className="absolute whitespace-nowrap"
                      style={{
                        left: `${field.x}px`,
                        top: `${field.y}px`,
                        fontSize: `${field.fontSize}px`,
                        fontWeight: field.fontWeight,
                        fontStyle: field.fontStyle,
                        color: field.color,
                        maxWidth: field.maxWidth ? `${field.maxWidth}px` : undefined,
                        fontFamily: '"LG EI Text", sans-serif',
                        transform: 'translateY(-50%)',
                      }}
                    >
                      {textValues[field.id] || field.defaultValue}
                    </div>
                  ))}
                </div>
              </div>

              {/* Hidden Canvas for Download */}
              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Editor Panel */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Type className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-lg font-semibold text-foreground">Edit Text</h2>
              </div>

              <Card>
                <CardContent className="pt-6 space-y-4">
                  {selectedLayout.textFields.map(field => (
                    <div key={field.id} className="space-y-2">
                      <Label htmlFor={field.id}>{field.label}</Label>
                      <Input
                        id={field.id}
                        value={textValues[field.id] || ''}
                        onChange={(e) => handleTextChange(field.id, e.target.value)}
                        placeholder={field.defaultValue}
                      />
                      <p className="text-xs text-muted-foreground">
                        Font: {field.fontSize}px, {field.fontWeight}, {field.fontStyle}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Reference Image */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Reference</CardTitle>
                  <CardDescription className="text-xs">Final result example</CardDescription>
                </CardHeader>
                <CardContent>
                  <img 
                    src={selectedLayout.previewImage} 
                    alt="Reference"
                    className="w-full rounded-lg"
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default MiloECRM;
