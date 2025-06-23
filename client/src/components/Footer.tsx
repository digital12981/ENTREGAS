import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-black text-white py-4 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-3 md:mb-0">
            <img 
              src="https://i.ibb.co/wFFn5HSn/13093103960002-1.png" 
              alt="Uber Logo" 
              className="h-8 mb-2 mx-auto md:mx-0"
            />
            <p className="text-sm text-center md:text-left text-white">© 2024 Uber Technologies Inc. Todos os direitos reservados.</p>
          </div>
          
          <div className="text-center md:text-right">
            <p className="text-sm text-white opacity-80 mb-1">Programa de Parceiros Entregadores Uber</p>
            <p className="text-xs text-white opacity-70">Trabalhe conosco e faça parte da nossa equipe de entregas</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;