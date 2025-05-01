import React from 'react';

interface FaceGuideProps {
  step: number;
  countdown: number | null;
}

const FaceGuide: React.FC<FaceGuideProps> = ({ step, countdown }) => {
  // Determinar o tamanho do círculo baseado no passo atual
  const getCircleSize = () => {
    switch (step) {
      case 1: // Círculo inicial, mais distante
        return 'w-40 h-40';
      case 2: // Círculo médio, aproximando
        return 'w-52 h-52';
      case 3: // Círculo próximo, centralização final
        return 'w-64 h-64';
      default:
        return 'w-48 h-48';
    }
  };
  
  // Mensagem de instrução baseada no passo atual
  const getInstruction = () => {
    switch (step) {
      case 1:
        return 'Centralize seu rosto no círculo';
      case 2:
        return 'Aproxime um pouco mais o rosto';
      case 3:
        return countdown !== null 
          ? `Mantenha-se centralizado. Foto em ${countdown}...` 
          : 'Pronto! Capturando...';
      default:
        return 'Preparando...';
    }
  };
  
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      {/* Overlay semi-transparente */}
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      
      {/* Círculo guia com animação de pulso */}
      <div className={`relative ${getCircleSize()} rounded-full border-2 border-dashed border-white animate-pulse`}>
        {/* Círculo interno para representar o formato de rosto */}
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3/4 h-[90%] rounded-full border border-white"></div>
      </div>
      
      {/* Texto de instrução */}
      <div className="absolute bottom-10 left-0 right-0 text-center">
        <p className="bg-black bg-opacity-60 text-white px-4 py-2 rounded-lg inline-block font-medium">
          {getInstruction()}
        </p>
      </div>
      
      {/* Indicador de contagem regressiva (apenas para passo 3) */}
      {step === 3 && countdown !== null && (
        <div className="absolute top-10 left-0 right-0 text-center">
          <span className="text-3xl font-bold text-white bg-black bg-opacity-60 px-5 py-2 rounded-full inline-block">
            {countdown}
          </span>
        </div>
      )}
    </div>
  );
};

export default FaceGuide;