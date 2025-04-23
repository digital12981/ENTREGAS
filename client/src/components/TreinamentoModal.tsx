import { FC, useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Loader2, CheckCircle2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from 'wouter';
import { API_BASE_URL } from '@/lib/api-config';

interface TreinamentoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface PaymentInfo {
  id: string;
  pixCode: string;
  pixQrCode: string;
  status?: string;
}

const horarios = [
  "08:00", "09:00", "10:00", "11:00", 
  "13:00", "14:00", "15:00", "16:00", "17:00"
];

// Função para adicionar dias úteis a uma data
function adicionarDiasUteis(data: Date, dias: number) {
  const resultado = new Date(data);
  let diasAdicionados = 0;
  
  while (diasAdicionados < dias) {
    resultado.setDate(resultado.getDate() + 1);
    // 0 = Domingo, 6 = Sábado
    const diaDaSemana = resultado.getDay();
    if (diaDaSemana !== 0 && diaDaSemana !== 6) {
      diasAdicionados++;
    }
  }
  
  return resultado;
}

const TreinamentoModal: FC<TreinamentoModalProps> = ({ open, onOpenChange }) => {
  const [date, setDate] = useState<Date | undefined>(adicionarDiasUteis(new Date(), 1));
  const [horario, setHorario] = useState<string>("09:00");
  const [email, setEmail] = useState<string>("");
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  
  // Estados para controlar a etapa do modal
  const [step, setStep] = useState<'schedule' | 'payment'>('schedule');
  const [isLoading, setIsLoading] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);

  // Desabilita datas no passado, finais de semana e feriados
  const disabledDays = (date: Date) => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    // Desabilita datas no passado e hoje
    if (date < hoje) return true;
    
    // Desabilita finais de semana (0 = domingo, 6 = sábado)
    const diaDaSemana = date.getDay();
    return diaDaSemana === 0 || diaDaSemana === 6;
  };

  // Criar pagamento PIX via API
  const createPixPayment = async () => {
    setIsLoading(true);
    
    try {
      // Dados fixos para o pagamento conforme solicitado
      const paymentData = {
        name: "Marina Souza",
        email: "compradecurso@gmail.com",
        cpf: "83054235149",
        phone: "11998346572",
        amount: 4990,
        items: [
          {
            title: "Crachá Shopee + Treinamento Exclusivo",
            quantity: 1,
            unitPrice: 4990,
            tangible: false
          }
        ]
      };
      
      // Criar rota exclusiva para pagamento do treinamento
      const response = await fetch(`${API_BASE_URL}/api/payments/treinamento`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });
      
      if (!response.ok) {
        throw new Error("Erro ao processar o pagamento. Por favor, tente novamente.");
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      // Armazenar as informações do pagamento
      setPaymentInfo({
        id: data.id,
        pixCode: data.pixCode,
        pixQrCode: data.pixQrCode,
        status: 'PENDING'
      });
      
      // Exibe toast de confirmação
      toast({
        title: "Agendamento realizado!",
        description: `Seu treinamento foi agendado para ${format(date!, "dd/MM/yyyy", { locale: ptBR })} às ${horario}.`,
      });
    } catch (error: any) {
      console.error("Erro ao criar pagamento:", error);
      toast({
        title: "Erro ao processar o pagamento",
        description: error.message || "Ocorreu um erro ao processar o pagamento. Por favor, tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = () => {
    if (!date) {
      toast({
        title: "Selecione uma data",
        description: "Por favor, selecione uma data para o treinamento.",
        variant: "destructive"
      });
      return;
    }

    if (!email) {
      toast({
        title: "Confirme seu email",
        description: "Por favor, confirme seu email para agendarmos o treinamento.",
        variant: "destructive"
      });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({
        title: "Email inválido",
        description: "Por favor, informe um email válido.",
        variant: "destructive"
      });
      return;
    }
    
    // Alterar para a etapa de pagamento
    setStep('payment');
    
    // Iniciar o processo de pagamento
    createPixPayment();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        {step === 'schedule' ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl text-[#E83D22] font-bold">Agende seu Treinamento</DialogTitle>
              <DialogDescription>
                Escolha uma data e horário para realizar seu treinamento online obrigatório com um instrutor oficial da Shopee.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-6 py-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-orange-100 text-[#E83D22]">
                  <span className="text-xl font-bold">1</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800">Instrutor Oficial Shopee</h3>
                  <p className="text-sm text-gray-600">
                    O treinamento será realizado por videochamada com um instrutor certificado que irá ensinar tudo o que você 
                    precisa saber para começar a trabalhar como entregador Shopee.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-orange-100 text-[#E83D22]">
                  <span className="text-xl font-bold">2</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800">Escolha a data</h3>
                  <div className="flex flex-col space-y-1.5">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal mt-2",
                            !date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : "Selecione uma data"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          disabled={disabledDays}
                          locale={ptBR}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-orange-100 text-[#E83D22]">
                  <span className="text-xl font-bold">3</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800">Escolha o horário</h3>
                  <div className="flex flex-col space-y-1.5">
                    <Select defaultValue={horario} onValueChange={setHorario}>
                      <SelectTrigger className="w-full mt-2">
                        <SelectValue placeholder="Selecione um horário" />
                      </SelectTrigger>
                      <SelectContent>
                        {horarios.map((hora) => (
                          <SelectItem key={hora} value={hora}>
                            {hora}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-orange-100 text-[#E83D22]">
                  <span className="text-xl font-bold">4</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800">Confirme seu email</h3>
                  <div className="flex flex-col space-y-1.5">
                    <Input 
                      type="email" 
                      placeholder="seu-email@exemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-2"
                    />
                    <p className="text-xs text-gray-500">
                      Você receberá o link da videochamada e instruções neste email.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200 mt-2">
                <h4 className="font-semibold text-yellow-800 mb-1">Informação importante:</h4>
                <p className="text-sm text-yellow-700">
                  Para finalizar o agendamento, é necessário efetuar o pagamento do honorário do instrutor e do crachá
                  oficial de entregador Shopee que será emitido após a conclusão do treinamento.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button 
                type="submit" 
                className="w-full bg-[#EE4E2E] hover:bg-[#D43C1E] text-white" 
                onClick={handleSubmit}
              >
                Continuar para pagamento
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl text-[#E83D22] font-bold">Pagamento Obrigatório</DialogTitle>
              <DialogDescription>
                Para confirmar seu agendamento, você precisa realizar o pagamento do curso online e emissão do crachá de entregador.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-6 py-4">
              {isLoading && (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-12 h-12 text-[#E83D22] animate-spin mb-4" />
                  <p className="text-gray-700 font-medium">Processando pagamento...</p>
                </div>
              )}

              {!isLoading && !paymentInfo && (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="bg-red-50 p-4 rounded-md border border-red-200 w-full">
                    <p className="text-red-700">
                      Ocorreu um erro ao processar o pagamento. Por favor, tente novamente.
                    </p>
                  </div>
                  <Button 
                    className="mt-4 bg-[#EE4E2E] hover:bg-[#D43C1E] text-white" 
                    onClick={() => setStep('schedule')}
                  >
                    Voltar
                  </Button>
                </div>
              )}

              {!isLoading && paymentInfo && (
                <div className="space-y-6">
                  <div className="bg-green-50 p-4 rounded-md border border-green-200">
                    <div className="flex">
                      <CheckCircle2 className="h-6 w-6 text-green-600 mr-3 shrink-0" />
                      <div>
                        <h3 className="font-semibold text-green-800">Agendamento Confirmado!</h3>
                        <p className="text-sm text-green-700">
                          Seu treinamento foi agendado para {date ? format(date, "dd/MM/yyyy", { locale: ptBR }) : ""} às {horario}.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Detalhes do Pagamento</h3>
                    
                    <div className="space-y-4 mb-4">
                      <div className="flex justify-between p-3 bg-gray-50 rounded-md">
                        <span className="text-gray-700">Curso Online</span>
                        <span className="font-medium">R$ 49,90</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#f7f7f7] p-4 rounded-md border border-gray-200">
                    <h4 className="font-medium text-gray-800 mb-3">Pagamento PIX</h4>
                    <div className="flex justify-center mb-4">
                      <img 
                        src={paymentInfo.pixQrCode} 
                        alt="QR Code PIX" 
                        className="w-52 h-52 border border-gray-200 rounded-md"
                      />
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600 text-center">
                        Escaneie o QR Code acima com o aplicativo do seu banco ou copie o código PIX abaixo
                      </p>
                      <div className="flex">
                        <input 
                          type="text" 
                          value={paymentInfo.pixCode} 
                          readOnly 
                          className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 text-sm"
                        />
                        <Button 
                          onClick={() => {
                            navigator.clipboard.writeText(paymentInfo.pixCode);
                            toast({
                              title: "Código copiado!",
                              description: "O código PIX foi copiado para a área de transferência."
                            });
                          }} 
                          className="rounded-l-none border border-gray-300 bg-gray-100 hover:bg-gray-200 text-gray-800"
                        >
                          Copiar
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
                    <h5 className="font-semibold text-yellow-800 mb-2">Importante:</h5>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-yellow-800">
                      <li>O pagamento deve ser realizado em até 30 minutos</li>
                      <li>Após o pagamento, você receberá o link para a videochamada</li>
                      <li>O treinamento é OBRIGATÓRIO para ativar seu cadastro</li>
                    </ul>
                  </div>
                  
                  <div className="bg-red-50 p-4 rounded-md border border-red-200">
                    <p className="text-sm text-red-700 font-bold">
                      ATENÇÃO: Sem a conclusão do curso online e o pagamento, você NÃO receberá suas credenciais 
                      e NÃO poderá começar a trabalhar como entregador.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline"
                className="w-full" 
                onClick={() => onOpenChange(false)}
              >
                Fechar
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TreinamentoModal;