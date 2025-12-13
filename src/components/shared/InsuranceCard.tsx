
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface InsuranceCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
  className?: string;
}

const InsuranceCard = ({
  title,
  description,
  icon,
  link,
  className,
}: InsuranceCardProps) => {
  return (
    <div 
      className={cn(
        "group relative bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300",
        "hover:shadow-lg hover:-translate-y-1.5 focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2",
        "min-h-[200px] flex flex-col justify-center items-center text-center p-6",
        className
      )}
      tabIndex={0}
    >
      {/* Initial Content */}
      <div className="flex flex-col items-center justify-center transition-all duration-300 group-hover:opacity-0 group-hover:invisible group-focus-within:opacity-0 group-focus-within:invisible">
        <div className="text-primary text-4xl mb-3 transition-colors duration-300 group-hover:text-primary/80">
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-gray-900">
          {title}
        </h3>
      </div>

      {/* Info Overlay */}
      <div className="absolute inset-0 bg-primary/90 opacity-0 invisible transition-all duration-300 group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible flex flex-col justify-center items-center p-6 text-white">
        <h4 className="text-xl font-bold mb-3">{title}</h4>
        <p className="text-sm mb-4">{description}</p>
        <Button asChild size="sm" className="shrink-0 bg-secondary hover:bg-secondary/90 text-white hover:text-white">
          <Link to={link} className="whitespace-nowrap">
            Ver más información
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default InsuranceCard;
