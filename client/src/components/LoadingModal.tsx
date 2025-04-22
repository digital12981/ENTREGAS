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
      <DialogContent className="p-0 sm:max-w-none w-full h-full max-h-screen overflow-hidden border-none shadow-none bg-white">
        <div className="absolute top-0 left-0 w-full h-full bg-white z-0"></div>
        
        <div className="relative flex flex-col justify-center items-center h-screen bg-transparent z-10">
          {/* Loader */}
          {!isComplete && (
            <div className="flex space-x-2 mb-8 fixed top-1/4">
              <div className="loading-dot w-3 h-3 bg-[#E83D22] rounded-full"></div>
              <div className="loading-dot w-3 h-3 bg-[#E83D22] rounded-full"></div>
              <div className="loading-dot w-3 h-3 bg-[#E83D22] rounded-full"></div>
            </div>
          )}
          
          {/* Status Modal */}
          <div className="w-11/12 max-w-md mt-48">
            <h2 className="font-semibold text-lg text-center mb-6">{title}</h2>

            <div className="space-y-3">
              {loadingSteps.map((step, index) => (
                <div 
                  key={index} 
                  id={`status${index+1}`} 
                  className={`status-item flex items-center p-2 bg-gray-100 rounded-lg ${index <= currentStep ? 'active' : ''}`}
                >
                  <div className={`status-icon bg-gray-300 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 ${index <= currentStep ? 'bg-[#E83D22]' : ''}`}>
                    {index < currentStep ? (
                      <i className="fas fa-check text-sm"></i>
                    ) : (
                      <span className="text-sm">{index + 1}</span>
                    )}
                  </div>
                  <div className={`status-text text-gray-600 text-sm ${index <= currentStep ? 'text-gray-900' : ''}`}>
                    {step}
                  </div>
                </div>
              ))}
            </div>
            
            {isComplete && (
              <div className="mt-6 text-center text-[#E83D22] font-medium">
                {finishText}
              </div>
            )}
          </div>
        </div>
        
        {/* CSS animações */}
        <style jsx>{`
          @keyframes bounce {
            0%, 80%, 100% { transform: scale(0); }
            40% { transform: scale(1.0); }
          }
          
          .loading-dot {
            animation: bounce 1.4s infinite ease-in-out both;
          }
          
          .loading-dot:nth-child(1) {
            animation-delay: -0.32s;
          }
          
          .loading-dot:nth-child(2) {
            animation-delay: -0.16s;
          }

          .status-item {
            transition: all 0.3s ease;
            opacity: 0.5;
            transform: translateY(10px);
          }

          .status-item.active {
            opacity: 1;
            transform: translateY(0);
          }

          .status-item.active .status-icon {
            background-color: #E83D22;
            color: white;
          }

          .status-item.active .status-text {
            color: #111827;
            font-weight: bold;
          }

          @keyframes fadeInUp {
            from {
              opacity: 0.5;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
};