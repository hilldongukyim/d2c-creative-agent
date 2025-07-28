import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, ExternalLink, AlertCircle, Play, BarChart3, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { RequestCheckForm } from "./RequestCheckForm";
import { KangarooAnimation } from "./KangarooAnimation";
import { WebhookSettings } from "./WebhookSettings";

type WorkflowStatus = "pending" | "running" | "completed" | "error";

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  status: WorkflowStatus;
  n8nUrl?: string;
}

const WorkflowDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showWebhookSettings, setShowWebhookSettings] = useState(false);
  const [webhooks, setWebhooks] = useState<Record<string, string>>({
    "kv-creation": "",
    "size-variation": "",
    "get-outputs": ""
  });
  
  const [workflows, setWorkflows] = useState<WorkflowStep[]>([
    {
      id: "request",
      title: "Request",
      description: "Run N8N workflow to read and process the request form",
      status: "pending",
      n8nUrl: ""
    },
    {
      id: "creation",
      title: "Creation",
      description: "Run N8N workflow to get template PSD, replace images, add text, and create size variations",
      status: "pending",
      n8nUrl: ""
    },
    {
      id: "review",
      title: "Review",
      description: "See all outputs - review the results and leave comments if anything needs to be fixed",
      status: "pending",
      n8nUrl: ""
    },
    {
      id: "get-outputs",
      title: "Get Outputs",
      description: "Click to download all the finalized files",
      status: "pending",
      n8nUrl: ""
    }
  ]);

  // Webhook listener simulation (in a real app, this would be handled by your backend)
  useEffect(() => {
    const handleWebhookMessage = (event: MessageEvent) => {
      if (event.data.type === 'webhook_received' && event.data.workflowId) {
        setWorkflows(prev => 
          prev.map(workflow => 
            workflow.id === event.data.workflowId 
              ? { ...workflow, status: "completed" }
              : workflow
          )
        );
        
        toast({
          title: "Workflow Completed",
          description: `${workflows.find(w => w.id === event.data.workflowId)?.title} has been completed automatically.`,
        });
      }
    };

    window.addEventListener('message', handleWebhookMessage);
    return () => window.removeEventListener('message', handleWebhookMessage);
  }, [workflows, toast]);

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

  const handleWorkflowClick = (workflowId: string, n8nUrl?: string) => {
    if (workflowId === "request") {
      setShowRequestForm(true);
      return;
    }

    // For other workflows, just set them to running (no external popup)
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

  const handleRequestCheckComplete = () => {
    setWorkflows(prev => 
      prev.map(workflow => 
        workflow.id === "request" 
          ? { ...workflow, status: "completed" }
          : workflow
      )
    );
  };

  const handleWebhookUpdate = (workflowId: string, url: string) => {
    setWebhooks(prev => ({
      ...prev,
      [workflowId]: url
    }));
    
    setWorkflows(prev => 
      prev.map(workflow => 
        workflow.id === workflowId 
          ? { ...workflow, n8nUrl: url }
          : workflow
      )
    );
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
          
          {/* Header Controls */}
          <div className="flex justify-center gap-4 mt-4">
            <Button 
              onClick={() => navigate("/tasks")}
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              View All Tasks Overview
            </Button>
            
            <Button 
              onClick={() => setShowWebhookSettings(true)}
              variant="outline"
            >
              <Settings className="h-4 w-4 mr-2" />
              Webhook Settings
            </Button>
          </div>
          
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
              className={`p-6 transition-all duration-300 hover:shadow-card-custom cursor-pointer ${
                index === currentStep ? 'ring-2 ring-primary shadow-workflow' : ''
              }`}
              onClick={() => workflow.id === "request" && workflow.status === "pending" ? handleWorkflowClick(workflow.id, workflow.n8nUrl) : undefined}
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

                {/* Show Kangaroo Animation when running */}
                {workflow.status === "running" && workflow.id !== "request" && (
                  <div className="col-span-2 mt-4">
                    <KangarooAnimation 
                      workflowType={workflow.id as "creation" | "review" | "get-outputs"} 
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex-1" />
                <div className="flex items-center space-x-4">
                  <Badge 
                    variant="outline" 
                    className={`bg-${getStatusColor(workflow.status)} text-${getStatusColor(workflow.status)}-foreground border-${getStatusColor(workflow.status)}`}
                  >
                    <span className="flex items-center space-x-1">
                      {getStatusIcon(workflow.status)}
                      <span className="capitalize">
                        {workflow.status === "completed" && workflow.id === "request" ? "Submitted" : workflow.status}
                      </span>
                    </span>
                  </Badge>

                  <div className="flex space-x-2">
                    {workflow.status === "pending" && workflow.id !== "request" && (
                      <Button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleWorkflowClick(workflow.id, workflow.n8nUrl);
                        }}
                        className="bg-gradient-workflow hover:opacity-90"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Start Workflow
                      </Button>
                    )}

                    {workflow.n8nUrl && workflow.id !== "request" && workflow.status !== "running" && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(workflow.n8nUrl, "_blank");
                        }}
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

        <RequestCheckForm
          open={showRequestForm}
          onOpenChange={setShowRequestForm}
          onComplete={handleRequestCheckComplete}
        />
        
        <WebhookSettings
          open={showWebhookSettings}
          onOpenChange={setShowWebhookSettings}
          webhooks={webhooks}
          onWebhookUpdate={handleWebhookUpdate}
        />
      </div>
    </div>
  );
};

export default WorkflowDashboard;