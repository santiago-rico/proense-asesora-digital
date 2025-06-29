import { CheckCircle2, Mail, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface FormSuccessScreenProps {
  title: string;
  description: string;
  showEmailConfirmation?: boolean;
  email?: string;
  showWarning?: boolean;
  warningMessage?: string;
  onDismiss?: () => void;
  onSecondaryAction?: () => void;
  secondaryActionLabel?: string;
  className?: string;
}

export const FormSuccessScreen = ({
  title,
  description,
  showEmailConfirmation = false,
  email,
  showWarning = false,
  warningMessage,
  onDismiss,
  onSecondaryAction,
  secondaryActionLabel,
  className,
}: FormSuccessScreenProps) => {
  return (
    <div 
      className={cn(
        "animate-in fade-in-0 slide-in-from-bottom-4 duration-500",
        "bg-white rounded-xl shadow-sm border border-gray-200",
        "p-8 md:p-10 text-center",
        "max-w-md mx-auto w-full",
        className
      )}
      role="alert"
      aria-live="polite"
    >
      {/* Success Icon */}
      <div className="inline-flex items-center justify-center w-16 h-16 bg-secondary/10 rounded-full mb-6">
        <CheckCircle2 className="w-10 h-10 text-secondary" aria-hidden="true" />
      </div>

      {/* Title */}
      <h3 className="text-2xl font-bold text-gray-900 mb-3">
        {title}
      </h3>

      {/* Description */}
      <p className="text-gray-600 mb-6">
        {description}
      </p>

      {/* Email Display */}
      {showEmailConfirmation && email && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6 flex items-center justify-center gap-2">
          <Mail className="w-5 h-5 text-primary" />
          <span className="text-sm text-gray-700">{email}</span>
        </div>
      )}

      {/* Warning/Info Box */}
      {showWarning && warningMessage && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-left">
          <div className="flex gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">{warningMessage}</p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {onDismiss && (
          <Button 
            onClick={onDismiss}
            variant="default"
            className="bg-primary hover:bg-primary-hover"
          >
            Entendido
          </Button>
        )}
        {onSecondaryAction && secondaryActionLabel && (
          <Button 
            onClick={onSecondaryAction}
            variant="outline"
          >
            {secondaryActionLabel}
          </Button>
        )}
      </div>
    </div>
  );
};