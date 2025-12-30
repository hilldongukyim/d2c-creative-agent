import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, Download, FileText, ExternalLink, Check, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// ==================== Types ====================

type Phase = 
  | "loading"
  | "layout-select"
  | "layout-confirm"
  | "channel-select"
  | "syncing"
  | "copy-collect"
  | "image-type-select"
  | "pdp-input"
  | "pdp-preview"
  | "lifestyle-input"
  | "lifestyle-generating"
  | "lifestyle-preview"
  | "final-generating"
  | "final-preview"
  | "completed"
  | "error";

interface LayoutOption {
  id: "A" | "B" | "C" | "D" | "E";
  name: string;
  description: string;
  thumbnail: string;
  available: boolean;
  requiresProduct: boolean;
}

interface WizardState {
  selectedLayout: "A" | "B" | null;
  selectedChannels: string[];
  copyInputs: {
    headline: string;
    subcopy: string;
    cta: string;
  };
  includeProduct: boolean;
  pdpUrl: string;
  productImageUrl: string | null;
  lifestyleDescription: string;
  lifestyleImageUrl: string | null;
}

interface FigmaLayer {
  id: string;
  name: string;
  type: "TEXT" | "IMAGE" | "COMPONENT";
  currentValue: string | null;
  path: string;
}

interface FigmaData {
  fileName: string;
  fileKey: string;
  layers: FigmaLayer[];
}

// ==================== Constants ====================

const LAYOUT_OPTIONS: LayoutOption[] = [
  {
    id: "A",
    name: "Type A",
    description: "Product + Lifestyle",
    thumbnail: "/layout-type-a.jpg",
    available: true,
    requiresProduct: true,
  },
  {
    id: "B",
    name: "Type B",
    description: "Lifestyle Only",
    thumbnail: "/layout-type-b.jpg",
    available: false, // Coming soon
    requiresProduct: false,
  },
  {
    id: "C",
    name: "Type C",
    description: "Coming Soon",
    thumbnail: "",
    available: false,
    requiresProduct: false,
  },
  {
    id: "D",
    name: "Type D",
    description: "Coming Soon",
    thumbnail: "",
    available: false,
    requiresProduct: false,
  },
  {
    id: "E",
    name: "Type E",
    description: "Coming Soon",
    thumbnail: "",
    available: false,
    requiresProduct: false,
  },
];

const CHANNELS = [
  { id: "criteo", name: "Criteo", keywords: ["criteo"] },
  { id: "dv360", name: "DV360", keywords: ["dv360", "dv 360", "display"] },
  { id: "social", name: "Social", keywords: ["social", "facebook", "instagram", "meta"] },
  { id: "email", name: "Email (CRM)", keywords: ["email", "edm", "newsletter", "crm"] },
];

const LIFESTYLE_SUGGESTIONS = [
  "해변에서 여유로운 시간",
  "카페에서 친구들과 대화",
  "도시 거리 산책",
  "공원에서 피크닉",
  "집에서 편안한 휴식",
];

// ==================== Component ====================

