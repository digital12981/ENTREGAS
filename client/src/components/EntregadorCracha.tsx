import React from 'react';

interface EntregadorCrachaProps {
  nome: string;
  cpf: string;
  cidade: string;
  fotoUrl: string;
}

const EntregadorCracha: React.FC<EntregadorCrachaProps> = ({ nome, cpf, cidade, fotoUrl }) => {
  // Processa o nome para exibir apenas nome e sobrenome, evitando partículas de ligação
  const formatarNome = (nomeCompleto: string): string => {
    // Lista de partículas de ligação comuns em nomes brasileiros
    const particulasLigacao = ['da', 'de', 'do', 'das', 'dos', 'e'];
    
    // Divide o nome em partes
    const partes = nomeCompleto.trim().split(' ');
    
    // Se só tiver uma parte, retorna ela
    if (partes.length <= 1) {
      return nomeCompleto;
    }
    
    // Extrai o primeiro nome
    const primeiroNome = partes[0];
    
    // Procura o último sobrenome válido (não partícula)
    let ultimoSobrenome = '';
    for (let i = partes.length - 1; i > 0; i--) {
      if (!particulasLigacao.includes(partes[i].toLowerCase())) {
        ultimoSobrenome = partes[i];
        break;
      }
    }
    
    // Se não encontrou sobrenome válido, usa a última parte
    if (!ultimoSobrenome && partes.length > 1) {
      ultimoSobrenome = partes[partes.length - 1];
    }
    
    return `${primeiroNome} ${ultimoSobrenome}`;
  };
  
  const nomeFormatado = formatarNome(nome);
  
  return (
    <div className="relative">
      <div className="absolute -top-9 left-1/2 transform -translate-x-1/2">
        <img 
          src="https://i.ibb.co/7dsrFY5q/Entregador-Shopee-2-1-2-removebg-preview-2-1.png" 
          alt="Imagem de um crachá de entregador Shopee com design oficial, sem fundo, com um layout atualizado" 
          className="w-20 h-20 filter-none" 
        />
      </div>
      <div className="bg-white rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.15)] w-[350px] p-4 pt-8">
        <div className="flex items-center mb-4 justify-start">
          <img 
            src="https://d290ny10omyv12.cloudfront.net/images/shopee-large.png" 
            alt="Shopee Logo" 
            className="w-40 h-auto -ml-[30px]" 
          />
        </div>
        <div className="flex">
          <div className="w-[120px] h-[140px] bg-gray-200 rounded mr-4 flex items-center justify-center overflow-hidden shadow-sm">
            {fotoUrl ? (
              <img 
                src={fotoUrl} 
                alt="Foto de perfil do entregador" 
                className="w-full h-full object-cover rounded" 
              />
            ) : (
              <i className="fas fa-user text-gray-400 text-4xl"></i>
            )}
          </div>
          <div className="flex-grow h-[140px] flex flex-col justify-between">
            <h2 className="text-xs font-bold">Entregador Shopee</h2>
            <p className="text-[10px] text-gray-700 uppercase truncate">{nomeFormatado.toUpperCase()}</p>
            <hr className="border-gray-300" />
            <p className="text-[10px] text-gray-700">{cpf}</p>
            <hr className="border-gray-300" />
            <p className="text-[10px] text-gray-700 uppercase truncate">{cidade.toUpperCase()}</p>
            <hr className="border-gray-300" />
            <div className="flex items-center text-red-500">
              <i className="fas fa-times-circle mr-1 text-xs"></i>
              <span className="font-bold text-xs">NÃO ATIVO</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntregadorCracha;