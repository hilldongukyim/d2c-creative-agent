import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, ExternalLink, AlertCircle, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type WorkflowStatus = "pending" | "running" | "completed" | "error";

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  status: WorkflowStatus;
  n8nUrl?: string;
}

const WorkflowDashboard = () => {
  const { toast } = useToast();
  const [workflows, setWorkflows] = useState<WorkflowStep[]>([
    {
      id: "request-check",
      title: "Request Check",
      description: "Validate and review the promotional content request",
      status: "pending",
      n8nUrl: "https://your-n8n-instance.com/workflow/request-check"
    },
    {
      id: "kv-creation",
      title: "1st KV Creation",
      description: "Generate the initial key visual design",
      status: "pending",
      n8nUrl: "https://your-n8n-instance.com/workflow/kv-creation"
    },
    {
      id: "size-variation",
      title: "Size Variation",
      description: "Create different size variations of the content",
      status: "pending",
      n8nUrl: "https://your-n8n-instance.com/workflow/size-variation"
    },
    {
      id: "get-outputs",
      title: "Get the Outputs",
      description: "Finalize and deliver the promotional materials",
      status: "pending",
      n8nUrl: "https://your-n8n-instance.com/workflow/get-outputs"
    }
  ]);

  const getStatusColor = (status: WorkflowStatus) => {
    switch (status) {
      case "completed":
        return "workflow-success";
      case "running":
        return "workflow-pending";
      case "error":
        return "workflow-error";
      default:
        return "muted";
    }
  };

  const getStatusIcon = (status: WorkflowStatus) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5" />;
      case "running":
        return <Clock className="h-5 w-5 animate-spin" />;
      case "error":
        return <AlertCircle className="h-5 w-5" />;
      default:
        return <Play className="h-5 w-5" />;
    }
  };

  const handleStartWorkflow = (workflowId: string, n8nUrl?: string) => {
    if (n8nUrl) {
      window.open(n8nUrl, "_blank");
    }
    
    setWorkflows(prev => 
      prev.map(workflow => 
        workflow.id === workflowId 
          ? { ...workflow, status: "running" }
          : workflow
      )
    );

    toast({
      title: "Workflow Started",
      description: `${workflows.find(w => w.id === workflowId)?.title} workflow has been initiated.`,
    });
  };

  const handleConfirmCompletion = (workflowId: string) => {
    setWorkflows(prev => 
      prev.map(workflow => 
        workflow.id === workflowId 
          ? { ...workflow, status: "completed" }
          : workflow
      )
    );

    toast({
      title: "Workflow Confirmed",
      description: `${workflows.find(w => w.id === workflowId)?.title} has been marked as completed.`,
    });
  };

  const currentStep = workflows.findIndex(w => w.status === "pending" || w.status === "running");
  const completedSteps = workflows.filter(w => w.status === "completed").length;
  const progress = (completedSteps / workflows.length) * 100;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">
            Promotional Content Creation
          </h1>
          <p className="text-xl text-muted-foreground">
            Workflow Management Dashboard
          </p>
          
          {/* Progress Bar */}
          <div className="w-full bg-workflow-bg rounded-full h-3 mt-6">
            <div 
              className="bg-gradient-workflow h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            {completedSteps} of {workflows.length} steps completed
          </p>
        </div>

        {/* Workflow Steps */}
        <div className="grid gap-6">
          {workflows.map((workflow, index) => (
            <Card 
              key={workflow.id}
              className={`p-6 transition-all duration-300 hover:shadow-card-custom ${
                index === currentStep ? 'ring-2 ring-primary shadow-workflow' : ''
              } ${workflow.status === 'completed' ? 'animate-pulse-success' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-workflow-bg">
                    <span className="text-lg font-bold text-foreground">
                      {index + 1}
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    <h3 className="text-xl font-semibold text-foreground">
                      {workflow.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {workflow.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <Badge 
                    variant="outline" 
                    className={`bg-${getStatusColor(workflow.status)} text-${getStatusColor(workflow.status)}-foreground border-${getStatusColor(workflow.status)}`}
                  >
                    <span className="flex items-center space-x-1">
                      {getStatusIcon(workflow.status)}
                      <span className="capitalize">{workflow.status}</span>
                    </span>
                  </Badge>

                  <div className="flex space-x-2">
                    {workflow.status === "pending" && (
                      <Button 
                        onClick={() => handleStartWorkflow(workflow.id, workflow.n8nUrl)}
                        className="bg-gradient-workflow hover:opacity-90"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Start Workflow
                      </Button>
                    )}
                    
                    {workflow.status === "running" && (
                      <Button 
                        onClick={() => handleConfirmCompletion(workflow.id)}
                        variant="outline"
                        className="border-workflow-success text-workflow-success hover:bg-workflow-success hover:text-workflow-success-foreground"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Confirm Complete
                      </Button>
                    )}

                    {workflow.n8nUrl && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => window.open(workflow.n8nUrl, "_blank")}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Summary */}
        {completedSteps === workflows.length && (
          <Card className="p-6 text-center bg-gradient-workflow animate-fade-in">
            <CheckCircle className="h-16 w-16 mx-auto mb-4 text-primary-foreground" />
            <h2 className="text-2xl font-bold text-primary-foreground mb-2">
              All Workflows Completed!
            </h2>
            <p className="text-primary-foreground/80">
              Your promotional content creation process has been successfully completed.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default WorkflowDashboard;