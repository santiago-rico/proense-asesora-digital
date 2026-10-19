import React, { useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import LeadForm from "./LeadForm";

interface LeadGenerationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialInsuranceType?: string;
}

const LeadGenerationDialog: React.FC<LeadGenerationDialogProps> = ({ open, onOpenChange, initialInsuranceType }) => {
  // Opened from App state, not a DialogTrigger, so Radix has no trigger to return
  // focus to on close: remember the element that had focus when it opened
  const openerRef = useRef<HTMLElement | null>(null);

  const handleOpenAutoFocus = () => {
    // Runs before Radix moves focus into the dialog
    openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  };

  const handleCloseAutoFocus = (event: Event) => {
    const opener = openerRef.current;
    openerRef.current = null;
    // Otherwise Radix leaves focus on <body>: the opener is gone when a link in the form
    // navigated to another page, and hidden when it was in the (now closed) mobile menu
    if (opener?.isConnected && !opener.closest('[aria-hidden="true"]')) {
      event.preventDefault();
      opener.focus();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto"
        onOpenAutoFocus={handleOpenAutoFocus}
        onCloseAutoFocus={handleCloseAutoFocus}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Solicitar Asesoría</DialogTitle>
          <DialogDescription>
            Déjanos tus datos y un asesor se pondrá en contacto contigo para brindarte asesoría personalizada.
          </DialogDescription>
        </DialogHeader>
        <LeadForm initialInsuranceType={initialInsuranceType} onLinkClick={() => onOpenChange(false)} onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
};

export default LeadGenerationDialog;
