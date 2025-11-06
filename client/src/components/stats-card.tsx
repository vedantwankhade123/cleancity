import React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon, ArrowRight } from "lucide-react";
import { Link } from "wouter";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  linkTo?: string;
  iconColor?: string;
  iconBgColor?: string;
  className?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  description,
  linkTo,
  iconColor = "text-primary",
  iconBgColor = "bg-primary/10",
  className,
}) => {
  const cardContent = (
    <Card className={cn("group transition-all duration-300 hover:shadow-lg hover:border-primary/30 hover:-translate-y-1", className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className={cn(
            "w-12 h-12 rounded-lg flex items-center justify-center shrink-0",
            iconBgColor
          )}>
            <Icon className={cn("h-6 w-6", iconColor)} />
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 mb-1">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
          </div>
        </div>
        <div className="mt-4 flex items-end justify-between min-h-[30px]">
          <p className="text-xs text-gray-500 max-w-[70%]">{description}</p>
          {linkTo && (
            <div className="flex items-center text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              View <ArrowRight className="ml-1 h-3 w-3" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (linkTo) {
    return <Link href={linkTo} className="focus:outline-none focus:ring-2 focus:ring-primary rounded-lg">{cardContent}</Link>;
  }

  return cardContent;
};

export default StatsCard;