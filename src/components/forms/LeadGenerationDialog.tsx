
import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import LeadForm from "./LeadForm";

interface LeadGenerationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LeadGenerationDialog: React.FC<LeadGenerationDialogProps> = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Solicitar Asesoría Gratuita</DialogTitle>
          <DialogDescription>
            Déjanos tus datos y un asesor se pondrá en contacto contigo para brindarte toda la información que necesitas.
          </DialogDescription>
        </DialogHeader>
        <LeadForm />
      </DialogContent>
    </Dialog>
  );
};

export default LeadGenerationDialog;
