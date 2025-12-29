import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ArrowLeft, Send, Globe, Loader2, Download, Image, FileText, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: string;
  sender: "yumi" | "user";
  content: string;
  timestamp: Date;
  type?: "question" | "answer" | "info" | "preview";
}

interface FigmaLayer {
  id: string;
  name: string;
  type: "TEXT" | "IMAGE" | "COMPONENT";
  currentValue: string | null;
  path: string;
}

interface FigmaPage {
  name: string;
  id: string;
  layers: FigmaLayer[];
}

interface FigmaData {
  fileName: string;
  fileKey: string;
  pages: FigmaPage[];
  layers: FigmaLayer[];
}

interface LayerInput {
  layerId: string;
  layerName: string;
  layerType: "TEXT" | "IMAGE";
  userValue: string;
}

const languages = {
  en: {
    code: "en",
    name: "English",
    flag: "🇺🇸",
    ui: {
      loading: "Loading Figma template...",
      loadError: "Failed to load template. Please try again.",
      welcome: "Hi there! I'm Yumi, your promotional content designer. 🎨",
      templateLoaded: "I've loaded the \"{fileName}\" template! Let me show you the layers you can customize.",
      layerList: "Here are the editable layers:",
      askForContent: "Now, let me ask you about each layer. Let's start!",
      textLayerQuestion: "What content would you like for \"{layerName}\"?",
      textLayerHint: "Current value: \"{currentValue}\"",
      imageLayerQuestion: "Please describe the image you'd like for \"{layerName}\":",
      imageLayerHint: "I'll help you find or create the perfect image for this spot.",
      skipLayer: "Skip this layer",
      allDone: "I've collected all your inputs! Here's a summary:",
      summary: "Layer Customizations:",
      exportGuide: "To apply these changes in Figma:",
      exportStep: "1. Open the Figma file\n2. Find each layer using the paths I provided\n3. Update the content as specified",
      previewButton: "Preview Template",
      downloadPng: "Download PNG",
      downloadSvg: "Download SVG",
      openFigma: "Open in Figma",
      continue: "Continue",
      typeResponse: "Type your response here...",
      enterDescription: "Describe your image...",
      completed: "I've prepared everything you need! You can preview the template, download it, or open it directly in Figma.",
      goHome: "Go to Home"
    }
  },
  ko: {
    code: "ko",
    name: "한국어",
    flag: "🇰🇷",
    ui: {
      loading: "Figma 템플릿을 불러오는 중...",
      loadError: "템플릿 로드에 실패했습니다. 다시 시도해 주세요.",
      welcome: "안녕하세요! 저는 프로모션 콘텐츠 디자이너 유미입니다. 🎨",
      templateLoaded: "\"{fileName}\" 템플릿을 불러왔어요! 커스터마이징 가능한 레이어를 보여드릴게요.",
      layerList: "편집 가능한 레이어 목록입니다:",
      askForContent: "이제 각 레이어에 대해 여쭤볼게요. 시작하겠습니다!",
      textLayerQuestion: "\"{layerName}\"에 어떤 내용을 넣으시겠어요?",
      textLayerHint: "현재 값: \"{currentValue}\"",
      imageLayerQuestion: "\"{layerName}\"에 넣을 이미지를 설명해 주세요:",
      imageLayerHint: "이 위치에 완벽한 이미지를 찾거나 만들어 드릴게요.",
      skipLayer: "이 레이어 건너뛰기",
      allDone: "모든 입력을 수집했습니다! 요약입니다:",
      summary: "레이어 커스터마이징:",
      exportGuide: "Figma에서 이 변경사항을 적용하려면:",
      exportStep: "1. Figma 파일 열기\n2. 제가 안내한 경로로 각 레이어 찾기\n3. 지정된 대로 콘텐츠 업데이트",
      previewButton: "템플릿 미리보기",
      downloadPng: "PNG 다운로드",
      downloadSvg: "SVG 다운로드",
      openFigma: "Figma에서 열기",
      continue: "계속하기",
      typeResponse: "답변을 입력하세요...",
      enterDescription: "이미지를 설명해 주세요...",
      completed: "모든 준비가 완료되었습니다! 템플릿을 미리보거나, 다운로드하거나, Figma에서 직접 열 수 있습니다.",
      goHome: "홈으로 가기"
    }
  }
};

