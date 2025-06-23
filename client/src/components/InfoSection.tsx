import React from 'react';

const InfoSection: React.FC = () => {
  return (
    <section className="container mx-auto px-4 py-8 text-[#555]">
      <h2 className="heading border-b-2 border-gray-200 pb-2">Programa Uber Adesivo: Ganhe R$ 500,00 por mês</h2>
      <p className="body-text leading-relaxed">A Uber está oferecendo uma oportunidade única para motoristas parceiros: receba R$ 500,00 mensais durante 3 anos apenas por aderir um adesivo da Uber no parabrisa traseiro do seu veículo. O adesivo não danifica o vidro nem compromete a visão.</p>
      <p className="body-text leading-relaxed">Aceita diferentes tipos de veículos, como <span className="font-bold text-black">motos, carros de passeio (2 ou 4 portas), Fiorino, Kombi e vans</span>. O programa tem vagas limitadas para manter a exclusividade e está disponível apenas para os primeiros 1.000 veículos em todo o Brasil.</p>

      <h3 className="heading border-b-2 border-gray-200 pb-2">Pagamentos via PIX todo dia 08</h3>
      <p className="body-text leading-relaxed">Os pagamentos são realizados automaticamente via PIX todo dia 08 de cada mês, diretamente na sua conta. Não há necessidade de cobrança ou solicitação - o valor de R$ 500,00 é creditado automaticamente enquanto o contrato de 3 anos estiver ativo. Total de R$ 18.000 ao longo do programa.</p>

      <h3 className="heading border-b-2 border-gray-200 pb-2">Como participar</h3>
      <p className="body-text leading-relaxed">O cadastro é totalmente online. Para participar, basta:</p>
      <ol className="list-decimal list-inside mb-6 pl-4">
        <li>Ter veículo próprio em bom estado e documentação em dia;</li>
        <li>Ser maior de 21 anos e possuir conta bancária;</li>
        <li>Preencher o formulário de cadastro com seus dados;</li>
        <li>Aguardar aprovação e agendamento da aplicação do adesivo.</li>
      </ol>
      <p className="body-text leading-relaxed">O adesivo é fornecido gratuitamente e aplicado por profissionais especializados. Pode ser removido sem danos ao final do contrato. Não há custos para participar do programa.</p>
    </section>
  );
};

export default InfoSection;
