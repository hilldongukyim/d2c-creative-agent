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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-6 relative overflow-hidden">
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
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground/80 text-center">Org Chart</h3>
              
              {/* Hierarchical org chart */}
              <div className="overflow-x-auto">
                {/* Top level - President */}
                <div className="flex flex-col items-center space-y-3">
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-yellow-600 to-yellow-500 flex items-center justify-center overflow-hidden">
                      <img src="/lovable-uploads/33c98f89-515a-41e9-8fb3-e8cd68137c7c.png" alt="President" className="w-full h-full object-cover rounded-full" loading="lazy" />
                    </div>
                    <div className="text-xs text-muted-foreground">President</div>
                  </div>
                  
                  {/* Connecting lines from President */}
                  <div className="relative w-32 h-6 mx-auto">
                    {/* Center vertical line from President */}
                    <div className="absolute left-1/2 top-0 w-0.5 h-4 bg-muted-foreground/30 transform -translate-x-1/2"></div>
                    {/* Horizontal line */}
                    <div className="absolute top-4 left-2 right-2 h-0.5 bg-muted-foreground/30"></div>
                    {/* Vertical lines to 2 leaders */}
                    <div className="absolute left-6 top-4 w-0.5 h-4 bg-muted-foreground/30"></div> {/* D2C Leader */}
                    <div className="absolute right-6 top-4 w-0.5 h-4 bg-muted-foreground/30"></div> {/* Operations Leader */}
                  </div>
                  
                  {/* Second level - 2 Leaders */}
                  <div className="flex items-start justify-center space-x-16">
                    {/* D2C Leader */}
                    <div className="flex flex-col items-center space-y-3">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center overflow-hidden">
                        <img src="/lovable-uploads/fcb326f6-bbbd-49c3-b925-8527956f0952.png" alt="D2C Leader" className="w-full h-full object-cover rounded-full" loading="lazy" />
                      </div>
                      <div className="text-xs text-muted-foreground">D2C</div>
                      
                      {/* Connecting lines from D2C Leader to 3 divisions */}
                      <div className="relative w-64 h-8 ml-0">
                        {/* Center vertical line from D2C Leader */}
                        <div className="absolute left-1/2 top-0 w-0.5 h-4 bg-muted-foreground/30 transform -translate-x-1/2"></div>
                        {/* Horizontal line */}
                        <div className="absolute top-4 left-8 right-8 h-0.5 bg-muted-foreground/30"></div>
                        {/* Vertical lines to 3 divisions */}
                        <div className="absolute left-12 top-4 w-0.5 h-4 bg-muted-foreground/30"></div> {/* Marketing */}
                        <div className="absolute left-1/2 top-4 w-0.5 h-4 bg-muted-foreground/30 transform -translate-x-1/2"></div> {/* Platform */}
                        <div className="absolute right-12 top-4 w-0.5 h-4 bg-muted-foreground/30"></div> {/* Data */}
                      </div>
                    </div>

                    {/* Operations Leader */}
                    <div className="flex flex-col items-center space-y-3">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-r from-orange-600 to-orange-500 flex items-center justify-center overflow-hidden">
                        <img src="/lovable-uploads/fe79c60e-6e86-4d92-946e-06c96aadda7a.png" alt="Operations Leader" className="w-full h-full object-cover rounded-full" loading="lazy" />
                      </div>
                      <div className="text-xs text-muted-foreground">Leader</div>
                      
                      {/* Connecting lines from Operations Leader to 2 divisions */}
                      <div className="relative w-32 h-8 ml-0">
                        {/* Center vertical line from Operations Leader */}
                        <div className="absolute left-1/2 top-0 w-0.5 h-4 bg-muted-foreground/30 transform -translate-x-1/2"></div>
                        {/* Horizontal line */}
                        <div className="absolute top-4 left-4 right-4 h-0.5 bg-muted-foreground/30"></div>
                        {/* Vertical lines to 2 divisions */}
                        <div className="absolute left-6 top-4 w-0.5 h-4 bg-muted-foreground/30"></div> {/* B2C Subs */}
                        <div className="absolute right-6 top-4 w-0.5 h-4 bg-muted-foreground/30"></div> {/* Fulfillment */}
                      </div>
                    </div>
                  </div>
                  
                  {/* Third level - Combined divisions under both leaders */}
                  <div className="flex items-start justify-center space-x-8">
                    {/* D2C Leader's divisions */}
                    <div className="flex items-start justify-center space-x-6">
                        {/* Marketing Division */}
                        <div className="flex flex-col items-center space-y-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-secondary to-secondary/80 flex items-center justify-center overflow-hidden">
                            <img src="/lovable-uploads/c33a87ea-fc09-484a-a916-58c9777a1e25.png" alt="Marketing Division Leader" className="w-full h-full object-cover rounded-full" loading="lazy" />
                          </div>
                          <div className="text-xs text-muted-foreground">Marketing</div>
                          
                          {/* Connecting bracket-style line to marketing teams */}
                          <div className="flex justify-center pt-0">
                            <div className="relative w-24 h-6">
                              {/* Center vertical line */}
                              <div className="absolute left-1/2 top-0 w-0.5 h-4 bg-muted-foreground/40 transform -translate-x-1/2"></div>
                              {/* Horizontal connecting line */}
                              <div className="absolute top-4 left-2 right-2 h-0.5 bg-muted-foreground/40"></div>
                              {/* Left vertical line */}
                              <div className="absolute left-2 top-4 w-0.5 h-2 bg-muted-foreground/40"></div>
                              {/* Right vertical line */}
                              <div className="absolute right-2 top-4 w-0.5 h-2 bg-muted-foreground/40"></div>
                            </div>
                          </div>
                          
                          {/* Marketing Teams - horizontal layout */}
                          <div className="flex space-x-4 pt-0">
                            {/* Team 1 */}
                             <div className="flex flex-col items-center space-y-1">
                              <div className="w-8 h-8 rounded-full bg-secondary/70 flex items-center justify-center overflow-hidden">
                                <img src="/lovable-uploads/a77cc591-3d95-420e-91cf-6dcd3459c0c9.png" alt="Team Leader" className="w-full h-full object-cover rounded-full" loading="lazy" />
                              </div>
                              <div className="flex space-x-1">
                                 <img src="/lovable-uploads/82747213-07b4-4f0d-9074-7fb071ddef47.png" alt="Team Member" className="w-4 h-4 rounded-full object-cover" loading="lazy" />
                                 <img src="/lovable-uploads/6f3f8681-fbf3-47a3-a21d-74688bc3c2a1.png" alt="Team Member" className="w-4 h-4 rounded-full object-cover" loading="lazy" />
                              </div>
                            </div>
                            
                            {/* Team 2 */}
                             <div className="flex flex-col items-center space-y-1">
                              <div className="w-8 h-8 rounded-full bg-secondary/70 flex items-center justify-center overflow-hidden">
                                <img src="/lovable-uploads/5685e774-8cac-4504-b265-453f46b19fb7.png" alt="Team Leader" className="w-full h-full object-cover rounded-full" loading="lazy" />
                              </div>
                              <div className="flex space-x-1">
                                <img src="/lovable-uploads/8d5f023d-d8c9-4e4d-929a-77aa58673cad.png" alt="Team Member" className="w-4 h-4 rounded-full object-cover" loading="lazy" />
                                <img src="/lovable-uploads/c2aed439-b50f-4319-bf45-0910935b7026.png" alt="Team Member" className="w-4 h-4 rounded-full object-cover" loading="lazy" />
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Platform Division */}
                        <div className="flex flex-col items-center space-y-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-accent to-accent/80 flex items-center justify-center overflow-hidden">
                            <img src="/lovable-uploads/02f4bac4-be03-4759-823e-9d54f558fc2d.png" alt="Platform Division Leader" className="w-full h-full object-cover rounded-full" loading="lazy" />
                          </div>
                          <div className="text-xs text-muted-foreground">Platform</div>
                          
                          {/* Connecting bracket-style line to platform teams */}
                          <div className="flex justify-center pt-0">
                            <div className="relative w-24 h-6">
                              {/* Center vertical line */}
                              <div className="absolute left-1/2 top-0 w-0.5 h-4 bg-muted-foreground/40 transform -translate-x-1/2"></div>
                              {/* Horizontal connecting line */}
                              <div className="absolute top-4 left-2 right-2 h-0.5 bg-muted-foreground/40"></div>
                              {/* Left vertical line */}
                              <div className="absolute left-2 top-4 w-0.5 h-2 bg-muted-foreground/40"></div>
                              {/* Right vertical line */}
                              <div className="absolute right-2 top-4 w-0.5 h-2 bg-muted-foreground/40"></div>
                            </div>
                          </div>
                          <div className="flex space-x-4 pt-0">
                            {/* Team 1 */}
                             <div className="flex flex-col items-center space-y-1">
                              <div className="w-8 h-8 rounded-full bg-accent/70 flex items-center justify-center overflow-hidden">
                                <img src="/lovable-uploads/905fe76d-8767-438c-8459-744f8aadaf4e.png" alt="Team Leader" className="w-full h-full object-cover rounded-full" loading="lazy" />
                              </div>
                              <div className="flex space-x-1">
                                <img src="/lovable-uploads/b3383460-9b5b-4286-ae1f-c001292d80a2.png" alt="Team Member" className="w-4 h-4 rounded-full object-cover" loading="lazy" />
                                <img src="/lovable-uploads/a14b0aca-148c-4a8d-86a4-917df413b6d2.png" alt="Team Member" className="w-4 h-4 rounded-full object-cover" loading="lazy" />
                              </div>
                            </div>
                            
                            {/* Team 2 */}
                             <div className="flex flex-col items-center space-y-1">
                               <div className="w-8 h-8 rounded-full bg-accent/70 flex items-center justify-center overflow-hidden">
                                 <img src="/lovable-uploads/2d99278f-ae55-4162-bab6-01b390562a09.png" alt="Platform Team Leader" className="w-full h-full object-cover rounded-full" loading="lazy" />
                               </div>
                              <div className="flex space-x-1">
                                 <img src="/lovable-uploads/2dd93d2e-af06-4d8f-9aae-988817339d5a.png" alt="Platform Team Member" className="w-4 h-4 rounded-full object-cover" loading="lazy" />
                                <img src="/lovable-uploads/c290987e-0f8e-4025-9cb5-b3e080044311.png" alt="Platform Team Member" className="w-4 h-4 rounded-full object-cover" loading="lazy" />
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Data Division */}
                        <div className="flex flex-col items-center space-y-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-muted to-muted-foreground flex items-center justify-center overflow-hidden">
                            <img src="/lovable-uploads/1b5b8654-3203-4e33-be69-e907fb27ac94.png" alt="Data Division Leader" className="w-full h-full object-cover rounded-full" loading="lazy" />
                          </div>
                          <div className="text-xs text-muted-foreground">Data</div>
                          
                          {/* Connecting bracket-style line to data teams */}
                          <div className="flex justify-center pt-0">
                            <div className="relative w-16 h-6">
                              {/* Center vertical line */}
                              <div className="absolute left-1/2 top-0 w-0.5 h-4 bg-muted-foreground/40 transform -translate-x-1/2"></div>
                              {/* Horizontal connecting line */}
                              <div className="absolute top-4 left-2 right-2 h-0.5 bg-muted-foreground/40"></div>
                              {/* Left vertical line */}
                              <div className="absolute left-2 top-4 w-0.5 h-2 bg-muted-foreground/40"></div>
                              {/* Right vertical line */}
                              <div className="absolute right-2 top-4 w-0.5 h-2 bg-muted-foreground/40"></div>
                            </div>
                          </div>
                          <div className="flex space-x-4 pt-0">
                            {/* Team 1 */}
                             <div className="flex flex-col items-center space-y-1">
                              <div className="w-8 h-8 rounded-full bg-muted-foreground/70 flex items-center justify-center overflow-hidden">
                                <img src="/lovable-uploads/bd844b95-e80c-416b-99b0-6fd44b496446.png" alt="Team Leader" className="w-full h-full object-cover rounded-full" loading="lazy" />
                              </div>
                              <div className="flex space-x-1">
                                <img src="/lovable-uploads/c26e249e-7abe-4de4-a935-06d74100326d.png" alt="Data Team Member" className="w-4 h-4 rounded-full object-cover" loading="lazy" />
                                <img src="/lovable-uploads/739e7983-730a-45fa-906c-fbc3a25e91f0.png" alt="Data Team Member" className="w-4 h-4 rounded-full object-cover" loading="lazy" />
                              </div>
                            </div>
                            
                            {/* Team 2 */}
                             <div className="flex flex-col items-center space-y-1">
                               <div className="w-8 h-8 rounded-full bg-muted-foreground/70 flex items-center justify-center overflow-hidden">
                                 <img src="/lovable-uploads/06a59546-9642-4ea2-b042-3a1269a4ddb6.png" alt="Data Team Leader" className="w-full h-full object-cover rounded-full" loading="lazy" />
                               </div>
                              <div className="flex space-x-1">
                                <img src="/lovable-uploads/b0e63467-129e-4f58-8d10-7bc3286ceda8.png" alt="Data Team Member" className="w-4 h-4 rounded-full object-cover" loading="lazy" />
                                <img src="/lovable-uploads/0012d8bd-afeb-4707-bdfc-38991640fce3.png" alt="Data Team Member" className="w-4 h-4 rounded-full object-cover" loading="lazy" />
                              </div>
                            </div>
                          </div>
                        </div>
                    </div>
                    
                    {/* Operations Leader's divisions */}
                    <div className="flex items-start justify-center space-x-6">
                      {/* B2C Subs Division */}
                       <div className="flex flex-col items-center space-y-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-purple-500 flex items-center justify-center overflow-hidden">
                          <img src="/lovable-uploads/075d631e-1e67-4f0a-b744-36705e88b752.png" alt="B2C Division Leader" className="w-full h-full object-cover rounded-full" loading="lazy" />
                        </div>
                        <div className="text-xs text-muted-foreground">B2C Subs</div>
                        
                        {/* Connecting bracket-style line to B2C team */}
                        <div className="flex justify-center pt-0">
                          <div className="relative w-16 h-6">
                            {/* Center vertical line */}
                            <div className="absolute left-1/2 top-0 w-0.5 h-4 bg-muted-foreground/40 transform -translate-x-1/2"></div>
                            {/* Horizontal connecting line - shorter for single team */}
                            <div className="absolute top-4 left-4 right-4 h-0.5 bg-muted-foreground/40"></div>
                            {/* Left vertical line */}
                            <div className="absolute left-4 top-4 w-0.5 h-2 bg-muted-foreground/40"></div>
                            {/* Right vertical line */}
                            <div className="absolute right-4 top-4 w-0.5 h-2 bg-muted-foreground/40"></div>
                          </div>
                        </div>
                        <div className="flex space-x-4 pt-0">
                          {/* Team 1 */}
                           <div className="flex flex-col items-center space-y-1">
                             <div className="w-8 h-8 rounded-full bg-purple-600/70 flex items-center justify-center overflow-hidden">
                               <img src="/lovable-uploads/2b8c5249-1718-435b-b317-0753f79040fc.png" alt="B2C Team Leader" className="w-full h-full object-cover rounded-full" loading="lazy" />
                             </div>
                            <div className="flex space-x-1">
                              <img src="/lovable-uploads/3f553423-99c2-46ad-99b2-874c48d94ff7.png" alt="B2C Team Member" className="w-4 h-4 rounded-full object-cover" loading="lazy" />
                              <img src="/lovable-uploads/3d75cb03-c221-498d-9637-6340d614cbd6.png" alt="B2C Team Member" className="w-4 h-4 rounded-full object-cover" loading="lazy" />
                            </div>
                          </div>

                          {/* Team 2 */}
                           <div className="flex flex-col items-center space-y-1">
                             <div className="w-8 h-8 rounded-full bg-purple-600/70 flex items-center justify-center overflow-hidden">
                               <img src="/lovable-uploads/d18ff2c4-e8c7-4c44-b38c-74bb66e23393.png" alt="B2C Team Leader" className="w-full h-full object-cover rounded-full" loading="lazy" />
                             </div>
                            <div className="flex space-x-1">
                              <img src="/lovable-uploads/16ed2f1f-c52c-43a9-bbb2-85c5c6350585.png" alt="B2C Team Member" className="w-4 h-4 rounded-full object-cover" loading="lazy" />
                              <img src="/lovable-uploads/1e050018-12f0-4df5-a7ae-c92735447a6d.png" alt="B2C Team Member" className="w-4 h-4 rounded-full object-cover" loading="lazy" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Fulfillment Division */}
                      <div className="flex flex-col items-center space-y-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-destructive to-destructive/80 flex items-center justify-center overflow-hidden">
                          <img src="/lovable-uploads/5c13c299-f9c2-46a9-9b91-4695964179a5.png" alt="Fulfillment Division Leader" className="w-full h-full object-cover rounded-full" loading="lazy" />
                        </div>
                        <div className="text-xs text-muted-foreground">Fulfillment</div>
                        
                        {/* Connecting bracket-style line to fulfillment teams */}
                        <div className="flex justify-center pt-0">
                          <div className="relative w-16 h-6">
                            {/* Center vertical line */}
                            <div className="absolute left-1/2 top-0 w-0.5 h-4 bg-muted-foreground/40 transform -translate-x-1/2"></div>
                            {/* Horizontal connecting line */}
                            <div className="absolute top-4 left-2 right-2 h-0.5 bg-muted-foreground/40"></div>
                            {/* Left vertical line */}
                            <div className="absolute left-2 top-4 w-0.5 h-2 bg-muted-foreground/40"></div>
                            {/* Right vertical line */}
                            <div className="absolute right-2 top-4 w-0.5 h-2 bg-muted-foreground/40"></div>
                          </div>
                        </div>
                        <div className="flex space-x-4 pt-0">
                          {/* Team 1 */}
                           <div className="flex flex-col items-center space-y-1">
                            <div className="w-8 h-8 rounded-full bg-destructive/70 flex items-center justify-center overflow-hidden">
                              <img src="/lovable-uploads/66fb2463-85b8-437c-9a16-afdb1c8b3861.png" alt="Team Leader" className="w-full h-full object-cover rounded-full" loading="lazy" />
                            </div>
                            <div className="flex space-x-1">
                              <img src="/lovable-uploads/5a6db127-b9e3-4f85-afbb-11b477555583.png" alt="Team Member" className="w-4 h-4 rounded-full object-cover" loading="lazy" />
                              <img src="/lovable-uploads/ef02f79b-cece-4218-b074-9bf4ff7ba7ae.png" alt="Team Member" className="w-4 h-4 rounded-full object-cover" loading="lazy" />
                            </div>
                          </div>
                          
                          {/* Team 2 */}
                           <div className="flex flex-col items-center space-y-1">
                            <div className="w-8 h-8 rounded-full bg-destructive/70 flex items-center justify-center overflow-hidden">
                              <img src="/lovable-uploads/c67db3d8-8cdc-426a-80e4-b8e7b6bf4604.png" alt="Team Leader" className="w-full h-full object-cover rounded-full" loading="lazy" />
                            </div>
                            <div className="flex space-x-1">
                              <img src="/lovable-uploads/6e1f62a8-db94-4fca-a06b-f9b8f7b3567c.png" alt="Team Member" className="w-4 h-4 rounded-full object-cover" loading="lazy" />
                              <img src="/lovable-uploads/0984d14e-1c85-48e9-9be5-953e3bc72d9a.png" alt="Team Member" className="w-4 h-4 rounded-full object-cover" loading="lazy" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
                
              <div className="text-center text-xs text-muted-foreground mt-8">
                27 members across 5 divisions, 11 teams, 2 leaders
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
            <AlertDialogTitle>On the Job Training</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedName ? `${selectedName} will be coming soon.` : "This feature will be coming soon."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction autoFocus>Close</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Home;