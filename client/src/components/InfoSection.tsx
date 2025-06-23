import React from 'react';

const InfoSection: React.FC = () => {
  return (
    <section className="container mx-auto px-4 py-8 text-[#555]">
      <h2 className="heading border-b-2 border-gray-200 pb-2">Programa Oficial Uber: Parceria de Publicidade Veicular</h2>
      <p className="body-text leading-relaxed">A Uber Technologies Inc. anuncia oficialmente o lançamento do Programa de Parceria de Publicidade Veicular, oferecendo compensação financeira mensal de R$ 500,00 aos parceiros selecionados que aderirem à campanha publicitária através da aplicação de adesivo institucional no parabrisa traseiro de seus veículos.</p>
      <p className="body-text leading-relaxed">Este programa representa uma iniciativa estratégica da Uber para fortalecer a presença da marca no mercado brasileiro, proporcionando aos parceiros uma fonte adicional de receita passiva durante o período contratual de 36 meses. O material publicitário utiliza tecnologia avançada que preserva a integridade do vidro e mantém a segurança visual exigida pela legislação de trânsito.</p>

      <h3 className="heading border-b-2 border-gray-200 pb-2">Estrutura de Compensação Financeira</h3>
      <p className="body-text leading-relaxed">A compensação mensal no valor de R$ 500,00 é processada automaticamente via sistema PIX no dia 08 de cada mês, sendo creditada diretamente na conta bancária cadastrada pelo parceiro. O programa mantém vigência por 36 meses consecutivos, totalizando R$ 18.000,00 em compensação durante todo o período contratual, sem necessidade de solicitações ou procedimentos adicionais por parte do beneficiário.</p>

      <h3 className="heading border-b-2 border-gray-200 pb-2">Critérios de Elegibilidade e Processo de Adesão</h3>
      <p className="body-text leading-relaxed">O processo de candidatura é conduzido integralmente através de plataforma digital oficial. Os requisitos para participação incluem:</p>
      <ol className="list-decimal list-inside mb-6 pl-4">
        <li>Propriedade de veículo automotor em condições adequadas com documentação regularizada;</li>
        <li>Idade mínima de 21 anos e titularidade de conta bancária para recebimento via PIX;</li>
        <li>Preenchimento completo do formulário oficial de candidatura;</li>
        <li>Submissão à análise de elegibilidade e posterior agendamento técnico para instalação.</li>
      </ol>
      <p className="body-text leading-relaxed">A Uber fornece integralmente o material publicitário e serviços de instalação através de equipe técnica especializada, sem custos para o parceiro. O material é desenvolvido com tecnologia removível que garante a preservação da superfície do veículo ao término do contrato.</p>
    </section>
  );
};

export default InfoSection;
