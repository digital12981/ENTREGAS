import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

const InfoSection: React.FC = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Programa Uber Adesivo: Detalhes Completos
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Tudo que você precisa saber sobre esta oportunidade exclusiva
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Requisitos para participar:</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3 mt-1">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Veículo próprio</h4>
                  <p className="text-gray-600">Carro ou moto em bom estado de conservação</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3 mt-1">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Documentação em dia</h4>
                  <p className="text-gray-600">CNH válida e documentos do veículo atualizados</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3 mt-1">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Maior de 21 anos</h4>
                  <p className="text-gray-600">Idade mínima para participar do programa</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3 mt-1">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Conta bancária</h4>
                  <p className="text-gray-600">Para recebimento dos pagamentos via PIX</p>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Vantagens do programa:</h3>
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2">💰 Renda passiva garantida</h4>
                <p className="text-gray-600">R$ 500,00 mensais sem necessidade de trabalhar como entregador</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2">🛡️ Adesivo seguro</h4>
                <p className="text-gray-600">Material especial que não danifica o vidro e pode ser removido</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2">📅 Pagamento pontual</h4>
                <p className="text-gray-600">Todo dia 08 de cada mês via PIX, automaticamente</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2">🎯 Aplicação profissional</h4>
                <p className="text-gray-600">Equipe especializada faz a instalação sem custo</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-8 text-center border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Pronto para começar a ganhar R$ 500,00 por mês?</h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Não perca esta oportunidade única! O programa tem vagas limitadas e está disponível 
            apenas para os primeiros interessados que se cadastrarem.
          </p>
          <Link href="/cadastro">
            <Button size="lg" className="bg-black hover:bg-gray-800 text-white px-12 py-4 text-lg font-semibold">
              Participar Agora
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default InfoSection;
