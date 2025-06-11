
import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import LeadForm from "./LeadForm";

interface LeadGenerationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialInsuranceType?: string;
}

const LeadGenerationDialog: React.FC<LeadGenerationDialogProps> = ({ open, onOpenChange, initialInsuranceType }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Solicitar Asesoría Gratuita</DialogTitle>
          <DialogDescription>
            Déjanos tus datos y un asesor se pondrá en contacto contigo para brindarte asesoría personalizada.
          </DialogDescription>
        </DialogHeader>
        <LeadForm initialInsuranceType={initialInsuranceType} />
      </DialogContent>
    </Dialog>
  );
};

export default LeadGenerationDialog;
