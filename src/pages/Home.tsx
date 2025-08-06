import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Briefcase, Image } from "lucide-react";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12 pt-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            AI Agent Selection
          </h1>
          <p className="text-xl text-muted-foreground">
            Choose your specialized AI agent for your creative needs
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Promotional Content Agent */}
          <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Briefcase className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Promotional Content Creator</CardTitle>
              <CardDescription className="text-base">
                Create compelling promotional materials with AI-powered workflow management
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <ul className="text-sm text-muted-foreground mb-6 space-y-2">
                <li>• Multi-step workflow management</li>
                <li>• Content review and approval</li>
                <li>• Webhook integration support</li>
                <li>• Collaborative feedback system</li>
              </ul>
              <Button 
                onClick={() => navigate("/promotional")}
                className="w-full"
                size="lg"
              >
                Start Promotional Workflow
              </Button>
            </CardContent>
          </Card>

          {/* PTO Gallery Agent */}
          <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Image className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">PTO Gallery Creator</CardTitle>
              <CardDescription className="text-base">
                Generate stunning gallery images using advanced PTO modeling techniques
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <ul className="text-sm text-muted-foreground mb-6 space-y-2">
                <li>• AI-powered image generation</li>
                <li>• PTO model optimization</li>
                <li>• Gallery management tools</li>
                <li>• High-quality output formats</li>
              </ul>
              <Button 
                onClick={() => navigate("/pto-gallery")}
                className="w-full"
                size="lg"
              >
                Create PTO Gallery
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Home;