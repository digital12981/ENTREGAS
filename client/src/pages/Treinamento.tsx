import { FC, useState } from 'react';
import Header from '../components/Header';
import kitTreinamentoImage from '@assets/a0e45d2fcc7fdab21ea74890cbd0d45e (1).png';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import TreinamentoModal from '../components/TreinamentoModal';

const Treinamento: FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F5] text-sm font-['Roboto',sans-serif]">
      <header 
        className="bg-white py-2 px-4 flex items-center rounded-b-sm"
        style={{ 
          boxShadow: "0 4px 10px -3px rgba(0, 0, 0, 0.2)"
        }}
      >
        <a href="/" className="text-[#EF4444] text-xl">
          <i className="fas fa-arrow-left"></i>
        </a>
        <h1 className="text-lg font-normal text-center flex-grow text-[#10172A]">Treinamento Online Shopee</h1>
      </header>
      
      <div className="bg-[#F5F5F5] h-[10px]"></div>
      
      <div className="w-full bg-white">
        <div className="bg-[#F5F5F5] p-3">
          <p className="text-[#6E6E6E] text-xs translate-y-1">Status do Cadastro</p>
        </div>
        
        <div className="p-3 border-b border-gray-200">
          <div className="bg-green-50 p-3 rounded-sm border border-green-200">
            <div className="flex items-start">
              <div className="text-green-500 mr-2 mt-0.5 shrink-0">
                <CheckCircle size={16} />
              </div>
              <div>
                <h3 className="text-sm font-medium text-green-700">Aprovado - Kit de Segurança Confirmado!</h3>
                <p className="text-xs text-green-600">Seu cadastro foi aprovado e o pagamento do Kit foi confirmado. Entrega em até 5 dias úteis.</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-3 border-b border-gray-200">
          <p className="text-[#212121] text-sm mb-2">
            Sua jornada como Motorista Parceiro Shopee está quase completa! <strong>PARA FINALIZAR O PROCESSO 
            E LIBERAR SEU ACESSO AO SISTEMA</strong>, você precisa concluir o treinamento online oficial 
            de 3 horas da Shopee para entregadores.
          </p>
          <p className="text-[#EF4444] text-xs font-medium">
            O treinamento é OBRIGATÓRIO para receber suas credenciais e acessar o aplicativo.
          </p>
        </div>
        
        <div className="bg-[#F5F5F5] p-3">
          <p className="text-[#6E6E6E] text-xs translate-y-1">Treinamento Online Shopee</p>
        </div>
        
        <div className="p-3 border-b border-gray-200">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="w-full md:w-2/5">
              <img 
                src={kitTreinamentoImage} 
                alt="Treinamento Shopee" 
                className="w-full rounded-sm"
              />
            </div>
            <div className="w-full md:w-3/5">
              <h4 className="text-sm font-medium mb-2 text-[#212121]">Curso Online de 3 horas</h4>
              <p className="text-[#6E6E6E] text-xs mb-3">
                Este treinamento essencial capacita você com todos os conhecimentos e habilidades 
                necessários para atuar como um parceiro Shopee de excelência.
              </p>
              <div className="bg-red-50 p-3 rounded-sm border border-red-200 mb-3">
                <h5 className="text-[#EF4444] font-medium text-xs mb-1">⚠️ ATENÇÃO: TREINAMENTO OBRIGATÓRIO</h5>
                <p className="text-xs text-[#EF4444]">
                  Este treinamento é <strong>OBRIGATÓRIO</strong> para começar a trabalhar como Entregador Shopee. 
                  Sem a conclusão do curso online de 3 horas:
                </p>
                <ul className="list-disc pl-4 mt-1 text-xs text-[#EF4444]">
                  <li>Você <strong>NÃO receberá</strong> as credenciais para acessar o aplicativo</li>
                  <li>Seu cadastro ficará <strong>PENDENTE</strong> no sistema</li>
                  <li>Você <strong>NÃO poderá</strong> receber ou realizar entregas</li>
                </ul>
              </div>
              <Button 
                className="w-full bg-[#EF4444] hover:bg-[#D43C1E] text-white py-2 rounded-sm"
                onClick={() => setModalOpen(true)}
              >
                Iniciar Treinamento Agora
              </Button>
            </div>
          </div>
        </div>
        
        <div className="bg-[#F5F5F5] p-3">
          <p className="text-[#6E6E6E] text-xs translate-y-1">O que você vai aprender</p>
        </div>
        
        <div className="p-3 border-b border-gray-200">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-[#212121] text-sm py-2">
                Módulo 1: Introdução à Shopee
              </AccordionTrigger>
              <AccordionContent className="text-[#6E6E6E] text-xs">
                <ul className="list-disc pl-4 space-y-0.5">
                  <li>História e crescimento da Shopee no Brasil</li>
                  <li>Como funciona o ecossistema de entregas Shopee</li>
                  <li>Benefícios de ser um Motorista Parceiro Shopee</li>
                  <li>Estrutura de ganhos e oportunidades de crescimento</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-[#212121] text-sm py-2">
                Módulo 2: Utilizando o aplicativo
              </AccordionTrigger>
              <AccordionContent className="text-[#6E6E6E] text-xs">
                <ul className="list-disc pl-4 space-y-0.5">
                  <li>Download e configuração do aplicativo de entregas</li>
                  <li>Navegação e funcionalidades principais</li>
                  <li>Aceitar, gerenciar e completar entregas</li>
                  <li>Sistema de rotas otimizadas e GPS integrado</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-[#212121] text-sm py-2">
                Módulo 3: Procedimentos de entrega
              </AccordionTrigger>
              <AccordionContent className="text-[#6E6E6E] text-xs">
                <ul className="list-disc pl-4 space-y-0.5">
                  <li>Protocolo de coleta no centro de distribuição Shopee</li>
                  <li>Verificação e confirmação de encomendas</li>
                  <li>Procedimentos de entrega e validação</li>
                  <li>Lidar com ausência de destinatários</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-4">
              <AccordionTrigger className="text-[#212121] text-sm py-2">
                Módulo 4: Segurança e boas práticas
              </AccordionTrigger>
              <AccordionContent className="text-[#6E6E6E] text-xs">
                <ul className="list-disc pl-4 space-y-0.5">
                  <li>Uso correto do kit de segurança Shopee</li>
                  <li>Prevenção de acidentes durante o transporte</li>
                  <li>Direção defensiva e economia de combustível</li>
                  <li>Protocolos em caso de emergências</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-5">
              <AccordionTrigger className="text-[#212121] text-sm py-2">
                Módulo 5: Atendimento ao cliente
              </AccordionTrigger>
              <AccordionContent className="text-[#6E6E6E] text-xs">
                <ul className="list-disc pl-4 space-y-0.5">
                  <li>Etiqueta profissional e representação da marca Shopee</li>
                  <li>Comunicação eficaz com clientes</li>
                  <li>Lidar com situações desafiadoras</li>
                  <li>Política de não-confrontação</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-6">
              <AccordionTrigger className="text-[#212121] text-sm py-2">
                Módulo 6: Sistema de pagamentos
              </AccordionTrigger>
              <AccordionContent className="text-[#6E6E6E] text-xs">
                <ul className="list-disc pl-4 space-y-0.5">
                  <li>Compreendendo seu extrato de ganhos</li>
                  <li>Ciclos de pagamento e processamento</li>
                  <li>Bônus por desempenho e campanhas especiais</li>
                  <li>Dicas para maximizar seus ganhos</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        
        <div className="p-3">
          <div className="bg-[#FFF8F6] p-3 rounded-sm border border-[#EF4444] mb-3">
            <h4 className="text-sm font-medium text-[#EF4444] mb-1">Certificação Shopee para Entregadores</h4>
            <p className="text-xs text-[#212121] mb-1">
              Ao completar o treinamento, você receberá o Certificado Oficial Shopee para Entregadores, 
              que é <strong>OBRIGATÓRIO</strong> para:
            </p>
            <ul className="list-disc pl-4 text-xs text-[#212121]">
              <li>Receber as credenciais de acesso ao aplicativo</li>
              <li>Ativar seu cadastro como entregador oficial</li>
              <li>Começar a receber solicitações de entrega</li>
            </ul>
          </div>
          
          <Button 
            className="w-full bg-[#EF4444] hover:bg-[#D43C1E] text-white py-2 rounded-sm"
            onClick={() => setModalOpen(true)}
          >
            Iniciar Treinamento Agora
          </Button>
        </div>
      </div>
      
      <div className="pb-[50px]"></div>
      
      {/* Modal de agendamento do treinamento */}
      <TreinamentoModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  );
};

export default Treinamento;