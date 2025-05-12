
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
    <Card className={cn("overflow-hidden transition-all duration-300 hover:shadow-lg", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold">{title}</CardTitle>
          <div className="text-primary">{icon}</div>
        </div>
        <CardDescription className="line-clamp-2">{description}</CardDescription>
      </CardHeader>
      <CardContent></CardContent>
      <CardFooter className="border-t p-4">
        <Button asChild variant="outline" size="sm" className="w-full">
          <Link to={link}>Ver más información</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default InsuranceCard;
