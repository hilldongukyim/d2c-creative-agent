import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PTOGallery = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">PTO Gallery Creator</CardTitle>
            <CardDescription className="text-lg">
              This feature is coming soon! The PTO gallery creation system will be integrated here.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-6">
              This page will host the PTO model gallery creation functionality. 
              You can integrate your existing PTO gallery project here or build new features.
            </p>
            <Button variant="outline" size="lg">
              Coming Soon
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PTOGallery;