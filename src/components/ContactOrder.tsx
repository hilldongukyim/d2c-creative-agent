import { FC } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Agent {
  name: string;
  image: string;
}

interface ContactOrderProps {
  agents: Agent[];
  ariaLabel?: string;
}

const initials = (name: string) => name.trim().charAt(0).toUpperCase();

const Connector: FC = () => (
  <svg className="mx-3 h-4 w-8 text-muted-foreground" viewBox="0 0 32 16" fill="none" aria-hidden="true">
    <defs>
      <marker id="co-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
        <path d="M0,0 L6,3 L0,6 Z" fill="currentColor" />
      </marker>
    </defs>
    <path d="M0 8 H30" stroke="currentColor" strokeWidth="2" markerEnd="url(#co-arrow)" />
  </svg>
);

const ContactOrder: FC<ContactOrderProps> = ({ agents, ariaLabel = "Suggested contact order" }) => {
  if (!agents?.length) return null;

  return (
    <aside aria-label={ariaLabel} className="mt-4 animate-fade-in">
      <ol className="flex items-center justify-center gap-3">
        {agents.map((agent, idx) => (
          <li key={agent.name} className="flex items-center">
            <div className="relative">
              <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                <AvatarImage src={agent.image} alt={`${agent.name} agent avatar`} loading="lazy" />
                <AvatarFallback aria-hidden>{initials(agent.name)}</AvatarFallback>
              </Avatar>
              <span className="absolute -top-1 -right-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
                {idx + 1}
              </span>
            </div>
            {idx < agents.length - 1 && <Connector /> }
          </li>
        ))}
      </ol>
    </aside>
  );
};

export default ContactOrder;
