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
    <Dialog open={isOpen} onOpenChange={() => {}} modal={true}>
      <DialogContent className="p-0 sm:max-w-none w-full h-full max-h-screen overflow-hidden border-none shadow-none">
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <DialogDescription className="sr-only">Processando sua solicitação...</DialogDescription>
        
        <div className="absolute top-0 left-0 w-full h-full bg-[#F5F5F5] z-0"></div>
        
        <div className="relative flex flex-col h-screen bg-transparent z-10 px-4 py-6">
          {/* Loader */}
          {!isComplete && (
            <div className="flex space-x-2 justify-center mb-4 mt-24">
              <div className="loading-dot w-3 h-3 bg-[#EF4444] rounded-full"></div>
              <div className="loading-dot w-3 h-3 bg-[#EF4444] rounded-full"></div>
              <div className="loading-dot w-3 h-3 bg-[#EF4444] rounded-full"></div>
            </div>
          )}
          
          {/* Status Modal */}
          <div className="max-w-md mx-auto w-full">
            <header className="bg-white shadow-lg py-2 px-4 flex items-center rounded-sm mb-4">
              <h1 className="text-lg font-normal text-center flex-grow text-[#10172A]">{title}</h1>
            </header>
            
            <div className="bg-white rounded-sm shadow-lg">
              <div className="bg-[#F5F5F5] p-3">
                <p className="text-[#6E6E6E] text-xs translate-y-1">Status do processamento</p>
              </div>

              <div className="p-3 border-b border-gray-200">
                <div className="space-y-3">
                  {loadingSteps.map((step, index) => (
                    <div 
                      key={index} 
                      id={`status${index+1}`} 
                      className={`status-item flex items-center p-2 border rounded-sm ${
                        index <= currentStep 
                          ? 'border-[#EF4444]/20 bg-[#FFF8F6]' 
                          : 'border-gray-200'
                      }`}
                    >
                      <div className={`status-icon ${
                        index <= currentStep 
                          ? 'bg-[#EF4444]' 
                          : 'bg-gray-300'
                        } text-white rounded-full w-7 h-7 flex items-center justify-center mr-3`}>
                        {index < currentStep ? (
                          <i className="fas fa-check text-sm"></i>
                        ) : (
                          <span className="text-sm">{index + 1}</span>
                        )}
                      </div>
                      <div className={`status-text text-sm ${
                        index <= currentStep 
                          ? 'text-[#212121]' 
                          : 'text-[#6E6E6E]'
                      }`}>
                        {step}
                      </div>
                    </div>
                  ))}
                </div>
                
                {isComplete && (
                  <div className="mt-6 p-3 border rounded-sm border-green-200 bg-green-50">
                    <div className="flex items-center">
                      <div className="bg-green-500 text-white rounded-full p-1 mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div className="text-green-700 text-sm">
                        {finishText}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};