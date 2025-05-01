import { FC, useState, useEffect } from 'react';
import Header from '../components/Header';
import kitTreinamentoImage from '@assets/a0e45d2fcc7fdab21ea74890cbd0d45e (1).png';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import TreinamentoModal from '../components/TreinamentoModal';
import EntregadorCracha from '../components/EntregadorCracha';

const Treinamento: FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [userData, setUserData] = useState<{nome: string, cpf: string, cidade: string} | null>(null);
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  
  useEffect(() => {
    // Carregar dados do usuário do localStorage
    try {
      // Tentar primeiro do candidato_data (formato usado pela página Entrega)
      const candidatoDataString = localStorage.getItem('candidato_data');
      if (candidatoDataString) {
        const candidatoData = JSON.parse(candidatoDataString);
        console.log('Dados do candidato recuperados:', candidatoData);
        
        // Obter a cidade do dados do endereço se existir
        const enderecoString = localStorage.getItem('endereco_entrega');
        let cidade = 'Cidade';
        if (enderecoString) {
          const endereco = JSON.parse(enderecoString);
          cidade = endereco.cidade || candidatoData.cidade || 'Cidade';
        } else {
          cidade = candidatoData.cidade || 'Cidade';
        }
        
        setUserData({
          nome: candidatoData.nome || 'Nome do Entregador',
          cpf: candidatoData.cpf || '000.000.000-00',
          cidade: cidade
        });
      } else {
        // Tentar formato alternativo
        const dadosUsuarioString = localStorage.getItem('dados_usuario');
        if (dadosUsuarioString) {
          const dadosUsuario = JSON.parse(dadosUsuarioString);
          console.log('Dados do usuário alternativos recuperados:', dadosUsuario);
          setUserData({
            nome: dadosUsuario.nome || 'Nome do Entregador',
            cpf: dadosUsuario.cpf || '000.000.000-00',
            cidade: dadosUsuario.cidade || 'Cidade'
          });
        } else {
          console.log('Nenhum dado de usuário encontrado, usando valores padrão');
          // Valores padrão para demonstração se não houver dados no localStorage
          setUserData({
            nome: 'Nome do Entregador',
            cpf: '000.000.000-00',
            cidade: 'Cidade'
          });
        }
      }
      
      // Carregar a foto do localStorage
      // Tentar primeiro do formato da página selfie
      const selfieImage = localStorage.getItem('selfie_image');
      if (selfieImage) {
        setFotoUrl(selfieImage);
        console.log('Foto do usuário (selfie_image) recuperada do localStorage');
      } else {
        // Tentar formato alternativo
        const selfieDataUrl = localStorage.getItem('selfie_data_url');
        if (selfieDataUrl) {
          setFotoUrl(selfieDataUrl);
          console.log('Foto do usuário (selfie_data_url) recuperada do localStorage');
        } else {
          console.log('Foto do usuário não encontrada no localStorage');
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      // Em caso de erro, também definimos valores padrão
      setUserData({
        nome: 'Nome do Entregador',
        cpf: '000.000.000-00',
        cidade: 'Cidade'
      });
    }
  }, []);
  
  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Header />
      
      <div className="w-full bg-[#EE4E2E] py-1 px-6 flex items-center relative overflow-hidden">
        {/* Meia-lua no canto direito */}
        <div className="absolute right-0 top-0 bottom-0 w-32 h-full rounded-l-full bg-[#E83D22]"></div>
        
        <div className="flex items-center relative z-10">
          <div className="text-white mr-3">
            <i className="fas fa-chevron-right text-3xl font-black" style={{color: 'white'}}></i>
          </div>
          <div className="leading-none">
            <h1 className="text-base font-bold text-white mb-0">Treinamento Online</h1>
            <p className="text-white text-sm mt-0" style={{transform: 'translateY(-2px)'}}>Shopee</p>
          </div>
        </div>
      </div>
      
      <div className="flex-grow container mx-auto px-4 py-8">
        <div className="w-full max-w-4xl mx-auto">
          {/* Status de Aprovação */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
            <div className="bg-[#FFF8F6] p-4 border-b border-[#E83D2220]">
              <h3 className="font-semibold text-[#E83D22]">Status do Cadastro</h3>
            </div>
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full space-y-4">
                  <div className="flex justify-center mb-8 mt-8 scale-110 transform">
                    {userData ? (
                      <EntregadorCracha
                        nome={userData.nome}
                        cpf={userData.cpf}
                        cidade={userData.cidade}
                        fotoUrl={fotoUrl || ''}
                      />
                    ) : (
                      <div className="text-center p-4 bg-gray-100 rounded-lg">
                        <p className="text-gray-500">Carregando dados do entregador...</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-6">
                    <p className="text-sm text-gray-700 font-medium">
                      Sua jornada como Motorista Parceiro Shopee está quase completa! <strong>PARA FINALIZAR O PROCESSO 
                      E LIBERAR SEU ACESSO AO SISTEMA</strong>, você precisa concluir o treinamento online oficial 
                      de 3 horas da Shopee para entregadores. 
                      <span className="block mt-2 text-red-600">O treinamento é OBRIGATÓRIO para receber suas credenciais e acessar o aplicativo.</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Sobre o treinamento */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
            <div className="bg-[#FFF8F6] p-4 border-b border-[#E83D2220]">
              <h3 className="font-semibold text-[#E83D22]">Treinamento Online Shopee</h3>
            </div>
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="w-full md:w-2/5">
                  <img 
                    src={kitTreinamentoImage} 
                    alt="Treinamento Shopee" 
                    className="w-full rounded-lg"
                  />
                </div>
                <div className="w-full md:w-3/5">
                  <h4 className="text-lg font-medium mb-3">Curso Online de 3 horas</h4>
                  <p className="text-gray-600 mb-4">
                    Este treinamento essencial capacita você com todos os conhecimentos e habilidades 
                    necessários para atuar como um parceiro Shopee de excelência.
                  </p>
                  
                  <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mb-4">
                    <h5 className="font-bold text-md mb-2">Conteúdo do Treinamento:</h5>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                      <li><strong>Módulo 1:</strong> Introdução à Shopee e à sua plataforma de entregas</li>
                      <li><strong>Módulo 2:</strong> Utilizando o aplicativo de entregas Shopee</li>
                      <li><strong>Módulo 3:</strong> Procedimentos de coleta e entrega</li>
                      <li><strong>Módulo 4:</strong> Segurança e boas práticas</li>
                      <li><strong>Módulo 5:</strong> Atendimento ao cliente e situações especiais</li>
                      <li><strong>Módulo 6:</strong> Gestão financeira e sistema de pagamentos</li>
                    </ul>
                    
                    <div className="mt-3 bg-orange-50 p-3 rounded-md border border-orange-200">
                      <h5 className="text-orange-700 font-bold text-sm mb-1">Certificação Shopee para Entregadores</h5>
                      <p className="text-xs text-orange-700 mb-2">
                        Ao completar o treinamento, você receberá o Certificado Oficial Shopee que é <strong>OBRIGATÓRIO</strong> para:
                      </p>
                      <ul className="list-disc pl-5 space-y-1 text-xs text-orange-700">
                        <li>Receber as credenciais de acesso ao aplicativo Shopee Entregas</li>
                        <li>Ativar seu cadastro como entregador oficial</li>
                        <li>Começar a receber solicitações de entrega na sua região</li>
                        <li>Ter seu primeiro pagamento processado</li>
                      </ul>
                      <p className="text-orange-700 text-xs mt-2 font-bold">
                        Atenção: Sem a conclusão do treinamento de 3 horas, seu acesso ao sistema permanecerá bloqueado.
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-red-50 p-4 rounded-md border border-red-200 mb-4">
                    <h5 className="text-red-700 font-bold text-md mb-2">⚠️ ATENÇÃO: TREINAMENTO OBRIGATÓRIO</h5>
                    <p className="text-sm text-red-800">
                      Este treinamento é <strong>OBRIGATÓRIO</strong> para começar a trabalhar como Entregador Shopee. 
                      Sem a conclusão do curso online de 3 horas:
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-1 text-sm text-red-800">
                      <li>Você <strong>NÃO receberá</strong> as credenciais para acessar o aplicativo</li>
                      <li>Seu cadastro ficará <strong>PENDENTE</strong> no sistema</li>
                      <li>Você <strong>NÃO poderá</strong> receber ou realizar entregas</li>
                      <li>Seu kit de segurança será entregue, mas você <strong>NÃO poderá</strong> iniciar suas atividades</li>
                    </ul>
                  </div>
                  <Button 
                    className="w-full bg-[#EE4E2E] hover:bg-[#D43C1E] text-white font-medium py-3"
                    onClick={() => setModalOpen(true)}
                  >
                    Iniciar Treinamento Agora
                  </Button>
                </div>
              </div>
            </div>
          </div>
          

        </div>
      </div>
      
      {/* Modal de agendamento do treinamento */}
      <TreinamentoModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  );
};

export default Treinamento;