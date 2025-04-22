import React, { useState } from 'react';
import { useLocation, useRoute } from 'wouter';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useAppContext } from '@/contexts/AppContext';
import { LoadingModal } from '@/components/LoadingModal';

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
    }, "Formato deve ser ABC-1234 (antigo) ou ABC1D23 (Mercosul)"),
});

type FormValues = z.infer<typeof formSchema>;

enum TipoVeiculo {
  CARRO = "carro",
  MOTO = "moto",
}

const Cadastro: React.FC = () => {
  const { cepData } = useAppContext();
  const [tipoVeiculo, setTipoVeiculo] = useState<TipoVeiculo | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
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
            <h1 className="text-base font-bold text-white mb-0">Motorista Parceiro</h1>
            <p className="text-white text-sm mt-0" style={{transform: 'translateY(-2px)'}}>Shopee</p>
          </div>
        </div>
      </div>
      
      <div className="flex-grow container mx-auto px-2 py-8 w-full">
        <div className="w-full mx-auto p-6 mb-8">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Cadastro de Entregador Parceiro</h1>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="cpf" className="block text-base font-medium text-gray-800 mb-2">
                  CPF
                </label>
                <Input
                  id="cpf"
                  {...register('cpf')}
                  value={cpfValue}
                  onChange={handleCpfChange}
                  placeholder="000.000.000-00"
                  className={errors.cpf ? 'border-red-500' : ''}
                  inputMode="numeric"
                />
                {errors.cpf && (
                  <p className="mt-1 text-sm text-red-600">{errors.cpf.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="nome" className="block text-base font-medium text-gray-800 mb-2">
                  Nome Completo
                </label>
                <Input
                  id="nome"
                  {...register('nome')}
                  placeholder="Digite seu nome completo"
                  className={errors.nome ? 'border-red-500' : ''}
                />
                {errors.nome && (
                  <p className="mt-1 text-sm text-red-600">{errors.nome.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="telefone" className="block text-base font-medium text-gray-800 mb-2">
                  Telefone
                </label>
                <Input
                  id="telefone"
                  {...register('telefone')}
                  value={telefoneValue}
                  onChange={handleTelefoneChange}
                  placeholder="(00) 00000-0000"
                  className={errors.telefone ? 'border-red-500' : ''}
                  inputMode="numeric"
                />
                {errors.telefone && (
                  <p className="mt-1 text-sm text-red-600">{errors.telefone.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-base font-medium text-gray-800 mb-2">
                  E-mail
                </label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="seu@email.com"
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div className="pt-4">
                <label className="block text-lg font-medium text-gray-800 mb-4">
                  Qual veículo você utiliza?
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setTipoVeiculo(TipoVeiculo.CARRO)}
                    className={`flex flex-col items-center justify-center p-6 ${
                      tipoVeiculo === TipoVeiculo.CARRO
                        ? 'border-[#E83D22] border-3 bg-[#FFF8F6]'
                        : 'border-gray-200 border-2 bg-white hover:bg-gray-50'
                    } rounded-lg transition-colors`}
                  >
                    <div className="mb-3 h-24 flex items-center justify-center">
                      <img src={shopeeCarsImage} alt="Carros Shopee" className="h-full w-auto object-contain" />
                    </div>
                    <span className={`font-medium ${
                      tipoVeiculo === TipoVeiculo.CARRO ? 'text-[#E83D22]' : 'text-gray-700'
                    }`}>
                      Carro
                    </span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setTipoVeiculo(TipoVeiculo.MOTO)}
                    className={`flex flex-col items-center justify-center p-6 ${
                      tipoVeiculo === TipoVeiculo.MOTO
                        ? 'border-[#E83D22] border-3 bg-[#FFF8F6]'
                        : 'border-gray-200 border-2 bg-white hover:bg-gray-50'
                    } rounded-lg transition-colors`}
                  >
                    <div className="mb-3 h-20 flex items-center justify-center">
                      <img src={shopeeMotoImage} alt="Moto Shopee" className="h-full object-contain" />
                    </div>
                    <span className={`font-medium ${
                      tipoVeiculo === TipoVeiculo.MOTO ? 'text-[#E83D22]' : 'text-gray-700'
                    }`}>
                      Moto
                    </span>
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <label htmlFor="placa" className="block text-base font-medium text-gray-800 mb-2">
                  Placa do Veículo
                </label>
                <Input
                  id="placa"
                  {...register('placa')}
                  onChange={handlePlacaChange}
                  placeholder="ABC-1234 ou ABC1D23"
                  className={errors.placa ? 'border-red-500' : ''}
                />
                {errors.placa && (
                  <p className="mt-1 text-sm text-red-600">{errors.placa.message}</p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#E83D22] hover:bg-[#d73920] text-white font-medium py-6 text-base rounded-[3px]"
              disabled={isSubmitting}
              style={{ height: '50px' }}
            >
              {isSubmitting ? 'Processando...' : 'Prosseguir'}
            </Button>
          </form>
        </div>
      </div>
      
      <Footer />
      
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