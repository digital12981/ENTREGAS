import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/hooks/use-toast';
import { useScrollTop } from '@/hooks/use-scroll-top';
import { API_BASE_URL } from '../lib/api-config';

import pixLogo from '../assets/pix-logo.png';
import kitEpiImage from '../assets/kit-epi-new.webp';

interface PaymentInfo {
  id: string;
  pixCode: string;
  pixQrCode: string;
  timeLeft?: number;
}

const Payment: React.FC = () => {
  useScrollTop();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(30 * 60); // 30 minutos em segundos
  const timerRef = useRef<number | null>(null);
  
  // Informações do usuário
  const [name, setName] = useState<string>('');
  const [cpf, setCpf] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Buscar parâmetros da URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    const emailParam = urlParams.get('email');
    
    if (!id || !emailParam) {
      setErrorMessage('Link de pagamento inválido. Verifique o link recebido por email.');
      setIsLoading(false);
      return;
    }
    
    setEmail(emailParam);
    fetchPaymentInfo(id);
  }, []);

  // Buscar informações de pagamento da API
  const fetchPaymentInfo = async (id: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/payments/${id}`);
      
      if (!response.ok) {
        throw new Error('Não foi possível recuperar as informações de pagamento');
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setPaymentInfo({
        id: data.id,
        pixCode: data.pixCode,
        pixQrCode: data.pixQrCode
      });
      
      // Extrair nome e CPF das informações recuperadas
      if (data.name) setName(data.name);
      if (data.cpf) setCpf(data.cpf);
      
    } catch (error: any) {
      console.error('Erro ao recuperar informações de pagamento:', error);
      setErrorMessage(error.message || 'Ocorreu um erro ao carregar as informações de pagamento.');
    } finally {
      setIsLoading(false);
    }
  };

  // Configurar o cronômetro
  useEffect(() => {
    if (paymentInfo && timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000) as unknown as number;
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paymentInfo, timeLeft]);

  // Formatar o tempo restante
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Copiar código PIX para área de transferência
  const copiarCodigoPix = () => {
    if (paymentInfo?.pixCode) {
      navigator.clipboard.writeText(paymentInfo.pixCode);
      toast({
        title: "Código PIX copiado!",
        description: "O código PIX foi copiado para a área de transferência.",
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
            <h1 className="text-base font-bold text-white mb-0">Pagamento Personalizado</h1>
            <p className="text-white text-sm mt-0" style={{transform: 'translateY(-2px)'}}>Shopee</p>
          </div>
        </div>
      </div>
      
      <div className="flex-grow container mx-auto px-4 py-8">
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
            <div className="bg-[#FFF8F6] p-4 border-b border-[#E83D2220]">
              <h3 className="font-semibold text-[#E83D22] text-center">Pagamento do Kit de Segurança</h3>
            </div>
            
            <div className="p-4">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="text-[#E83D22]">
                    <Spinner size="lg" />
                  </div>
                  <p className="mt-4 text-gray-600">Carregando informações de pagamento...</p>
                </div>
              ) : errorMessage ? (
                <div className="py-8 text-center">
                  <div className="text-red-500 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Erro no Pagamento</h3>
                  <p className="text-gray-600 mb-6">{errorMessage}</p>
                  <Button
                    onClick={() => setLocation('/')}
                    className="bg-[#E83D22] hover:bg-[#d73920]"
                  >
                    Voltar para a Página Inicial
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Cabeçalho com imagem e dados */}
                  <div className="flex flex-row gap-3 items-start">
                    <div className="flex-shrink-0">
                      <img 
                        src={kitEpiImage} 
                        alt="Kit EPI Shopee" 
                        className="w-20 rounded-md"
                      />
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-sm font-medium text-gray-800">Kit de Segurança Oficial</h3>
                      <p className="text-lg font-bold text-[#E83D22]">R$ 84,70</p>
                      
                      <div className="w-full mt-1">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Nome:</span> {name}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">CPF:</span> {cpf}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Email:</span> {email}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Status de pagamento com spinner */}
                  <div className="flex items-center justify-center gap-2 py-2 bg-[#fff8f6] rounded-md">
                    <div className="text-[#E83D22] animate-spin">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-700 font-medium">
                      Aguardando pagamento PIX...
                    </p>
                  </div>
                  
                  {/* QR Code */}
                  <div className="flex flex-col items-center">
                    <div className="mb-2">
                      <img 
                        src={pixLogo}
                        alt="PIX Logo"
                        className="h-8 mb-2 mx-auto"
                      />
                    </div>
                    
                    <img 
                      src={paymentInfo?.pixQrCode} 
                      alt="QR Code PIX" 
                      className="w-full max-w-[200px] h-auto mx-auto"
                    />
                    
                    {/* Tempo restante */}
                    <div className="bg-[#fff3e6] border-[#E83D22] border p-2 rounded-md mt-3 w-[80%] mx-auto">
                      <div className="flex items-center justify-center gap-2">
                        <div className="text-[#E83D22]">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                          </svg>
                        </div>
                        <div className="flex flex-col">
                          <p className="text-sm text-gray-700 font-medium">
                            PIX expira em <span className="text-[#E83D22] font-bold">{formatTime(timeLeft)}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Código PIX e botão copiar */}
                  <div className="mt-4">
                    <p className="text-sm text-gray-700 mb-2 font-medium text-center">
                      Copie o código PIX e pague no seu aplicativo de banco:
                    </p>
                    <div className="relative">
                      <div 
                        className="bg-gray-50 p-3 rounded-md border border-gray-200 text-sm text-gray-600 break-all pr-12 max-h-[80px] overflow-y-auto"
                      >
                        {paymentInfo?.pixCode}
                      </div>
                      <Button
                        variant="ghost"
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 text-[#E83D22] hover:text-[#d73920] p-1"
                        onClick={copiarCodigoPix}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-4 text-center">
                    <p className="text-xs text-gray-500">
                      Após o pagamento, o sistema atualizará automaticamente seu cadastro.
                      Você receberá um e-mail com a confirmação do pagamento.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Payment;