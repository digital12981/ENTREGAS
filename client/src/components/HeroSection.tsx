import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

const HeroSection: React.FC = () => {
  return (
    <section className="bg-white py-16 px-4">
      <div className="container mx-auto text-center">
        <div className="bg-black text-white px-6 py-3 rounded-full inline-block mb-6">
          <span className="text-sm font-semibold">🔥 PROGRAMA EXCLUSIVO UBER</span>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Ganhe{' '}
          <span className="text-black">R$ 500,00 por mês</span>{' '}
          com um simples adesivo
        </h1>
        
        <p className="text-xl text-gray-600 mb-8 max-w-4xl mx-auto">
          A Uber está oferecendo uma oportunidade única para motoristas parceiros: 
          receba R$ 500,00 mensais durante 3 anos apenas por aderir um adesivo da Uber 
          no parabrisa traseiro do seu veículo.
        </p>
        
        <div className="bg-gray-50 rounded-lg p-6 mb-8 max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Como funciona:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div className="flex items-start">
              <div className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-1">1</div>
              <div>
                <h4 className="font-semibold">Adesivo no parabrisa traseiro</h4>
                <p className="text-gray-600">Material especial que não danifica o vidro nem compromete a visão</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-1">2</div>
              <div>
                <h4 className="font-semibold">Pagamento garantido</h4>
                <p className="text-gray-600">R$ 500,00 via PIX todo dia 08 de cada mês</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-1">3</div>
              <div>
                <h4 className="font-semibold">Contrato de 3 anos</h4>
                <p className="text-gray-600">Estabilidade financeira garantida por 36 meses</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-1">4</div>
              <div>
                <h4 className="font-semibold">Total: R$ 18.000</h4>
                <p className="text-gray-600">Valor total que você receberá ao longo do contrato</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8 max-w-2xl mx-auto">
          <h3 className="text-xl font-bold text-green-800 mb-2">💰 Sua renda extra garantida:</h3>
          <div className="text-3xl font-bold text-green-700 mb-2">R$ 500,00/mês × 36 meses = R$ 18.000</div>
          <p className="text-green-600">Sem esforço adicional, apenas mantendo o adesivo no veículo</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link href="/cadastro">
            <Button size="lg" className="bg-black hover:bg-gray-800 text-white px-12 py-4 text-lg font-semibold">
              Quero Participar Agora
            </Button>
          </Link>
        </div>
        
        <p className="text-sm text-gray-500 max-w-2xl mx-auto">
          * Programa limitado e sujeito à aprovação. O adesivo é fornecido gratuitamente pela Uber e 
          é aplicado por profissionais especializados. Não compromete a visibilidade e pode ser removido 
          sem danos ao veículo ao final do contrato.
        </p>
      </div>
    </section>
  );
};

export default HeroSection;
