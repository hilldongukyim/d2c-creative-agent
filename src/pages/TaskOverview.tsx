import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ClipboardList } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TaskOverview = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="text-foreground hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-4xl font-bold text-foreground">Task Overview</h1>
            <p className="text-muted-foreground">Promotional content creation tasks</p>
          </div>
        </div>

        <Card className="p-16 flex flex-col items-center justify-center text-center space-y-4">
          <ClipboardList className="h-12 w-12 text-muted-foreground/40" />
          <p className="text-lg font-medium text-muted-foreground">No tasks yet</p>
          <p className="text-sm text-muted-foreground/60">
            Tasks will appear here once connected to the workflow.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default TaskOverview;
