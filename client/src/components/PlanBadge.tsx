import { Crown, Sparkles, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PlanBadgeProps {
  plan: "free" | "student" | "student_plus" | "family";
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

const PLAN_CONFIG = {
  free: {
    label: "Gratuito",
    color: "bg-gray-100 text-gray-700 border-gray-300",
    icon: null,
  },
  student: {
    label: "Estudante",
    color: "bg-blue-100 text-blue-700 border-blue-300",
    icon: Sparkles,
  },
  student_plus: {
    label: "Estudante+",
    color: "bg-teal-100 text-teal-700 border-teal-300",
    icon: Crown,
  },
  family: {
    label: "Família",
    color: "bg-purple-100 text-purple-700 border-purple-300",
    icon: Users,
  },
};

export function PlanBadge({ plan, size = "md", showIcon = true }: PlanBadgeProps) {
  const config = PLAN_CONFIG[plan];
  const Icon = config.icon;

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5",
  };

  return (
    <Badge
      variant="outline"
      className={`${config.color} ${sizeClasses[size]} font-medium border`}
    >
      {showIcon && Icon && <Icon className="h-3 w-3 mr-1" />}
      {config.label}
    </Badge>
  );
}
