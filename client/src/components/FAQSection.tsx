import React, { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
  isOpen: boolean;
}

const FAQSection: React.FC = () => {
  const [faqs, setFaqs] = useState<FAQItem[]>([
    {
      question: "O adesivo realmente não danifica o vidro?",
      answer: "Sim! Utilizamos uma película especial desenvolvida especificamente para vidros automotivos. O material é 100% removível e não deixa resíduos ou danos ao parabrisa. A aplicação é feita por profissionais certificados.",
      isOpen: false
    },
    {
      question: "Como funciona o pagamento de R$ 500,00?",
      answer: "O pagamento é automático via PIX todo dia 08 de cada mês, diretamente na sua conta. Não há necessidade de cobrança ou solicitação - o valor é creditado automaticamente enquanto o contrato estiver ativo.",
      isOpen: false
    },
    {
      question: "O adesivo compromete a visibilidade?",
      answer: "Não! O adesivo é posicionado estrategicamente no parabrisa traseiro em área que não compromete a visão do motorista. O material é semi-transparente e segue todas as normas de segurança do CONTRAN.",
      isOpen: false
    },
    {
      question: "Preciso ser motorista da Uber para participar?",
      answer: "Não é obrigatório ser motorista ativo da Uber. O programa está aberto para qualquer pessoa que possua veículo próprio e atenda aos requisitos básicos do programa.",
      isOpen: false
    },
    {
      question: "Existe algum custo para participar?",
      answer: "Não! O programa é 100% gratuito. A Uber fornece o adesivo, faz a aplicação profissional e ainda paga R$ 500,00 mensais para você. Não há taxas, custos ou pegadinhas.",
      isOpen: false
    }
  ]);

  const toggleFAQ = (index: number) => {
    const updatedFaqs = [...faqs];
    updatedFaqs[index].isOpen = !updatedFaqs[index].isOpen;
    setFaqs(updatedFaqs);
  };

  return (
    <section className="py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        <h2 className="text-xl font-semibold mb-8 text-center">Perguntas Frequentes sobre o Programa Adesivo</h2>
        
        <div className="space-y-4 mb-8">
          {faqs.map((faq, index) => (
            <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
              <div 
                className="bg-gray-50 px-4 py-3 cursor-pointer flex justify-between items-center"
                onClick={() => toggleFAQ(index)}
              >
                <h3 className="font-medium">{faq.question}</h3>
                <i className={`fas ${faq.isOpen ? 'fa-chevron-up' : 'fa-chevron-down'} text-black`}></i>
              </div>
              <div className="px-4 py-3" style={{ display: faq.isOpen ? 'block' : 'none' }}>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center">
          <p className="mb-4 text-gray-600">Não perca esta oportunidade única! Vagas limitadas.</p>
          <a href="/cadastro" className="bg-black text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 inline-block">
            Participar do Programa R$ 500,00/mês
          </a>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
