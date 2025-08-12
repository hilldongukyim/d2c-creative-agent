import { FC } from "react";
import { ArrowRight } from "lucide-react";
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

const ContactOrder: FC<ContactOrderProps> = ({ agents, ariaLabel = "Suggested contact order" }) => {
  if (!agents?.length) return null;

  return (
    <aside aria-label={ariaLabel} className="mt-4">
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
            {idx < agents.length - 1 && (
              <ArrowRight className="ml-3 mr-3 h-4 w-4 text-muted-foreground" aria-hidden="true" />
            )}
          </li>
        ))}
      </ol>
    </aside>
  );
};

export default ContactOrder;
