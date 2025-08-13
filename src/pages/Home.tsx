import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Logo from "@/components/Logo";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import OrgChart from "../components/OrgChart";
import FunctionMap from "../components/FunctionMap";
import ContactOrder from "../components/ContactOrder";
const aliceProfile = "/lovable-uploads/d004c9d6-0491-459c-8639-7730374641aa.png";
const benProfile = "/lovable-uploads/df1c4dd4-a06d-4d9c-981e-4463ad0b08dc.png";
const leaderProfile = "/lovable-uploads/b9d1ddf6-1b17-41b4-9233-91642568cd3c.png";
const Home = () => {
  const navigate = useNavigate();
  const [comingSoonOpen, setComingSoonOpen] = useState(false);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [highlightName, setHighlightName] = useState<string | null>(null);
  useEffect(() => {
    const title = "Meet our AI Agents — 내부 업무를 돕는 지능형 팀";
    const desc = "Intelligent AI agents that accelerate internal work through clear structure and collaboration, delivering faster, more accurate results.";

    // Title & meta description
    document.title = title;
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }
    meta.content = desc;

    // Canonical tag
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = window.location.origin + window.location.pathname;

    // Structured data (WebPage)
    const ld = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: title,
      description: desc,
      url: window.location.href
    };
    let script = document.getElementById('ld-json-home') as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = 'ld-json-home';
      document.head.appendChild(script);
    }
    script.text = JSON.stringify(ld);
  }, []);
  const handleAgentClick = (_agent: string, route: string) => {
    if (route) {
      navigate(route);
      return;
    }
    const name = _agent.toLowerCase();
    const highlightable = new Set(["yumi", "ben", "carmen", "candy", "maya", "theo", "fiona", "tango", "juno", "luna", "fern", "pip", "kai", "noa", "boris", "ollie", "ravi"]);
    if (highlightable.has(name)) {
      setHighlightName(_agent);
      setComingSoonOpen(false);
      return;
    }
    setSelectedName(_agent);
    setComingSoonOpen(true);
  };
  const handleProfileClick = (name: string) => {
    const lower = name.toLowerCase();
    if (lower === "yumi") return navigate("/promotional");
    if (lower === "ben") return navigate("/pto-gallery");
    setSelectedName(name);
    setComingSoonOpen(true);
  };
  return <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-6 relative overflow-hidden">
      <Logo />
      
      {/* Back button */}
      <Button onClick={() => navigate('/')} variant="ghost" size="sm" className="absolute top-6 right-6 z-20 hover:bg-muted/50 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>
      
      {/* Expanding circle animation */}
      <div className="max-w-6xl mx-auto relative z-10">
        <header className="text-center mb-12 pt-8">
          <h1 className="text-5xl font-bold text-foreground mb-4">Meet the Crew</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            An intelligent agent team that helps and accelerates the work of internal employees. Through clear structure and collaboration, we deliver faster, more accurate results.
          </p>
        </header>

        {/* Org Chart Preview Section */}
        <div className="mb-12">
          <Card className="p-8 bg-card/50 backdrop-blur-sm border-muted/20 shadow-lg max-w-6xl mx-auto">
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-foreground/80 text-center">Org Chart</h3>
              
              {/* Horizontal org chart */}
              <div className="overflow-x-auto">
                <div className="flex items-start space-x-8 min-w-max px-4">
                  
                  {/* CEO */}
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center">
                      <span className="text-white text-xs font-medium">CEO</span>
                    </div>
                    <div className="text-xs text-muted-foreground">Leader</div>
                  </div>
                  
                  {/* Connecting line */}
                  <div className="flex items-center">
                    <div className="w-8 h-0.5 bg-muted-foreground/30 mt-8"></div>
                  </div>
                  
                  {/* Marketing Division */}
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-r from-secondary to-secondary/80 flex items-center justify-center overflow-hidden">
                      <img src="/lovable-uploads/c33a87ea-fc09-484a-a916-58c9777a1e25.png" alt="Marketing Division Leader" className="w-full h-full object-cover rounded-full" />
                    </div>
                    <div className="text-xs text-muted-foreground">Marketing</div>
                    
                    {/* Marketing Teams - horizontal layout */}
                    <div className="flex space-x-6 pt-2">
                      {/* Team 1 */}
                      <div className="flex flex-col items-center space-y-2">
                        <div className="w-10 h-10 rounded-full bg-secondary/70 flex items-center justify-center overflow-hidden">
                          <img src="/lovable-uploads/a77cc591-3d95-420e-91cf-6dcd3459c0c9.png" alt="Team Leader" className="w-full h-full object-cover rounded-full" />
                        </div>
                        <div className="flex space-x-1">
                          <div className="w-6 h-6 rounded-full bg-secondary/50"></div>
                          <div className="w-6 h-6 rounded-full bg-secondary/50"></div>
                        </div>
                      </div>
                      
                      {/* Team 2 */}
                      <div className="flex flex-col items-center space-y-2">
                        <div className="w-10 h-10 rounded-full bg-secondary/70 flex items-center justify-center">
                          <span className="text-white text-xs">TL</span>
                        </div>
                        <div className="flex space-x-1">
                          <div className="w-6 h-6 rounded-full bg-secondary/50"></div>
                          <div className="w-6 h-6 rounded-full bg-secondary/50"></div>
                        </div>
                      </div>
                      
                      {/* Team 3 */}
                      <div className="flex flex-col items-center space-y-2">
                        <div className="w-10 h-10 rounded-full bg-secondary/70 flex items-center justify-center">
                          <span className="text-white text-xs">TL</span>
                        </div>
                        <div className="flex space-x-1">
                          <div className="w-6 h-6 rounded-full bg-secondary/50"></div>
                          <div className="w-6 h-6 rounded-full bg-secondary/50"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Platform Division */}
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-r from-accent to-accent/80 flex items-center justify-center">
                      <span className="text-white text-xs">PLT</span>
                    </div>
                    <div className="text-xs text-muted-foreground">Platform</div>
                    
                    {/* Platform Teams - horizontal layout */}
                    <div className="flex space-x-6 pt-2">
                      {/* Team 1 */}
                      <div className="flex flex-col items-center space-y-2">
                        <div className="w-10 h-10 rounded-full bg-accent/70 flex items-center justify-center">
                          <span className="text-white text-xs">TL</span>
                        </div>
                        <div className="flex space-x-1">
                          <div className="w-6 h-6 rounded-full bg-accent/50"></div>
                          <div className="w-6 h-6 rounded-full bg-accent/50"></div>
                        </div>
                      </div>
                      
                      {/* Team 2 */}
                      <div className="flex flex-col items-center space-y-2">
                        <div className="w-10 h-10 rounded-full bg-accent/70 flex items-center justify-center">
                          <span className="text-white text-xs">TL</span>
                        </div>
                        <div className="flex space-x-1">
                          <div className="w-6 h-6 rounded-full bg-accent/50"></div>
                          <div className="w-6 h-6 rounded-full bg-accent/50"></div>
                        </div>
                      </div>
                      
                      {/* Team 3 */}
                      <div className="flex flex-col items-center space-y-2">
                        <div className="w-10 h-10 rounded-full bg-accent/70 flex items-center justify-center">
                          <span className="text-white text-xs">TL</span>
                        </div>
                        <div className="flex space-x-1">
                          <div className="w-6 h-6 rounded-full bg-accent/50"></div>
                          <div className="w-6 h-6 rounded-full bg-accent/50"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Data Division */}
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-r from-muted to-muted-foreground flex items-center justify-center">
                      <span className="text-white text-xs">DATA</span>
                    </div>
                    <div className="text-xs text-muted-foreground">Data</div>
                    
                    {/* Data Teams - horizontal layout */}
                    <div className="flex space-x-6 pt-2">
                      {/* Team 1 */}
                      <div className="flex flex-col items-center space-y-2">
                        <div className="w-10 h-10 rounded-full bg-muted-foreground/70 flex items-center justify-center">
                          <span className="text-white text-xs">TL</span>
                        </div>
                        <div className="flex space-x-1">
                          <div className="w-6 h-6 rounded-full bg-muted-foreground/50"></div>
                          <div className="w-6 h-6 rounded-full bg-muted-foreground/50"></div>
                        </div>
                      </div>
                      
                      {/* Team 2 */}
                      <div className="flex flex-col items-center space-y-2">
                        <div className="w-10 h-10 rounded-full bg-muted-foreground/70 flex items-center justify-center">
                          <span className="text-white text-xs">TL</span>
                        </div>
                        <div className="flex space-x-1">
                          <div className="w-6 h-6 rounded-full bg-muted-foreground/50"></div>
                          <div className="w-6 h-6 rounded-full bg-muted-foreground/50"></div>
                        </div>
                      </div>
                      
                      {/* Team 3 */}
                      <div className="flex flex-col items-center space-y-2">
                        <div className="w-10 h-10 rounded-full bg-muted-foreground/70 flex items-center justify-center">
                          <span className="text-white text-xs">TL</span>
                        </div>
                        <div className="flex space-x-1">
                          <div className="w-6 h-6 rounded-full bg-muted-foreground/50"></div>
                          <div className="w-6 h-6 rounded-full bg-muted-foreground/50"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-center text-xs text-muted-foreground mt-6">
                  20 members across 3 divisions, 9 teams
                </div>
              </div>
            </div>
          </Card>
        </div>



        

        {/* Crew Videos Portfolio Section */}
        <section className="mt-12 mb-16">
          <header className="mb-8 text-center">
            <h2 className="text-4xl font-bold text-foreground mb-4">Portfolio</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              모바일 웹페이지, 반응형 웹사이트, 게이머형 이벤트 랜딩페이지, 가카오체널가업이벤트의<br />
              더 많은 사례를 확인해보세요!
            </p>
            <Button className="mt-6 bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-full text-lg font-medium">
              포트폴리오 더 보기
            </Button>
          </header>

          {/* Random Grid Layout for Videos */}
          <div className="grid grid-cols-12 gap-4 max-w-7xl mx-auto">
            {/* Large video - spans 4 columns */}
            <div className="col-span-4 row-span-2">
              <div className="relative aspect-[4/5] bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg overflow-hidden shadow-lg">
                <video 
                  className="w-full h-full object-cover"
                  autoPlay 
                  loop 
                  muted 
                  playsInline
                >
                  <source src="/alice-video.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-black/20 hover:bg-black/10 transition-colors"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="font-semibold">Alice</h3>
                  <p className="text-sm opacity-90">Marketing Specialist</p>
                </div>
              </div>
            </div>

            {/* Medium video */}
            <div className="col-span-3">
              <div className="relative aspect-video bg-gradient-to-br from-accent/20 to-primary/20 rounded-lg overflow-hidden shadow-lg">
                <video 
                  className="w-full h-full object-cover"
                  autoPlay 
                  loop 
                  muted 
                  playsInline
                >
                  <source src="/ben-video.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-black/20 hover:bg-black/10 transition-colors"></div>
                <div className="absolute bottom-3 left-3 text-white">
                  <h3 className="font-semibold text-sm">Ben</h3>
                  <p className="text-xs opacity-90">Developer</p>
                </div>
              </div>
            </div>

            {/* Small video */}
            <div className="col-span-2">
              <div className="relative aspect-square bg-gradient-to-br from-secondary/20 to-muted/20 rounded-lg overflow-hidden shadow-lg">
                <video 
                  className="w-full h-full object-cover"
                  autoPlay 
                  loop 
                  muted 
                  playsInline
                >
                  <source src="/completion-video.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-black/20 hover:bg-black/10 transition-colors"></div>
                <div className="absolute bottom-2 left-2 text-white">
                  <h3 className="font-semibold text-xs">Maya</h3>
                </div>
              </div>
            </div>

            {/* Tall video */}
            <div className="col-span-3 row-span-2">
              <div className="relative aspect-[3/4] bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg overflow-hidden shadow-lg">
                <div className="w-full h-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center">
                  <div className="text-center text-white">
                    <h3 className="font-semibold mb-2">Carmen</h3>
                    <p className="text-sm opacity-90">Data Analyst</p>
                    <div className="mt-4 text-xs opacity-75">Coming Soon</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Wide video */}
            <div className="col-span-5">
              <div className="relative aspect-[16/9] bg-gradient-to-br from-secondary/20 to-primary/20 rounded-lg overflow-hidden shadow-lg">
                <div className="w-full h-full bg-gradient-to-br from-green-500/30 to-blue-500/30 flex items-center justify-center">
                  <div className="text-center text-white">
                    <h3 className="font-semibold mb-2">Theo</h3>
                    <p className="text-sm opacity-90">Platform Engineer</p>
                    <div className="mt-4 text-xs opacity-75">Coming Soon</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Medium square */}
            <div className="col-span-2">
              <div className="relative aspect-square bg-gradient-to-br from-accent/20 to-secondary/20 rounded-lg overflow-hidden shadow-lg">
                <div className="w-full h-full bg-gradient-to-br from-pink-500/30 to-orange-500/30 flex items-center justify-center">
                  <div className="text-center text-white">
                    <h3 className="font-semibold text-sm">Fiona</h3>
                    <p className="text-xs opacity-90">Designer</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Small horizontal */}
            <div className="col-span-3">
              <div className="relative aspect-video bg-gradient-to-br from-muted/20 to-primary/20 rounded-lg overflow-hidden shadow-lg">
                <div className="w-full h-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center">
                  <div className="text-center text-white">
                    <h3 className="font-semibold text-sm">Luna</h3>
                    <p className="text-xs opacity-90">Content Creator</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Another medium */}
            <div className="col-span-2">
              <div className="relative aspect-[3/4] bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg overflow-hidden shadow-lg">
                <div className="w-full h-full bg-gradient-to-br from-teal-500/30 to-cyan-500/30 flex items-center justify-center">
                  <div className="text-center text-white">
                    <h3 className="font-semibold text-sm">Kai</h3>
                    <p className="text-xs opacity-90">QA Engineer</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-12">
          <header className="mb-6 text-center">
            <h2 className="text-3xl font-semibold text-foreground">Assemble your mission crew</h2>
            <p className="text-sm text-muted-foreground">Browse projects by function, pick what you need, and launch tasks through the assigned agents. Click any card to open the workflow instantly.</p>
          </header>
          <ContactOrder agents={[{
          name: "Yumi",
          image: aliceProfile
        }, {
          name: "Ben",
          image: benProfile
        }]} ariaLabel="Suggested contact order" />
          <FunctionMap profiles={{
          yumi: aliceProfile,
          ben: benProfile
        }} onProfileClick={handleProfileClick} highlightName={highlightName ?? undefined} />
        </section>
      </div>

      {/* Coming Soon Modal */}
      <AlertDialog open={comingSoonOpen} onOpenChange={setComingSoonOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Coming soon</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedName ? `${selectedName} 기능은 곧 제공될 예정입니다.` : "해당 기능은 곧 제공될 예정입니다."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction autoFocus>확인</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>;
};
export default Home;