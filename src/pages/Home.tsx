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
                <div className="flex items-start justify-center space-x-8 min-w-max px-8">
                  
                  {/* CEO */}
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center overflow-hidden">
                      <img src="/lovable-uploads/fcb326f6-bbbd-49c3-b925-8527956f0952.png" alt="CEO" className="w-full h-full object-cover rounded-full" />
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
                           <img src="/lovable-uploads/82747213-07b4-4f0d-9074-7fb071ddef47.png" alt="Team Member" className="w-6 h-6 rounded-full object-cover" />
                           <img src="/lovable-uploads/6f3f8681-fbf3-47a3-a21d-74688bc3c2a1.png" alt="Team Member" className="w-6 h-6 rounded-full object-cover" />
                        </div>
                      </div>
                      
                      {/* Team 2 */}
                      <div className="flex flex-col items-center space-y-2">
                        <div className="w-10 h-10 rounded-full bg-secondary/70 flex items-center justify-center overflow-hidden">
                          <img src="/lovable-uploads/5685e774-8cac-4504-b265-453f46b19fb7.png" alt="Team Leader" className="w-full h-full object-cover rounded-full" />
                        </div>
                        <div className="flex space-x-1">
                          <img src="/lovable-uploads/8d5f023d-d8c9-4e4d-929a-77aa58673cad.png" alt="Team Member" className="w-6 h-6 rounded-full object-cover" />
                          <img src="/lovable-uploads/c2aed439-b50f-4319-bf45-0910935b7026.png" alt="Team Member" className="w-6 h-6 rounded-full object-cover" />
                        </div>
                      </div>
                      
                      {/* Team 3 */}
                      <div className="flex flex-col items-center space-y-2">
                         <div className="w-10 h-10 rounded-full bg-secondary/70 flex items-center justify-center overflow-hidden">
                           <img src="/lovable-uploads/32ec5171-e196-4f95-8587-d5b2703903da.png" alt="Marketing Team Leader" className="w-full h-full object-cover rounded-full" />
                         </div>
                        <div className="flex space-x-1">
                          <img src="/lovable-uploads/c1a0dd5b-99cd-4793-bc0d-2e72d34cd95b.png" alt="Team Member" className="w-6 h-6 rounded-full object-cover" />
                          <img src="/lovable-uploads/7e12f3d9-6831-4df4-a243-dc275bc3b6e8.png" alt="Team Member" className="w-6 h-6 rounded-full object-cover" />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Platform Division */}
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-r from-accent to-accent/80 flex items-center justify-center overflow-hidden">
                      <img src="/lovable-uploads/02f4bac4-be03-4759-823e-9d54f558fc2d.png" alt="Platform Division Leader" className="w-full h-full object-cover rounded-full" />
                    </div>
                    <div className="text-xs text-muted-foreground">Platform</div>
                    
                    {/* Platform Teams - horizontal layout */}
                    <div className="flex space-x-6 pt-2">
                      {/* Team 1 */}
                      <div className="flex flex-col items-center space-y-2">
                        <div className="w-10 h-10 rounded-full bg-accent/70 flex items-center justify-center overflow-hidden">
                          <img src="/lovable-uploads/905fe76d-8767-438c-8459-744f8aadaf4e.png" alt="Team Leader" className="w-full h-full object-cover rounded-full" />
                        </div>
                        <div className="flex space-x-1">
                          <img src="/lovable-uploads/b3383460-9b5b-4286-ae1f-c001292d80a2.png" alt="Team Member" className="w-6 h-6 rounded-full object-cover" />
                          <img src="/lovable-uploads/a14b0aca-148c-4a8d-86a4-917df413b6d2.png" alt="Team Member" className="w-6 h-6 rounded-full object-cover" />
                        </div>
                      </div>
                      
                      {/* Team 2 */}
                      <div className="flex flex-col items-center space-y-2">
                         <div className="w-10 h-10 rounded-full bg-accent/70 flex items-center justify-center overflow-hidden">
                           <img src="/lovable-uploads/2d99278f-ae55-4162-bab6-01b390562a09.png" alt="Platform Team Leader" className="w-full h-full object-cover rounded-full" />
                         </div>
                        <div className="flex space-x-1">
                           <img src="/lovable-uploads/2dd93d2e-af06-4d8f-9aae-988817339d5a.png" alt="Platform Team Member" className="w-6 h-6 rounded-full object-cover" />
                          <img src="/lovable-uploads/c290987e-0f8e-4025-9cb5-b3e080044311.png" alt="Platform Team Member" className="w-6 h-6 rounded-full object-cover" />
                        </div>
                      </div>
                      
                      {/* Team 3 */}
                      <div className="flex flex-col items-center space-y-2">
                         <div className="w-10 h-10 rounded-full bg-accent/70 flex items-center justify-center overflow-hidden">
                           <img src="/lovable-uploads/de6b668b-a68e-44f0-8da8-2f5bfe8a6545.png" alt="Platform Team Leader" className="w-full h-full object-cover rounded-full" />
                         </div>
                        <div className="flex space-x-1">
                          <img src="/lovable-uploads/16ed2f1f-c52c-43a9-bbb2-85c5c6350585.png" alt="Platform Team Member" className="w-6 h-6 rounded-full object-cover" />
                           <img src="/lovable-uploads/3491b460-323e-4696-98c0-0a4409d989ae.png" alt="Platform Team Member" className="w-6 h-6 rounded-full object-cover" />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Data Division */}
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-r from-muted to-muted-foreground flex items-center justify-center overflow-hidden">
                      <img src="/lovable-uploads/1b5b8654-3203-4e33-be69-e907fb27ac94.png" alt="Data Division Leader" className="w-full h-full object-cover rounded-full" />
                    </div>
                    <div className="text-xs text-muted-foreground">Data</div>
                    
                    {/* Data Teams - horizontal layout (only 2 teams) */}
                    <div className="flex space-x-6 pt-2">
                      {/* Team 1 */}
                      <div className="flex flex-col items-center space-y-2">
                        <div className="w-10 h-10 rounded-full bg-muted-foreground/70 flex items-center justify-center overflow-hidden">
                          <img src="/lovable-uploads/bd844b95-e80c-416b-99b0-6fd44b496446.png" alt="Team Leader" className="w-full h-full object-cover rounded-full" />
                        </div>
                        <div className="flex space-x-1">
                          <img src="/lovable-uploads/c26e249e-7abe-4de4-a935-06d74100326d.png" alt="Data Team Member" className="w-6 h-6 rounded-full object-cover" />
                          <img src="/lovable-uploads/739e7983-730a-45fa-906c-fbc3a25e91f0.png" alt="Data Team Member" className="w-6 h-6 rounded-full object-cover" />
                        </div>
                      </div>
                      
                      {/* Team 2 */}
                      <div className="flex flex-col items-center space-y-2">
                         <div className="w-10 h-10 rounded-full bg-muted-foreground/70 flex items-center justify-center overflow-hidden">
                           <img src="/lovable-uploads/06a59546-9642-4ea2-b042-3a1269a4ddb6.png" alt="Data Team Leader" className="w-full h-full object-cover rounded-full" />
                         </div>
                        <div className="flex space-x-1">
                          <img src="/lovable-uploads/b0e63467-129e-4f58-8d10-7bc3286ceda8.png" alt="Data Team Member" className="w-6 h-6 rounded-full object-cover" />
                          <img src="/lovable-uploads/0012d8bd-afeb-4707-bdfc-38991640fce3.png" alt="Data Team Member" className="w-6 h-6 rounded-full object-cover" />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Fulfillment Division */}
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-r from-green-600 to-green-500 flex items-center justify-center overflow-hidden">
                      <img src="/lovable-uploads/d3831808-cb36-4e20-8f66-0d0150809a1e.png" alt="Fulfillment Division Leader" className="w-full h-full object-cover rounded-full" />
                    </div>
                    <div className="text-xs text-muted-foreground">Fulfillment</div>
                    
                    {/* Fulfillment Team */}
                    <div className="flex space-x-6 pt-2">
                      <div className="flex flex-col items-center space-y-2">
                         <div className="w-10 h-10 rounded-full bg-green-600/70 flex items-center justify-center overflow-hidden">
                           <img src="/lovable-uploads/6169bcda-23e9-44e6-aaa2-dfc83bf8f979.png" alt="Fulfillment Team Leader" className="w-full h-full object-cover rounded-full" />
                         </div>
                        <div className="flex space-x-1">
                          <div className="w-6 h-6 rounded-full bg-green-600/50"></div>
                          <div className="w-6 h-6 rounded-full bg-green-600/50"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* B2C Subs Capability Boost Division */}
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-purple-500 flex items-center justify-center">
                      <span className="text-white text-xs">B2C</span>
                    </div>
                    <div className="text-xs text-muted-foreground">B2C Subs</div>
                    
                    {/* B2C Subs Team */}
                    <div className="flex space-x-6 pt-2">
                      <div className="flex flex-col items-center space-y-2">
                         <div className="w-10 h-10 rounded-full bg-purple-600/70 flex items-center justify-center overflow-hidden">
                           <img src="/lovable-uploads/2b8c5249-1718-435b-b317-0753f79040fc.png" alt="B2C Team Leader" className="w-full h-full object-cover rounded-full" />
                         </div>
                        <div className="flex space-x-1">
                          <img src="/lovable-uploads/3f553423-99c2-46ad-99b2-874c48d94ff7.png" alt="B2C Team Member" className="w-6 h-6 rounded-full object-cover" />
                          <div className="w-6 h-6 rounded-full bg-purple-600/50"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-center text-xs text-muted-foreground mt-6">
                  26 members across 5 divisions, 11 teams
                </div>
              </div>
            </div>
          </Card>
        </div>



        

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