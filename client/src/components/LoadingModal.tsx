import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface LoadingModalProps {
  isOpen: boolean;
  onComplete: () => void;
  loadingSteps: string[];
  title: string;
  completionMessage: string;
  loadingTime?: number;
}

export const LoadingModal: React.FC<LoadingModalProps> = ({
  isOpen,
  onComplete,
  loadingSteps,
  title,
  completionMessage,
  loadingTime = 7000
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [finishText, setFinishText] = useState<string>('');

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal is closed
      setCurrentStep(0);
      setIsComplete(false);
      setFinishText('');
      return;
    }

    const stepInterval = loadingTime / (loadingSteps.length + 1);
    
    const timer = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < loadingSteps.length - 1) {
          return prev + 1;
        } else if (prev === loadingSteps.length - 1 && !isComplete) {
          setIsComplete(true);
          setFinishText(completionMessage);
          setTimeout(() => {
            onComplete();
          }, 1500);
          return prev;
        }
        return prev;
      });
    }, stepInterval);

    return () => {
      clearInterval(timer);
    };
  }, [isOpen, loadingSteps.length, onComplete, completionMessage, loadingTime]);

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md p-6 bg-white">
        <DialogTitle className="font-semibold text-lg text-gray-900 mb-4 text-center">{title}</DialogTitle>
        <DialogDescription className="sr-only">Modal para exibir o progresso do processamento.</DialogDescription>
        <div className="flex flex-col items-center justify-center w-full">
          
          {!isComplete ? (
            <div className="flex justify-center mb-6">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-solid border-[#E83D22] border-t-transparent" />
            </div>
          ) : (
            <div className="flex justify-center mb-6 text-[#E83D22]">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-circle">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
          )}
          
          <div className="w-full space-y-2">
            {loadingSteps.map((step, index) => (
              <div 
                key={index} 
                className={`flex items-center ${index <= currentStep ? 'text-gray-900' : 'text-gray-400'}`}
              >
                <div className={`w-6 h-6 rounded-full mr-3 flex items-center justify-center text-xs
                  ${index < currentStep 
                    ? 'bg-[#E83D22] text-white' 
                    : index === currentStep 
                      ? 'bg-[#E83D2220] text-[#E83D22] border border-[#E83D22]' 
                      : 'bg-gray-100 text-gray-400 border border-gray-200'}
                `}>
                  {index < currentStep ? '✓' : index + 1}
                </div>
                <span className={`text-sm ${index <= currentStep ? 'font-medium' : 'font-normal'}`}>
                  {step}
                </span>
              </div>
            ))}
          </div>
          
          {isComplete && (
            <div className="mt-6 text-center text-[#E83D22] font-medium">
              {finishText}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};