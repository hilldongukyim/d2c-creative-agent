import { useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
const aliceProfile = "/lovable-uploads/e1676369-5523-42da-a372-dcedff449611.png";
const benProfile = "/lovable-uploads/df1c4dd4-a06d-4d9c-981e-4463ad0b08dc.png";
import benVideo from "../assets/ben-video.mp4";

const Home = () => {
  const navigate = useNavigate();
  const [expandingAgent, setExpandingAgent] = useState<string | null>(null);
  const [clickPosition, setClickPosition] = useState({ x: 0, y: 0 });
  const aliceRef = useRef<HTMLDivElement>(null);
  const benRef = useRef<HTMLDivElement>(null);

  const handleAgentClick = (agent: string, route: string, ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      setClickPosition({ x: centerX, y: centerY });
      setExpandingAgent(agent);
      
      setTimeout(() => {
        navigate(route);
      }, 800);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-6 relative overflow-hidden">
      {/* Expanding circle animation */}
      {expandingAgent && (
        <div 
          className={`fixed z-50 pointer-events-none ${
            expandingAgent === 'alice' ? 'bg-purple-300' : 'bg-sky-300'
          } rounded-full animate-[expand_0.8s_ease-out_forwards]`}
          style={{
            left: clickPosition.x,
            top: clickPosition.y,
            width: '0px',
            height: '0px',
            transform: 'translate(-50%, -50%)',
          }}
        />
      )}
      
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16 pt-8">
          <h1 className="text-5xl font-bold text-foreground mb-6">
            Choose Your AI Agent
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Meet Alice and Ben, your specialized AI agents<p>ready to help with your creative projects</p>
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Alice - Promotional Content Creator */}
          <div 
            ref={aliceRef}
            className="group cursor-pointer transition-all duration-500 hover:scale-105"
            onClick={() => handleAgentClick('alice', '/promotional', aliceRef)}
          >
            <div className="relative">
              <div className="w-64 h-64 mx-auto rounded-full overflow-hidden shadow-lg group-hover:shadow-purple-400/25 transition-all duration-300">
                <img 
                  src={aliceProfile} 
                  alt="Alice - Promotional Content Creator"
                  className="w-full h-full object-cover object-[center_40%] scale-130 group-hover:scale-150 transition-transform duration-300 ease-in-out brightness-110"
                />
              </div>
              <div className="absolute inset-0 rounded-full bg-gradient-to-t from-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="text-center mt-6 space-y-3">
                <h2 className="text-3xl font-bold text-foreground group-hover:text-purple-400 transition-colors">
                  Alice
                </h2>
                <p className="text-lg text-muted-foreground font-medium">
                  Promotional Content Creator
                </p>
                <div className="space-y-2 text-sm text-muted-foreground max-w-xs mx-auto">
                  <p>• Create with Brand Template</p>
                  <p>• Promotion Copy Writing</p>
                  <p>• Size Variation</p>
                </div>
              </div>
            </div>
          </div>

          {/* Ben - PTO Gallery Creator */}
          <div 
            ref={benRef}
            className="group cursor-pointer transition-all duration-500 hover:scale-105"
            onClick={() => handleAgentClick('ben', '/pto-gallery', benRef)}
          >
            <div className="relative">
              <div className="w-64 h-64 mx-auto rounded-full overflow-hidden shadow-lg group-hover:shadow-blue-400/25 transition-all duration-300">
                <video
                  src={benVideo}
                  className="w-full h-full object-cover scale-110 brightness-125"
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              </div>
              <div className="absolute inset-0 rounded-full bg-gradient-to-t from-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="text-center mt-6 space-y-3">
                <h2 className="text-3xl font-bold text-foreground group-hover:text-blue-400 transition-colors">
                  Ben
                </h2>
                <p className="text-lg text-muted-foreground font-medium">
                  PTO Model Image Creator
                </p>
                <div className="space-y-2 text-sm text-muted-foreground max-w-xs mx-auto">
                  <p>• </p>
                  <p>• Layout Specialist</p>
                  <p>• Gallery Optimization</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Home;