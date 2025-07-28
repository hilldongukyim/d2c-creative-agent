import { useEffect, useState } from "react";

interface KangarooAnimationProps {
  workflowType: "kv-creation" | "size-variation" | "get-outputs";
}

const artTypes = {
  "kv-creation": {
    title: "Creating Key Visual Design",
    emoji: "🎨",
    description: "Painting beautiful key visuals...",
    colors: ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FECA57"]
  },
  "size-variation": {
    title: "Crafting Size Variations", 
    emoji: "📐",
    description: "Resizing and adapting artwork...",
    colors: ["#A8E6CF", "#FFB3BA", "#FFDFBA", "#BAE1FF", "#C7CEEA"]
  },
  "get-outputs": {
    title: "Finalizing Masterpiece",
    emoji: "✨",
    description: "Adding finishing touches...",
    colors: ["#FFD93D", "#6BCF7F", "#4D96FF", "#FF6B9D", "#C44569"]
  }
};

export const KangarooAnimation = ({ workflowType }: KangarooAnimationProps) => {
  const [currentColorIndex, setCurrentColorIndex] = useState(0);
  const artType = artTypes[workflowType];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentColorIndex((prev) => (prev + 1) % artType.colors.length);
    }, 800);

    return () => clearInterval(interval);
  }, [artType.colors.length]);

  return (
    <div className="flex flex-col items-center justify-center py-8 space-y-4">
      {/* Title */}
      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <span className="text-2xl">{artType.emoji}</span>
        {artType.title}
      </h3>
      
      {/* Kangaroo and Canvas */}
      <div className="relative">
        {/* Canvas/Easel */}
        <div className="relative bg-white border-4 border-gray-300 rounded-lg w-32 h-24 shadow-lg">
          {/* Animated paint strokes */}
          <div className="absolute inset-2 overflow-hidden rounded">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={`absolute w-2 h-2 rounded-full animate-fade-in`}
                style={{
                  backgroundColor: artType.colors[currentColorIndex],
                  left: `${Math.random() * 80}%`,
                  top: `${Math.random() * 70}%`,
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: "0.8s",
                  animationIterationCount: "infinite"
                }}
              />
            ))}
            
            {/* Paint strokes effect */}
            <div className="absolute inset-0">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={`stroke-${i}`}
                  className="absolute h-1 rounded-full animate-scale-in"
                  style={{
                    backgroundColor: artType.colors[(currentColorIndex + i) % artType.colors.length],
                    width: `${20 + Math.random() * 40}%`,
                    left: `${Math.random() * 60}%`,
                    top: `${20 + i * 20}%`,
                    animationDelay: `${i * 0.3}s`,
                    animationDuration: "1s",
                    animationIterationCount: "infinite"
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Baby Kangaroo */}
        <div className="absolute -bottom-6 -right-8 text-4xl animate-bounce">
          🦘
        </div>
        
        {/* Paint brush in kangaroo's hand */}
        <div 
          className="absolute -bottom-2 -right-4 text-lg transform rotate-45 animate-pulse"
          style={{ color: artType.colors[currentColorIndex] }}
        >
          🖌️
        </div>
        
        {/* Paint palette */}
        <div className="absolute -bottom-4 -left-6 bg-white rounded-full p-2 shadow-md border-2 border-gray-200">
          <div className="flex space-x-1">
            {artType.colors.map((color, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentColorIndex ? 'scale-125' : 'scale-100'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground text-center animate-fade-in">
        {artType.description}
      </p>
      
      {/* Progress dots */}
      <div className="flex space-x-1">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i === (Math.floor(Date.now() / 500) % 3) 
                ? 'bg-primary scale-125' 
                : 'bg-muted'
            }`}
          />
        ))}
      </div>
    </div>
  );
};