type LanguageCode = keyof typeof languages;

const ChatInterface = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>("en");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [figmaData, setFigmaData] = useState<FigmaData | null>(null);
  const [currentLayerIndex, setCurrentLayerIndex] = useState(0);
  const [editableLayers, setEditableLayers] = useState<FigmaLayer[]>([]);
  const [layerInputs, setLayerInputs] = useState<LayerInput[]>([]);
  const [phase, setPhase] = useState<"loading" | "collecting" | "completed">("loading");
  const [isExporting, setIsExporting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const ui = languages[currentLanguage].ui;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load Figma layers on mount
  useEffect(() => {
    loadFigmaLayers();
  }, []);

  const addMessage = (sender: "yumi" | "user", content: string, type?: Message["type"]) => {
    setMessages(prev => [...prev, {
      id: `${sender}-${Date.now()}-${Math.random()}`,
      sender,
      content,
      timestamp: new Date(),
      type
    }]);
  };

  const loadFigmaLayers = async () => {
    setIsLoading(true);
    addMessage("yumi", ui.welcome);

    try {
      const { data, error } = await supabase.functions.invoke('yumi-figma-layers');

      if (error) {
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to load Figma layers');
      }

      setFigmaData(data);
      
      // Filter to get only editable layers (TEXT and IMAGE)
      const editable = data.layers.filter((l: FigmaLayer) => 
        l.type === "TEXT" || l.type === "IMAGE"
      );
      setEditableLayers(editable);

      // Show template loaded message
      setTimeout(() => {
        addMessage("yumi", ui.templateLoaded.replace("{fileName}", data.fileName));
        
        // Show layer list
        setTimeout(() => {
          const layerListContent = editable.map((layer: FigmaLayer, i: number) => {
            const icon = layer.type === "TEXT" ? "📝" : "🖼️";
            const value = layer.currentValue ? ` (현재: "${layer.currentValue.substring(0, 30)}${layer.currentValue.length > 30 ? '...' : ''}")` : "";
            return `${i + 1}. ${icon} ${layer.name}${value}`;
          }).join("\n");
          
          addMessage("yumi", `${ui.layerList}\n\n${layerListContent}`, "info");
          
          // Start asking for each layer
          setTimeout(() => {
            addMessage("yumi", ui.askForContent);
            setPhase("collecting");
            askForNextLayer(0, editable);
          }, 1500);
        }, 1500);
      }, 1500);

    } catch (error: any) {
      console.error('Error loading Figma layers:', error);
      addMessage("yumi", ui.loadError);
      toast({
        title: "Error",
        description: error.message || "Failed to load Figma template",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const askForNextLayer = (index: number, layers: FigmaLayer[]) => {
    if (index >= layers.length) {
      // All layers collected, show summary
      showSummary();
      return;
    }

    const layer = layers[index];
    
    setTimeout(() => {
      if (layer.type === "TEXT") {
        let question = ui.textLayerQuestion.replace("{layerName}", layer.name);
        if (layer.currentValue) {
          question += "\n" + ui.textLayerHint.replace("{currentValue}", layer.currentValue);
        }
        addMessage("yumi", question);
      } else {
        const question = ui.imageLayerQuestion.replace("{layerName}", layer.name);
        addMessage("yumi", question + "\n" + ui.imageLayerHint);
      }
    }, 1000);
  };

  const handleInputSubmit = () => {
    if (!inputValue.trim()) return;

    const currentLayer = editableLayers[currentLayerIndex];
    
    // Add user message
    addMessage("user", inputValue);

    // Save layer input
    const layerType = currentLayer.type === "COMPONENT" ? "IMAGE" : currentLayer.type;
    setLayerInputs(prev => [...prev, {
      layerId: currentLayer.id,
      layerName: currentLayer.name,
      layerType: layerType as "TEXT" | "IMAGE",
      userValue: inputValue
    }]);

    setInputValue("");
    
    // Move to next layer
    const nextIndex = currentLayerIndex + 1;
    setCurrentLayerIndex(nextIndex);
    askForNextLayer(nextIndex, editableLayers);
  };

  const handleSkipLayer = () => {
    const currentLayer = editableLayers[currentLayerIndex];
    
    addMessage("user", `(${ui.skipLayer}: ${currentLayer.name})`);
    
    const nextIndex = currentLayerIndex + 1;
    setCurrentLayerIndex(nextIndex);
    askForNextLayer(nextIndex, editableLayers);
  };

  const showSummary = () => {
    setPhase("completed");
    
    setTimeout(() => {
      addMessage("yumi", ui.allDone);
      
      // Show summary of inputs
      setTimeout(() => {
        if (layerInputs.length > 0) {
          const summaryContent = layerInputs.map(input => {
            const icon = input.layerType === "TEXT" ? "📝" : "🖼️";
            return `${icon} **${input.layerName}**: ${input.userValue}`;
          }).join("\n\n");
          
          addMessage("yumi", `${ui.summary}\n\n${summaryContent}`, "info");
        }
        
        // Show export guide
        setTimeout(() => {
          addMessage("yumi", `${ui.exportGuide}\n\n${ui.exportStep}`);
          
          setTimeout(() => {
            addMessage("yumi", ui.completed, "info");
            // Auto-export preview
            exportPreview();
          }, 1500);
        }, 1500);
      }, 1000);
    }, 500);
  };

  const exportPreview = async () => {
    setIsExporting(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('yumi-figma-export', {
        body: { format: 'png', scale: 2 }
      });

      if (error) throw error;
      
      if (data.success && data.exports.length > 0) {
        setPreviewUrl(data.exports[0].imageUrl);
      }
    } catch (error: any) {
      console.error('Error exporting preview:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownload = async (format: 'png' | 'svg') => {
    setIsExporting(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('yumi-figma-export', {
        body: { format, scale: format === 'png' ? 2 : 1 }
      });

      if (error) throw error;
      
      if (data.success && data.exports.length > 0) {
        // Open the image URL in a new tab for download
        window.open(data.exports[0].imageUrl, '_blank');
        toast({
          title: "Success",
          description: `${format.toUpperCase()} export ready!`
        });
      }
    } catch (error: any) {
      console.error('Error downloading:', error);
      toast({
        title: "Error",
        description: "Failed to export. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const openInFigma = () => {
    if (figmaData) {
      window.open(`https://www.figma.com/file/${figmaData.fileKey}`, '_blank');
    }
  };

  // Completion screen
  if (phase === "completed" && previewUrl) {
    return (
      <div className="h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center" 
           style={{
             backgroundImage: `url('/lovable-uploads/bc537bc9-b912-4359-a294-eb543db318e3.png')`
           }}>
        <div className="w-full max-w-4xl mx-4 bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="p-8">
            {/* Preview Image */}
            <div className="mb-6 rounded-xl overflow-hidden shadow-lg">
              <img 
                src={previewUrl} 
                alt="Template Preview" 
                className="w-full h-auto"
              />
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-center mb-6">
              <Button
                onClick={() => handleDownload('png')}
                disabled={isExporting}
                className="bg-white/20 hover:bg-white/30 text-white border border-white/30"
              >
                {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                {ui.downloadPng}
              </Button>
              <Button
                onClick={() => handleDownload('svg')}
                disabled={isExporting}
                className="bg-white/20 hover:bg-white/30 text-white border border-white/30"
              >
                {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
                {ui.downloadSvg}
              </Button>
              <Button
                onClick={openInFigma}
                className="bg-white/20 hover:bg-white/30 text-white border border-white/30"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                {ui.openFigma}
              </Button>
            </div>
            
            {/* Go Home Button */}
            <div className="text-center">
              <Button
                onClick={() => navigate("/home")}
                className="bg-orange-400 hover:bg-orange-500 text-white px-8"
              >
                {ui.goHome}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{
      backgroundImage: `url('/lovable-uploads/bc537bc9-b912-4359-a294-eb543db318e3.png')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute top-1/3 -left-20 w-60 h-60 bg-white/5 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 right-1/4 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
      </div>

      {/* Back to Home button */}
      <div className="absolute top-6 left-6 z-10">
        <Button
          variant="ghost"
          onClick={() => navigate("/home")}
          className="text-white hover:bg-white/10 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Button>
      </div>

      {/* Main chat container */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden relative">
          {/* Chat header with Yumi's profile */}
          <div className="bg-white p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden">
                  <img 
                    src="/lovable-uploads/1d0546ae-2d59-40cf-a231-60343eecc72a.png" 
                    alt="Yumi Profile" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Yumi</h2>
                  <p className="text-gray-600">Promotional Content Designer</p>
                </div>
              </div>
              
              {/* Language selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    <span>{languages[currentLanguage].flag}</span>
                    <span className="hidden sm:inline">{languages[currentLanguage].name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {Object.entries(languages).map(([code, lang]) => (
                    <DropdownMenuItem
                      key={code}
                      onClick={() => setCurrentLanguage(code as LanguageCode)}
                      className="flex items-center gap-2"
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Messages area */}
          <div className="h-96 overflow-y-auto p-6 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                    message.sender === "user"
                      ? "text-white rounded-br-md"
                      : message.type === "info" 
                        ? "bg-blue-50 text-gray-900 shadow-sm rounded-bl-md border border-blue-100"
                        : "bg-white text-gray-900 shadow-sm rounded-bl-md border border-gray-100"
                  }`}
                  style={message.sender === "user" ? { backgroundColor: "#5D4E49" } : {}}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-md shadow-sm border border-gray-100">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-orange-400" />
                    <span className="text-sm text-gray-500">{ui.loading}</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          {phase === "collecting" && currentLayerIndex < editableLayers.length && (
            <div className="p-4 bg-white border-t border-gray-100">
              <div className="space-y-3">
                {/* Current layer indicator */}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>
                    {editableLayers[currentLayerIndex]?.type === "TEXT" ? "📝" : "🖼️"}
                    {" "}{editableLayers[currentLayerIndex]?.name}
                  </span>
                  <span>{currentLayerIndex + 1} / {editableLayers.length}</span>
                </div>
                
                {/* Input field */}
                <div className="flex gap-2">
                  {editableLayers[currentLayerIndex]?.type === "TEXT" ? (
                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder={ui.typeResponse}
                      className="flex-1"
                      onKeyPress={(e) => e.key === "Enter" && handleInputSubmit()}
                    />
                  ) : (
                    <Textarea
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder={ui.enterDescription}
                      className="flex-1"
                      rows={2}
                    />
                  )}
                  <Button 
                    onClick={handleInputSubmit}
                    disabled={!inputValue.trim()}
                    size="icon"
                    className="bg-orange-400 hover:bg-orange-500 self-end"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Skip button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSkipLayer}
                  className="text-gray-500 hover:text-gray-700"
                >
                  {ui.skipLayer}
                </Button>
              </div>
            </div>
          )}

          {/* Completion actions */}
          {phase === "completed" && !previewUrl && (
            <div className="p-4 bg-white border-t border-gray-100">
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={exportPreview}
                  disabled={isExporting}
                  className="bg-orange-400 hover:bg-orange-500"
                >
                  {isExporting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Image className="w-4 h-4 mr-2" />
                  )}
                  {ui.previewButton}
                </Button>
                <Button
                  onClick={openInFigma}
                  variant="outline"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  {ui.openFigma}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
