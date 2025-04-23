import { FC, useState } from 'react';
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
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from 'wouter';

interface TreinamentoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

    // Fecha o modal
    onOpenChange(false);
    
    // Redireciona para a página de pagamento dos honorários
    setLocation("/pagamento-instrutor");
    
    // Exibe toast de confirmação
    toast({
      title: "Agendamento realizado!",
      description: `Seu treinamento foi agendado para ${format(date, "dd/MM/yyyy", { locale: ptBR })} às ${horario}.`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
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
      </DialogContent>
    </Dialog>
  );
};

export default TreinamentoModal;