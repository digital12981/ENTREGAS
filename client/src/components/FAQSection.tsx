import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

const FAQSection: React.FC = () => {
  const [openQuestion, setOpenQuestion] = useState<number | null>(null);

  const faqs = [
    {
      question: "O adesivo realmente não danifica o vidro?",
      answer: "Sim! Utilizamos uma película especial desenvolvida especificamente para vidros automotivos. O material é 100% removível e não deixa resíduos ou danos ao parabrisa. A aplicação é feita por profissionais certificados."
    },
    {
      question: "Como funciona o pagamento de R$ 500,00?",
      answer: "O pagamento é automático via PIX todo dia 08 de cada mês, diretamente na sua conta. Não há necessidade de cobrança ou solicitação - o valor é creditado automaticamente enquanto o contrato estiver ativo."
    },
    {
      question: "Posso remover o adesivo antes dos 3 anos?",
      answer: "O contrato tem duração de 3 anos. A remoção antecipada do adesivo resultará no cancelamento do programa e interrupção dos pagamentos. Porém, ao final do contrato, a remoção é gratuita e feita pela nossa equipe."
    },
    {
      question: "O adesivo compromete a visibilidade?",
      answer: "Não! O adesivo é posicionado estrategicamente no parabrisa traseiro em área que não compromete a visão do motorista. O material é semi-transparente e segue todas as normas de segurança do CONTRAN."
    },
    {
      question: "Preciso ser motorista da Uber para participar?",
      answer: "Não é obrigatório ser motorista ativo da Uber. O programa está aberto para qualquer pessoa que possua veículo próprio e atenda aos requisitos básicos do programa."
    },
    {
      question: "Quantas vagas estão disponíveis?",
      answer: "O programa tem vagas limitadas por região para manter a exclusividade. Estamos selecionando os primeiros 1.000 veículos em todo o Brasil. As vagas são preenchidas por ordem de cadastro aprovado."
    },
    {
      question: "Existe algum custo para participar?",
      answer: "Não! O programa é 100% gratuito. A Uber fornece o adesivo, faz a aplicação profissional e ainda paga R$ 500,00 mensais para você. Não há taxas, custos ou pegadinhas."
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Dúvidas sobre o Programa
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Esclarecemos as principais questões sobre os R$ 500,00 mensais
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto mb-12">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b border-gray-200 last:border-b-0">
              <button
                className="w-full py-6 text-left flex justify-between items-center hover:bg-gray-50 px-4 rounded-lg transition-colors"
                onClick={() => setOpenQuestion(openQuestion === index ? null : index)}
              >
                <h3 className="text-lg font-semibold text-gray-900 pr-4">
                  {faq.question}
                </h3>
                <svg
                  className={`w-6 h-6 text-gray-600 transform transition-transform ${
                    openQuestion === index ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {openQuestion === index && (
                <div className="px-4 pb-6">
                  <p className="text-gray-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="bg-black text-white rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">Ainda tem dúvidas?</h3>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Não perca tempo! As vagas são limitadas e o programa pode encerrar a qualquer momento. 
            Garante já a sua participação e comece a receber R$ 500,00 mensais.
          </p>
          <Link href="/cadastro">
            <Button size="lg" className="bg-white text-black hover:bg-gray-100 px-12 py-4 text-lg font-semibold">
              Garantir Minha Vaga Agora
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
