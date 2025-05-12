
import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";

const MeetingScheduler: React.FC = () => {
  const [date, setDate] = React.useState<Date | undefined>(undefined);
  const [timeSelected, setTimeSelected] = React.useState<string | null>(null);
  const { toast } = useToast();

  // Mock available times
  const availableTimes = [
    "09:00", "10:00", "11:00", 
    "14:00", "15:00", "16:00"
  ];

  const handleSchedule = () => {
    if (!date || !timeSelected) {
      toast({
        title: "Error",
        description: "Por favor selecciona una fecha y hora",
        variant: "destructive"
      });
      return;
    }

    const formattedDate = date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    toast({
      title: "Cita agendada",
      description: `Tu asesoría gratuita ha sido programada para el ${formattedDate} a las ${timeSelected}. Te enviaremos un correo de confirmación.`,
    });
    
    setDate(undefined);
    setTimeSelected(null);
  };

  // Disable past dates
  const disabledDays = { before: new Date() };

  return (
    <Card className="p-5 max-w-md mx-auto">
      <h3 className="text-lg font-bold mb-4 text-center">Agenda una Asesoría Gratuita</h3>
      <div className="mb-6">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          disabled={disabledDays}
          className="rounded-md border"
        />
      </div>
      
      {date && (
        <div className="mb-6 animate-fade-in">
          <h4 className="text-md font-medium mb-2">Horarios Disponibles:</h4>
          <div className="grid grid-cols-3 gap-2">
            {availableTimes.map((time) => (
              <Button
                key={time}
                variant={timeSelected === time ? "default" : "outline"}
                className="text-sm"
                onClick={() => setTimeSelected(time)}
              >
                {time}
              </Button>
            ))}
          </div>
        </div>
      )}
      
      <Button 
        onClick={handleSchedule} 
        className="w-full mt-2" 
        disabled={!date || !timeSelected}
      >
        Agendar Cita
      </Button>
    </Card>
  );
};

export default MeetingScheduler;