const ChatInterface = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Phase & Loading
  const [phase, setPhase] = useState<Phase>("loading");
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Figma Data
  const [figmaData, setFigmaData] = useState<FigmaData | null>(null);
  const [filteredLayers, setFilteredLayers] = useState<FigmaLayer[]>([]);

  // Wizard State
  const [wizardState, setWizardState] = useState<WizardState>({
    selectedLayout: null,
    selectedChannels: [],
    copyInputs: {
      headline: "",
      subcopy: "",
      cta: "",
    },
    includeProduct: false,
    pdpUrl: "",
    productImageUrl: null,
    lifestyleDescription: "",
    lifestyleImageUrl: null,
  });

  // Export State
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [phase]);

  // Initialize
  useEffect(() => {
    // Start with layout selection (no Figma API call yet)
    setTimeout(() => {
      setPhase("layout-select");
    }, 1000);
  }, []);

  // ==================== Phase Handlers ====================

  const handleLayoutSelect = (layoutId: "A" | "B") => {
    const layout = LAYOUT_OPTIONS.find((l) => l.id === layoutId);
    if (!layout?.available) {
      toast({
        title: "준비 중",
        description: "이 레이아웃은 아직 준비 중입니다.",
      });
      return;
    }
    setWizardState((prev) => ({ ...prev, selectedLayout: layoutId }));
    setPhase("layout-confirm");
  };

  const handleLayoutConfirm = () => {
    setPhase("channel-select");
  };

  const handleChannelToggle = (channelId: string) => {
    setWizardState((prev) => ({
      ...prev,
      selectedChannels: prev.selectedChannels.includes(channelId)
        ? prev.selectedChannels.filter((c) => c !== channelId)
        : [...prev.selectedChannels, channelId],
    }));
  };

  const handleChannelConfirm = async () => {
    if (wizardState.selectedChannels.length === 0) {
      toast({
        title: "채널 선택 필요",
        description: "최소 하나의 채널을 선택해주세요.",
        variant: "destructive",
      });
      return;
    }

    // Only sync Figma for Type A
    if (wizardState.selectedLayout === "A") {
      setPhase("syncing");
      await loadFigmaLayers();
    } else {
      setPhase("copy-collect");
    }
  };

  const loadFigmaLayers = async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const { data, error } = await supabase.functions.invoke("yumi-figma-layers");

      if (error) throw error;

      if (!data.success) {
        if (data.errorCode === "RATE_LIMIT") {
          setLoadError("RATE_LIMIT");
          setPhase("error");
          return;
        }
        throw new Error(data.error || "Failed to load Figma layers");
      }

      setFigmaData(data);

      // Filter layers based on selected channels
      const selectedKeywords = CHANNELS.filter((c) =>
        wizardState.selectedChannels.includes(c.id)
      ).flatMap((c) => c.keywords);

      const editable = data.layers.filter(
        (l: FigmaLayer) => l.type === "TEXT" || l.type === "IMAGE"
      );

      const filtered = editable.filter((layer: FigmaLayer) => {
        const pathLower = layer.path.toLowerCase();
        return selectedKeywords.some((keyword) =>
          pathLower.includes(keyword.toLowerCase())
        );
      });

      setFilteredLayers(filtered);

      // Get current copy values from Figma
      const headlineLayer = filtered.find((l: FigmaLayer) =>
        l.name.toLowerCase().includes("copy_headline")
      );
      const subcopyLayer = filtered.find((l: FigmaLayer) =>
        l.name.toLowerCase().includes("copy_subcopy")
      );
      const ctaLayer = filtered.find((l: FigmaLayer) =>
        l.name.toLowerCase().includes("copy_cta")
      );

      setWizardState((prev) => ({
        ...prev,
        copyInputs: {
          headline: headlineLayer?.currentValue || "",
          subcopy: subcopyLayer?.currentValue || "",
          cta: ctaLayer?.currentValue || "",
        },
      }));

      setPhase("copy-collect");
    } catch (error: any) {
      console.error("Error loading Figma layers:", error);
      const isRateLimit =
        error.message?.includes("Rate limit") || error.message?.includes("429");

      if (isRateLimit) {
        setLoadError("RATE_LIMIT");
      } else {
        setLoadError("UNKNOWN");
      }
      setPhase("error");

      toast({
        title: "오류",
        description: error.message || "Figma 템플릿 로드 실패",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopySubmit = () => {
    const { headline, subcopy, cta } = wizardState.copyInputs;
    if (!headline.trim() || !subcopy.trim() || !cta.trim()) {
      toast({
        title: "입력 필요",
        description: "모든 카피 필드를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }
    setPhase("image-type-select");
  };

  const handleImageTypeSelect = (includeProduct: boolean) => {
    setWizardState((prev) => ({ ...prev, includeProduct }));
    if (includeProduct) {
      setPhase("pdp-input");
    } else {
      setPhase("lifestyle-input");
    }
  };

  const handlePdpSubmit = async () => {
    if (!wizardState.pdpUrl.trim()) {
      toast({
        title: "URL 필요",
        description: "PDP URL을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke(
        "yumi-extract-pdp-image",
        {
          body: { pdpUrl: wizardState.pdpUrl },
        }
      );

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || "이미지 추출 실패");
      }

      setWizardState((prev) => ({
        ...prev,
        productImageUrl: data.imageUrl,
      }));

      setPhase("pdp-preview");
    } catch (error: any) {
      console.error("Error extracting PDP image:", error);
      toast({
        title: "오류",
        description: error.message || "제품 이미지 추출 실패",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePdpConfirm = () => {
    setPhase("lifestyle-input");
  };

  const handleLifestyleGenerate = async () => {
    if (!wizardState.lifestyleDescription.trim()) {
      toast({
        title: "입력 필요",
        description: "원하는 씬을 설명해주세요.",
        variant: "destructive",
      });
      return;
    }

    setPhase("lifestyle-generating");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke(
        "yumi-generate-lifestyle",
        {
          body: {
            sceneDescription: wizardState.lifestyleDescription,
            includeProduct: wizardState.includeProduct,
            productImageUrl: wizardState.productImageUrl,
            aspectRatio: "4:3",
          },
        }
      );

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || "이미지 생성 실패");
      }

      setWizardState((prev) => ({
        ...prev,
        lifestyleImageUrl: data.imageUrl,
      }));

      setPhase("lifestyle-preview");
    } catch (error: any) {
      console.error("Error generating lifestyle image:", error);
      toast({
        title: "오류",
        description: error.message || "라이프스타일 이미지 생성 실패",
        variant: "destructive",
      });
      setPhase("lifestyle-input");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLifestyleConfirm = async () => {
    setPhase("final-generating");
    
    // For now, just show the preview
    // In the future, this would apply images to Figma layers
    setTimeout(() => {
      setPhase("final-preview");
    }, 1500);
  };

  const handleRegenerateLifestyle = () => {
    setWizardState((prev) => ({
      ...prev,
      lifestyleImageUrl: null,
    }));
    setPhase("lifestyle-input");
  };

  const handleRetry = () => {
    setLoadError(null);
    setPhase("syncing");
    loadFigmaLayers();
  };

  const handleExport = async (format: "png" | "svg") => {
    setIsExporting(true);

    try {
      const { data, error } = await supabase.functions.invoke(
        "yumi-figma-export",
        {
          body: { format, scale: format === "png" ? 2 : 1 },
        }
      );

      if (error) throw error;

      if (data.success && data.exports.length > 0) {
        window.open(data.exports[0].imageUrl, "_blank");
        toast({
          title: "성공",
          description: `${format.toUpperCase()} 내보내기 완료!`,
        });
      }
    } catch (error: any) {
      console.error("Error downloading:", error);
      toast({
        title: "오류",
        description: "내보내기 실패",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const openInFigma = () => {
    if (figmaData) {
      window.open(`https://www.figma.com/file/${figmaData.fileKey}`, "_blank");
    }
  };

  const handleStartOver = () => {
    setWizardState({
      selectedLayout: null,
      selectedChannels: [],
      copyInputs: { headline: "", subcopy: "", cta: "" },
      includeProduct: false,
      pdpUrl: "",
      productImageUrl: null,
      lifestyleDescription: "",
      lifestyleImageUrl: null,
    });
    setPhase("layout-select");
    setFigmaData(null);
    setFilteredLayers([]);
    setPreviewUrl(null);
  };

  // ==================== Step Indicator ====================

  const getStepNumber = () => {
    const steps: Phase[] = [
      "layout-select",
      "layout-confirm",
      "channel-select",
      "copy-collect",
      "image-type-select",
      "lifestyle-input",
      "final-preview",
    ];
    const currentIndex = steps.findIndex((s) => 
      phase === s || 
      (phase === "syncing" && s === "channel-select") ||
      (phase === "pdp-input" && s === "image-type-select") ||
      (phase === "pdp-preview" && s === "image-type-select") ||
      (phase === "lifestyle-generating" && s === "lifestyle-input") ||
      (phase === "lifestyle-preview" && s === "lifestyle-input") ||
      (phase === "final-generating" && s === "final-preview") ||
      (phase === "completed" && s === "final-preview")
    );
    return currentIndex + 1;
  };

  const totalSteps = 7;

  // ==================== Render Functions ====================

  const renderYumiMessage = (message: string) => (
    <div className="flex items-start gap-4 mb-6">
      <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
        <img
          src="/lovable-uploads/1d0546ae-2d59-40cf-a231-60343eecc72a.png"
          alt="Yumi"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1">
        <p className="text-lg text-gray-800 leading-relaxed">{message}</p>
      </div>
    </div>
  );

  const renderLayoutSelect = () => (
    <div className="space-y-6">
      {renderYumiMessage("안녕하세요! 어떤 레이아웃으로 프로모션 콘텐츠를 만들까요?")}
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {LAYOUT_OPTIONS.map((layout) => (
          <div
            key={layout.id}
            onClick={() => layout.available && handleLayoutSelect(layout.id as "A" | "B")}
            className={`relative rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
              layout.available
                ? "border-gray-200 hover:border-orange-400 hover:shadow-lg"
                : "border-gray-100 opacity-60 cursor-not-allowed"
            } ${wizardState.selectedLayout === layout.id ? "border-orange-400 ring-2 ring-orange-200" : ""}`}
          >
            <div className="aspect-[3/4] bg-gray-100">
              {layout.thumbnail ? (
                <img
                  src={layout.thumbnail}
                  alt={layout.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <span className="text-sm">Coming Soon</span>
                </div>
              )}
            </div>
            <div className="p-3 bg-white">
              <h4 className="font-semibold text-gray-900">{layout.name}</h4>
              <p className="text-sm text-gray-500">{layout.description}</p>
            </div>
            {!layout.available && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  Coming Soon
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderLayoutConfirm = () => {
    const selectedLayout = LAYOUT_OPTIONS.find(
      (l) => l.id === wizardState.selectedLayout
    );

    return (
      <div className="space-y-6">
        {renderYumiMessage(
          selectedLayout?.requiresProduct
            ? `${selectedLayout.name}를 선택하셨네요! 이 레이아웃은 제품 이미지와 라이프스타일 이미지가 모두 필요합니다. 진행하시겠습니까?`
            : `${selectedLayout?.name}를 선택하셨네요! 이 레이아웃은 라이프스타일 이미지만 사용합니다. 진행하시겠습니까?`
        )}

        <div className="flex justify-center">
          <div className="w-64 rounded-xl overflow-hidden shadow-lg">
            <img
              src={selectedLayout?.thumbnail}
              alt={selectedLayout?.name}
              className="w-full h-auto"
            />
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            onClick={() => setPhase("layout-select")}
            className="px-6"
          >
            다른 레이아웃 선택
          </Button>
          <Button
            onClick={handleLayoutConfirm}
            className="bg-orange-400 hover:bg-orange-500 text-white px-8"
          >
            확인 및 진행
          </Button>
        </div>
      </div>
    );
  };

  const renderChannelSelect = () => (
    <div className="space-y-6">
      {renderYumiMessage("어떤 채널용 배너를 만들까요? 여러 개 선택 가능합니다.")}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {CHANNELS.map((channel) => (
          <div
            key={channel.id}
            onClick={() => handleChannelToggle(channel.id)}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all text-center ${
              wizardState.selectedChannels.includes(channel.id)
                ? "border-orange-400 bg-orange-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              {wizardState.selectedChannels.includes(channel.id) && (
                <Check className="w-5 h-5 text-orange-500" />
              )}
              <span className="font-medium text-gray-900">{channel.name}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center">
        <Button
          onClick={handleChannelConfirm}
          disabled={wizardState.selectedChannels.length === 0}
          className="bg-orange-400 hover:bg-orange-500 text-white px-8"
        >
          선택 완료 ({wizardState.selectedChannels.length})
        </Button>
      </div>
    </div>
  );

  const renderSyncing = () => (
    <div className="space-y-6">
      {renderYumiMessage("Figma 템플릿을 불러오는 중입니다...")}
      
      <div className="flex justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-orange-400" />
      </div>
    </div>
  );

  const renderCopyCollect = () => (
    <div className="space-y-6">
      {renderYumiMessage("배너에 들어갈 카피를 입력해주세요.")}

      <div className="space-y-4 max-w-lg mx-auto">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Headline (Copy_Headline)
          </label>
          <Input
            value={wizardState.copyInputs.headline}
            onChange={(e) =>
              setWizardState((prev) => ({
                ...prev,
                copyInputs: { ...prev.copyInputs, headline: e.target.value },
              }))
            }
            placeholder="메인 헤드라인을 입력하세요"
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subcopy (Copy_Subcopy)
          </label>
          <Textarea
            value={wizardState.copyInputs.subcopy}
            onChange={(e) =>
              setWizardState((prev) => ({
                ...prev,
                copyInputs: { ...prev.copyInputs, subcopy: e.target.value },
              }))
            }
            placeholder="서브 카피를 입력하세요"
            rows={2}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            CTA (Copy_CTA_White)
          </label>
          <Input
            value={wizardState.copyInputs.cta}
            onChange={(e) =>
              setWizardState((prev) => ({
                ...prev,
                copyInputs: { ...prev.copyInputs, cta: e.target.value },
              }))
            }
            placeholder="CTA 버튼 텍스트 (예: Shop Now)"
            className="w-full"
          />
        </div>
      </div>

      <div className="flex justify-center">
        <Button
          onClick={handleCopySubmit}
          className="bg-orange-400 hover:bg-orange-500 text-white px-8"
        >
          다음
        </Button>
      </div>
    </div>
  );

  const renderImageTypeSelect = () => (
    <div className="space-y-6">
      {renderYumiMessage("라이프스타일 이미지에 제품을 포함하시겠습니까?")}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
        <div
          onClick={() => handleImageTypeSelect(true)}
          className="p-6 rounded-xl border-2 border-gray-200 hover:border-orange-400 cursor-pointer transition-all text-center"
        >
          <div className="text-4xl mb-3">🛍️</div>
          <h4 className="font-semibold text-gray-900 mb-2">예, 제품 포함</h4>
          <p className="text-sm text-gray-500">
            PDP URL에서 제품 이미지를 가져와 라이프스타일과 함께 표시합니다.
          </p>
        </div>

        <div
          onClick={() => handleImageTypeSelect(false)}
          className="p-6 rounded-xl border-2 border-gray-200 hover:border-orange-400 cursor-pointer transition-all text-center"
        >
          <div className="text-4xl mb-3">🌅</div>
          <h4 className="font-semibold text-gray-900 mb-2">아니오, 제품 없이</h4>
          <p className="text-sm text-gray-500">
            사람과 환경에 집중한 라이프스타일 이미지만 생성합니다.
          </p>
        </div>
      </div>
    </div>
  );

  const renderPdpInput = () => (
    <div className="space-y-6">
      {renderYumiMessage("제품 페이지(PDP) URL을 입력해주세요. 첫 번째 갤러리 이미지를 가져올게요.")}

      <div className="max-w-lg mx-auto space-y-4">
        <Input
          value={wizardState.pdpUrl}
          onChange={(e) =>
            setWizardState((prev) => ({ ...prev, pdpUrl: e.target.value }))
          }
          placeholder="https://example.com/product/..."
          className="w-full"
        />

        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            onClick={() => handleImageTypeSelect(false)}
          >
            제품 없이 진행
          </Button>
          <Button
            onClick={handlePdpSubmit}
            disabled={!wizardState.pdpUrl.trim() || isLoading}
            className="bg-orange-400 hover:bg-orange-500 text-white px-8"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            이미지 가져오기
          </Button>
        </div>
      </div>
    </div>
  );

  const renderPdpPreview = () => (
    <div className="space-y-6">
      {renderYumiMessage("이 제품 이미지를 사용할까요?")}

      <div className="flex justify-center">
        <div className="w-64 h-64 rounded-xl overflow-hidden shadow-lg bg-gray-100">
          {wizardState.productImageUrl ? (
            <img
              src={wizardState.productImageUrl}
              alt="Product"
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              이미지 로딩 중...
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <Button variant="outline" onClick={() => setPhase("pdp-input")}>
          다른 URL 입력
        </Button>
        <Button
          onClick={handlePdpConfirm}
          className="bg-orange-400 hover:bg-orange-500 text-white px-8"
        >
          사용하기
        </Button>
      </div>
    </div>
  );

  const renderLifestyleInput = () => (
    <div className="space-y-6">
      {renderYumiMessage(
        wizardState.includeProduct
          ? "제품과 함께 어떤 라이프스타일 씬을 원하시나요? 원하는 장면을 설명해주세요."
          : "어떤 라이프스타일 씬을 원하시나요? 사람과 환경에 집중된 이미지로 만들어 드릴게요."
      )}

      <div className="max-w-lg mx-auto space-y-4">
        <Textarea
          value={wizardState.lifestyleDescription}
          onChange={(e) =>
            setWizardState((prev) => ({
              ...prev,
              lifestyleDescription: e.target.value,
            }))
          }
          placeholder="예: 해변에서 친구들과 즐거운 시간을 보내는 장면, 따뜻한 햇살 아래..."
          rows={4}
          className="w-full"
        />

        <div className="flex flex-wrap gap-2">
          {LIFESTYLE_SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() =>
                setWizardState((prev) => ({
                  ...prev,
                  lifestyleDescription: suggestion,
                }))
              }
              className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-center">
        <Button
          onClick={handleLifestyleGenerate}
          disabled={!wizardState.lifestyleDescription.trim() || isLoading}
          className="bg-orange-400 hover:bg-orange-500 text-white px-8"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : null}
          이미지 생성하기
        </Button>
      </div>
    </div>
  );

  const renderLifestyleGenerating = () => (
    <div className="space-y-6">
      {renderYumiMessage("라이프스타일 이미지를 생성하고 있습니다...")}

      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-orange-400" />
        <p className="text-gray-500">AI가 이미지를 생성 중입니다. 잠시만 기다려주세요.</p>
      </div>
    </div>
  );

  const renderLifestylePreview = () => (
    <div className="space-y-6">
      {renderYumiMessage("이런 이미지는 어떠세요?")}

      <div className="flex justify-center">
        <div className="max-w-md rounded-xl overflow-hidden shadow-lg bg-gray-100">
          {wizardState.lifestyleImageUrl ? (
            <img
              src={wizardState.lifestyleImageUrl}
              alt="Lifestyle"
              className="w-full h-auto"
            />
          ) : (
            <div className="w-full h-64 flex items-center justify-center text-gray-400">
              이미지 로딩 중...
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <Button variant="outline" onClick={handleRegenerateLifestyle}>
          <RefreshCw className="w-4 h-4 mr-2" />
          다시 생성
        </Button>
        <Button
          onClick={handleLifestyleConfirm}
          className="bg-orange-400 hover:bg-orange-500 text-white px-8"
        >
          사용하기
        </Button>
      </div>
    </div>
  );

  const renderFinalGenerating = () => (
    <div className="space-y-6">
      {renderYumiMessage("최종 배너를 생성하고 있습니다...")}

      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-orange-400" />
        <p className="text-gray-500">카피와 이미지를 조합 중입니다.</p>
      </div>
    </div>
  );

  const renderFinalPreview = () => (
    <div className="space-y-6">
      {renderYumiMessage("모든 준비가 완료되었습니다! 최종 결과물을 확인해주세요.")}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
        {/* Summary Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h4 className="font-semibold text-gray-900 mb-3">📝 입력된 카피</h4>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-500">Headline:</span>{" "}
              <span className="text-gray-900">{wizardState.copyInputs.headline}</span>
            </div>
            <div>
              <span className="text-gray-500">Subcopy:</span>{" "}
              <span className="text-gray-900">{wizardState.copyInputs.subcopy}</span>
            </div>
            <div>
              <span className="text-gray-500">CTA:</span>{" "}
              <span className="text-gray-900">{wizardState.copyInputs.cta}</span>
            </div>
          </div>
        </div>

        {/* Lifestyle Image Preview */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h4 className="font-semibold text-gray-900 mb-3">🖼️ 라이프스타일 이미지</h4>
          {wizardState.lifestyleImageUrl && (
            <img
              src={wizardState.lifestyleImageUrl}
              alt="Lifestyle"
              className="w-full h-40 object-cover rounded-lg"
            />
          )}
        </div>
      </div>

      {/* Selected Channels */}
      <div className="flex justify-center gap-2">
        {wizardState.selectedChannels.map((channelId) => {
          const channel = CHANNELS.find((c) => c.id === channelId);
          return (
            <span
              key={channelId}
              className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm"
            >
              {channel?.name}
            </span>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-center gap-4">
        <Button
          onClick={() => handleExport("png")}
          disabled={isExporting}
          variant="outline"
          className="px-6"
        >
          {isExporting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Download className="w-4 h-4 mr-2" />
          )}
          PNG 다운로드
        </Button>
        <Button
          onClick={() => handleExport("svg")}
          disabled={isExporting}
          variant="outline"
          className="px-6"
        >
          <FileText className="w-4 h-4 mr-2" />
          SVG 다운로드
        </Button>
        <Button onClick={openInFigma} variant="outline" className="px-6">
          <ExternalLink className="w-4 h-4 mr-2" />
          Figma에서 열기
        </Button>
      </div>

      <div className="flex justify-center gap-4 pt-4">
        <Button variant="ghost" onClick={handleStartOver}>
          처음부터 다시
        </Button>
        <Button
          onClick={() => navigate("/home")}
          className="bg-orange-400 hover:bg-orange-500 text-white px-8"
        >
          홈으로 가기
        </Button>
      </div>
    </div>
  );

  const renderError = () => (
    <div className="space-y-6">
      {renderYumiMessage(
        loadError === "RATE_LIMIT"
          ? "Figma API가 일시적으로 사용량이 많습니다. 잠시 후 다시 시도해주세요."
          : "오류가 발생했습니다. 다시 시도해주세요."
      )}

      <div className="flex justify-center">
        <Button
          onClick={handleRetry}
          className="bg-orange-400 hover:bg-orange-500 text-white px-8"
        >
          다시 시도
        </Button>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (phase) {
      case "loading":
        return (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-orange-400" />
            <p className="mt-4 text-gray-500">준비 중...</p>
          </div>
        );
      case "layout-select":
        return renderLayoutSelect();
      case "layout-confirm":
        return renderLayoutConfirm();
      case "channel-select":
        return renderChannelSelect();
      case "syncing":
        return renderSyncing();
      case "copy-collect":
        return renderCopyCollect();
      case "image-type-select":
        return renderImageTypeSelect();
      case "pdp-input":
        return renderPdpInput();
      case "pdp-preview":
        return renderPdpPreview();
      case "lifestyle-input":
        return renderLifestyleInput();
      case "lifestyle-generating":
        return renderLifestyleGenerating();
      case "lifestyle-preview":
        return renderLifestylePreview();
      case "final-generating":
        return renderFinalGenerating();
      case "final-preview":
      case "completed":
        return renderFinalPreview();
      case "error":
        return renderError();
      default:
        return null;
    }
  };

  // ==================== Main Render ====================

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        backgroundImage: `url('/lovable-uploads/bc537bc9-b912-4359-a294-eb543db318e3.png')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
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

      {/* Main container - WIDER layout */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden relative">
          {/* Header */}
          <div className="bg-white p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full overflow-hidden">
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

              {/* Step Indicator */}
              {phase !== "loading" && phase !== "error" && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>Step {getStepNumber()} / {totalSteps}</span>
                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-400 transition-all"
                      style={{ width: `${(getStepNumber() / totalSteps) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Content Area - TALLER */}
          <div className="min-h-[600px] p-8 bg-gray-50 overflow-y-auto">
            {renderContent()}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
