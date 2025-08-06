import { useNavigate } from "react-router-dom";
import { useState } from "react";
import aliceProfile from "@/assets/alice-profile.jpg";
import benProfile from "@/assets/ben-profile.jpg";

const Home = () => {
  const navigate = useNavigate();
  const [expandingAgent, setExpandingAgent] = useState<string | null>(null);

  const handleAgentClick = (agent: string, route: string) => {
    setExpandingAgent(agent);
    setTimeout(() => {
      navigate(route);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-6 relative overflow-hidden">
      {/* Expanding circle animation */}
      {expandingAgent && (
        <div 
          className={`fixed inset-0 z-50 pointer-events-none ${
            expandingAgent === 'alice' ? 'bg-purple-500' : 'bg-blue-500'
          } rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-[expand_0.8s_ease-out_forwards]`}
          style={{
            left: '25%',
            top: '50%',
            width: '0px',
            height: '0px',
          }}
        />
      )}
      
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16 pt-8">
          <h1 className="text-5xl font-bold text-foreground mb-6">
            Choose Your AI Agent
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Meet Alice and Ben, your specialized AI companions ready to help with your creative projects
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Alice - Promotional Content Creator */}
          <div 
            className="group cursor-pointer transition-all duration-500 hover:scale-105"
            onClick={() => handleAgentClick('alice', '/promotional')}
          >
            <div className="relative">
              <div className="w-64 h-64 mx-auto rounded-full overflow-hidden border-4 border-purple-400/30 group-hover:border-purple-400/70 transition-all duration-300 shadow-lg group-hover:shadow-purple-400/25">
                <img 
                  src={aliceProfile} 
                  alt="Alice - Promotional Content Creator"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
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
                  <p>• Workflow Management Expert</p>
                  <p>• Content Strategy Specialist</p>
                  <p>• Campaign Optimization</p>
                </div>
              </div>
            </div>
          </div>

          {/* Ben - PTO Gallery Creator */}
          <div 
            className="group cursor-pointer transition-all duration-500 hover:scale-105"
            onClick={() => handleAgentClick('ben', '/pto-gallery')}
          >
            <div className="relative">
              <div className="w-64 h-64 mx-auto rounded-full overflow-hidden border-4 border-blue-400/30 group-hover:border-blue-400/70 transition-all duration-300 shadow-lg group-hover:shadow-blue-400/25">
                <img 
                  src={benProfile} 
                  alt="Ben - PTO Gallery Creator"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="absolute inset-0 rounded-full bg-gradient-to-t from-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="text-center mt-6 space-y-3">
                <h2 className="text-3xl font-bold text-foreground group-hover:text-blue-400 transition-colors">
                  Ben
                </h2>
                <p className="text-lg text-muted-foreground font-medium">
                  PTO Gallery Creator
                </p>
                <div className="space-y-2 text-sm text-muted-foreground max-w-xs mx-auto">
                  <p>• AI Image Generation</p>
                  <p>• PTO Model Specialist</p>
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