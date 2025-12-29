import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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

// Grouped layer for asking once per unique name
interface GroupedLayer {
  name: string;
  type: "TEXT" | "IMAGE";
  layers: FigmaLayer[];
  currentValue: string | null;
  count: number;
}

// Channel configuration with associated frame keywords
const CHANNELS = [
  { id: "dv360", name: "DV360", keywords: ["dv360", "dv 360", "display"] },
  { id: "criteo", name: "Criteo", keywords: ["criteo"] },
  { id: "email", name: "Email", keywords: ["email", "edm", "newsletter"] },
  { id: "social", name: "Social", keywords: ["social", "facebook", "instagram", "meta"] }
];

const languages = {
  en: {
    code: "en",
    name: "English",
    flag: "🇺🇸",
    ui: {
      loading: "Loading Figma template...",
      loadError: "Failed to load template. Please try again.",
      welcome: "Hi there! I'm Yumi, your promotional content designer. 🎨",
      templateLoaded: "I've loaded the \"{fileName}\" template!",
      channelQuestion: "Which channels do you need banners for? You can select multiple:",
      channelSelected: "You selected: {channels}",
      noChannelSelected: "Please select at least one channel.",
      layerList: "Here are the editable layers for your selected channels:",
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
      confirmChannels: "Confirm Selection",
      typeResponse: "Type your response here...",
      enterDescription: "Describe your image...",
      completed: "I've prepared everything you need! You can preview the template, download it, or open it directly in Figma.",
      goHome: "Go to Home",
      noLayersFound: "No editable layers found for the selected channels. Please try different channels.",
      rateLimitError: "Figma API is temporarily busy. Please wait a moment and try again.",
      retryButton: "Retry"
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
      templateLoaded: "\"{fileName}\" 템플릿을 불러왔어요!",
      channelQuestion: "어떤 채널용 배너가 필요하세요? 여러 개 선택 가능합니다:",
      channelSelected: "선택하신 채널: {channels}",
      noChannelSelected: "최소 하나의 채널을 선택해 주세요.",
      layerList: "선택하신 채널에서 편집 가능한 레이어 목록입니다:",
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
      confirmChannels: "선택 확인",
      typeResponse: "답변을 입력하세요...",
      enterDescription: "이미지를 설명해 주세요...",
      completed: "모든 준비가 완료되었습니다! 템플릿을 미리보거나, 다운로드하거나, Figma에서 직접 열 수 있습니다.",
      goHome: "홈으로 가기",
      noLayersFound: "선택하신 채널에서 편집 가능한 레이어를 찾을 수 없습니다. 다른 채널을 선택해 주세요.",
      rateLimitError: "Figma API가 일시적으로 사용량이 많습니다. 잠시 후 다시 시도해 주세요.",
      retryButton: "다시 시도"
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
  const [groupedLayers, setGroupedLayers] = useState<GroupedLayer[]>([]);
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [allLayers, setAllLayers] = useState<FigmaLayer[]>([]);
  const [layerInputs, setLayerInputs] = useState<LayerInput[]>([]);
  const [phase, setPhase] = useState<"loading" | "error" | "channel-select" | "collecting" | "completed">("loading");
  const [isExporting, setIsExporting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
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

  const loadFigmaLayers = async (isRetry = false) => {
    setIsLoading(true);
    setLoadError(null);
    
    if (!isRetry) {
      addMessage("yumi", ui.welcome);
    }

    try {
      const { data, error } = await supabase.functions.invoke('yumi-figma-layers');

      if (error) {
        throw error;
      }

      if (!data.success) {
        // Check for rate limit error
        if (data.errorCode === 'RATE_LIMIT') {
          setLoadError('RATE_LIMIT');
          setPhase("error");
          addMessage("yumi", ui.rateLimitError);
          return;
        }
        throw new Error(data.error || 'Failed to load Figma layers');
      }

      setFigmaData(data);
      setLoadError(null);
      
      // Store all editable layers
      const editable = data.layers.filter((l: FigmaLayer) => 
        l.type === "TEXT" || l.type === "IMAGE"
      );
      setAllLayers(editable);

      // Show template loaded message
      setTimeout(() => {
        addMessage("yumi", ui.templateLoaded.replace("{fileName}", data.fileName));
        
        // Ask for channel selection
        setTimeout(() => {
          addMessage("yumi", ui.channelQuestion, "info");
          setPhase("channel-select");
        }, 1500);
      }, 1500);

    } catch (error: any) {
      console.error('Error loading Figma layers:', error);
      
      // Check if it's a rate limit error from the response
      const isRateLimit = error.message?.includes('Rate limit') || error.message?.includes('429');
      
      if (isRateLimit) {
        setLoadError('RATE_LIMIT');
        setPhase("error");
        addMessage("yumi", ui.rateLimitError);
      } else {
        setLoadError('UNKNOWN');
        setPhase("error");
        addMessage("yumi", ui.loadError);
      }
      
      toast({
        title: "Error",
        description: error.message || "Failed to load Figma template",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setMessages([]);
    setPhase("loading");
    loadFigmaLayers(true);
  };

  const handleChannelChange = (channelId: string, checked: boolean) => {
    setSelectedChannels(prev => 
      checked 
        ? [...prev, channelId]
        : prev.filter(c => c !== channelId)
    );
  };

  const handleChannelConfirm = () => {
    if (selectedChannels.length === 0) {
      toast({
        title: "Warning",
        description: ui.noChannelSelected,
        variant: "destructive"
      });
      return;
    }

    // Get channel names for display
    const selectedChannelNames = CHANNELS
      .filter(c => selectedChannels.includes(c.id))
      .map(c => c.name)
      .join(", ");

    addMessage("user", selectedChannelNames);

    // Filter layers based on selected channels
    const selectedKeywords = CHANNELS
      .filter(c => selectedChannels.includes(c.id))
      .flatMap(c => c.keywords);

    const filteredLayers = allLayers.filter(layer => {
      const pathLower = layer.path.toLowerCase();
      return selectedKeywords.some(keyword => pathLower.includes(keyword.toLowerCase()));
    });

    if (filteredLayers.length === 0) {
      setTimeout(() => {
        addMessage("yumi", ui.noLayersFound);
        // Stay in channel-select phase for retry
      }, 1000);
      return;
    }

    setEditableLayers(filteredLayers);

    // Group layers by name
    const grouped = groupLayersByName(filteredLayers);
    setGroupedLayers(grouped);

    // Show filtered layer list (grouped)
    setTimeout(() => {
      addMessage("yumi", ui.channelSelected.replace("{channels}", selectedChannelNames));
      
      setTimeout(() => {
        const layerListContent = grouped.map((group: GroupedLayer, i: number) => {
          const icon = group.type === "TEXT" ? "📝" : "🖼️";
          const value = group.currentValue ? ` ("${group.currentValue.substring(0, 25)}${group.currentValue.length > 25 ? '...' : ''}")` : "";
          const countInfo = group.count > 1 ? ` (${group.count}개 프레임)` : "";
          return `${i + 1}. ${icon} ${group.name}${value}${countInfo}`;
        }).join("\n");
        
        addMessage("yumi", `${ui.layerList}\n\n${layerListContent}`, "info");
        
        // Start asking for each grouped layer
        setTimeout(() => {
          addMessage("yumi", ui.askForContent);
          setPhase("collecting");
          setCurrentGroupIndex(0);
          askForNextGroup(0, grouped);
        }, 1500);
      }, 1500);
    }, 1000);
  };

  // Group layers by name to ask only once per unique name
  const groupLayersByName = (layers: FigmaLayer[]): GroupedLayer[] => {
    const groupMap = new Map<string, GroupedLayer>();
    
    for (const layer of layers) {
      const key = layer.name.toLowerCase().trim();
      const layerType = layer.type === "COMPONENT" ? "IMAGE" : layer.type;
      
      if (groupMap.has(key)) {
        const existing = groupMap.get(key)!;
        existing.layers.push(layer);
        existing.count++;
      } else {
        groupMap.set(key, {
          name: layer.name,
          type: layerType as "TEXT" | "IMAGE",
          layers: [layer],
          currentValue: layer.currentValue,
          count: 1
        });
      }
    }
    
    return Array.from(groupMap.values());
  };

  const askForNextGroup = (index: number, groups: GroupedLayer[]) => {
    if (index >= groups.length) {
      // All groups collected, show summary
      showSummary();
      return;
    }

    const group = groups[index];
    
    setTimeout(() => {
      const countInfo = group.count > 1 
        ? currentLanguage === "ko" 
          ? ` (${group.count}개 프레임에 적용됩니다)`
          : ` (will apply to ${group.count} frames)`
        : "";
        
      if (group.type === "TEXT") {
        let question = ui.textLayerQuestion.replace("{layerName}", group.name) + countInfo;
        if (group.currentValue) {
          question += "\n" + ui.textLayerHint.replace("{currentValue}", group.currentValue);
        }
        addMessage("yumi", question);
      } else {
        const question = ui.imageLayerQuestion.replace("{layerName}", group.name) + countInfo;
        addMessage("yumi", question + "\n" + ui.imageLayerHint);
      }
    }, 1000);
  };

  const handleInputSubmit = () => {
    if (!inputValue.trim()) return;

    const currentGroup = groupedLayers[currentGroupIndex];
    
    // Add user message
    addMessage("user", inputValue);

    // Save layer input for ALL layers in this group
    for (const layer of currentGroup.layers) {
      const layerType = layer.type === "COMPONENT" ? "IMAGE" : layer.type;
      setLayerInputs(prev => [...prev, {
        layerId: layer.id,
        layerName: layer.name,
        layerType: layerType as "TEXT" | "IMAGE",
        userValue: inputValue
      }]);
    }

    setInputValue("");
    
    // Move to next group
    const nextIndex = currentGroupIndex + 1;
    setCurrentGroupIndex(nextIndex);
    askForNextGroup(nextIndex, groupedLayers);
  };

  const handleSkipLayer = () => {
    const currentGroup = groupedLayers[currentGroupIndex];
    
    addMessage("user", `(${ui.skipLayer}: ${currentGroup.name})`);
    
    const nextIndex = currentGroupIndex + 1;
    setCurrentGroupIndex(nextIndex);
    askForNextGroup(nextIndex, groupedLayers);
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

          {/* Error state with retry button */}
          {phase === "error" && (
            <div className="p-4 bg-white border-t border-gray-100">
              <Button 
                onClick={handleRetry}
                className="w-full bg-orange-400 hover:bg-orange-500 text-white"
              >
                {ui.retryButton}
              </Button>
            </div>
          )}
          {phase === "channel-select" && (
            <div className="p-4 bg-white border-t border-gray-100">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {CHANNELS.map((channel) => (
                    <div 
                      key={channel.id} 
                      className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedChannels.includes(channel.id)
                          ? "border-orange-400 bg-orange-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => handleChannelChange(channel.id, !selectedChannels.includes(channel.id))}
                    >
                      <Checkbox
                        id={channel.id}
                        checked={selectedChannels.includes(channel.id)}
                        onCheckedChange={(checked) => handleChannelChange(channel.id, checked as boolean)}
                      />
                      <label 
                        htmlFor={channel.id} 
                        className="text-sm font-medium cursor-pointer flex-1"
                      >
                        {channel.name}
                      </label>
                    </div>
                  ))}
                </div>
                <Button 
                  onClick={handleChannelConfirm}
                  className="w-full bg-orange-400 hover:bg-orange-500 text-white"
                  disabled={selectedChannels.length === 0}
                >
                  {ui.confirmChannels} ({selectedChannels.length})
                </Button>
              </div>
            </div>
          )}

          {/* Input area for layer collection */}
          {phase === "collecting" && currentGroupIndex < groupedLayers.length && (
            <div className="p-4 bg-white border-t border-gray-100">
              <div className="space-y-3">
                {/* Current layer indicator */}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>
                    {groupedLayers[currentGroupIndex]?.type === "TEXT" ? "📝" : "🖼️"}
                    {" "}{groupedLayers[currentGroupIndex]?.name}
                    {groupedLayers[currentGroupIndex]?.count > 1 && (
                      <span className="ml-2 text-orange-500 text-xs">
                        ({groupedLayers[currentGroupIndex]?.count}개 프레임)
                      </span>
                    )}
                  </span>
                  <span>{currentGroupIndex + 1} / {groupedLayers.length}</span>
                </div>
                
                {/* Input field */}
                <div className="flex gap-2">
                  {groupedLayers[currentGroupIndex]?.type === "TEXT" ? (
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
