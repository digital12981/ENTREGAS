import React, { useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';

const Recebedor = () => {
  // Rolar para o topo da página quando o componente é montado
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-sm">
          <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">Informações de Recebedor</h1>
          
          <div className="p-4 mb-8 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center mb-3">
              <svg className="w-6 h-6 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <h3 className="text-lg font-medium text-green-700">Cadastro quase completo!</h3>
            </div>
            <p className="text-green-600 ml-8">
              Sua selfie foi registrada com sucesso e será usada para seu crachá de identificação Shopee.
            </p>
          </div>
          
          <p className="text-gray-700 mb-6">
            Preencha as informações sobre como você deseja receber seus pagamentos:
          </p>
          
          {/* Conteúdo simplificado da página de recebedor */}
          <div className="space-y-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Banco
              </label>
              <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E83D22]">
                <option value="">Selecione seu banco</option>
                <option value="itau">Itaú</option>
                <option value="bradesco">Bradesco</option>
                <option value="santander">Santander</option>
                <option value="caixa">Caixa Econômica</option>
                <option value="nubank">Nubank</option>
                <option value="inter">Banco Inter</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Conta
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input type="radio" name="accountType" className="h-4 w-4 text-[#E83D22]" value="corrente" />
                  <span className="ml-2">Corrente</span>
                </label>
                <label className="flex items-center">
                  <input type="radio" name="accountType" className="h-4 w-4 text-[#E83D22]" value="poupanca" />
                  <span className="ml-2">Poupança</span>
                </label>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Agência (sem dígito)
              </label>
              <input 
                type="text" 
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E83D22]"
                placeholder="0000"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Conta (com dígito)
              </label>
              <input 
                type="text" 
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E83D22]"
                placeholder="00000-0"
              />
            </div>
          </div>
          
          <Button
            className="w-full bg-[#E83D22] hover:bg-[#d73920] text-white font-medium py-3"
          >
            Finalizar Cadastro
          </Button>
          
          <p className="text-center text-xs text-gray-500 mt-4">
            Suas informações bancárias serão usadas apenas para pagamento das entregas e serão mantidas em segurança.
          </p>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Recebedor;