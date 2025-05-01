import React from 'react';

interface FaceGuideProps {
  step: number;
  countdown: number | null;
}

/**
 * Componente que exibe um guia visual para posicionamento facial
 * O guia muda de tamanho e instruções dependendo do passo da verificação
 */
const FaceGuide: React.FC<FaceGuideProps> = ({ step, countdown }) => {
  // Determinar o tamanho do oval com base no passo atual
  // Passo 1: Oval pequeno - permite enquadrar o rosto
  // Passo 2: Oval médio - aproximação gradual
  // Passo 3: Oval MUITO grande - posição final para captura bem próxima
  const getOvalSize = () => {
    switch (step) {
      case 1: return 'scale-70'; // Começa pequeno
      case 2: return 'scale-120'; // Médio
      case 3: return 'scale-180'; // Termina MUITO grande para foto bem próxima
      default: return 'scale-70';
    }
  };

  // Obter a mensagem de instrução com base no passo atual
  const getMessage = () => {
    if (countdown !== null) {
      return `Capturando em ${countdown}...`;
    }
    
    switch (step) {
      case 1: return 'Posicione seu rosto dentro do círculo';
      case 2: return 'Aproxime mais seu rosto da câmera';
      case 3: return 'Ótimo! Rosto bem visível para o crachá';
      default: return 'Preparando...';
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
      {/* Oval guia facial (SVG) */}
      <div className={`relative ${getOvalSize()} transition-transform duration-1000`}>
        <div className="w-48 h-64 mx-auto relative">
          <svg 
            viewBox="0 0 100 130" 
            className="absolute inset-0 w-full h-full"
          >
            <ellipse 
              cx="50" 
              cy="65" 
              rx="35" 
              ry="50" 
              fill="none" 
              stroke="white" 
              strokeWidth="2"
              strokeDasharray="5,3"
              className="drop-shadow-lg"
            />
          </svg>
        </div>
      </div>
      
      {/* Instruções */}
      <div className="absolute bottom-4 left-0 right-0 text-center">
        <p className="bg-black bg-opacity-50 text-white py-2 px-4 rounded-lg mx-auto inline-block">
          {getMessage()}
        </p>
      </div>
    </div>
  );
};

export default FaceGuide;