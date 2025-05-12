
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

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
    <Card className={cn(
      "overflow-hidden transition-all duration-300 hover:shadow-lg border-t-4 border-t-primary hover:border-t-secondary", 
      className
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-center mb-2">
          <div className="p-2 mr-3 rounded-full bg-primary/10 text-primary">
            {icon}
          </div>
          <CardTitle className="text-xl font-bold">{title}</CardTitle>
        </div>
        <CardDescription className="line-clamp-2 text-sm">{description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0"></CardContent>
      <CardFooter className="border-t p-4 flex justify-end">
        <Button asChild variant="secondary" size="sm" className="w-full sm:w-auto">
          <Link to={link}>Ver más información</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default InsuranceCard;
