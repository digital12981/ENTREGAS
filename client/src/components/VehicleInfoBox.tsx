import { useEffect } from 'react';
import { useVehicleInfo } from '@/hooks/use-vehicle-info';
import { Loader2 } from 'lucide-react';

interface VehicleInfoBoxProps {
  licensePlate: string;
  onChange?: (hasValidVehicle: boolean) => void;
  className?: string;
}

/**
 * Componente que exibe informações de veículo a partir da placa
 */
export function VehicleInfoBox({ licensePlate, onChange, className = '' }: VehicleInfoBoxProps) {
  // Hook para buscar informações do veículo
  const { vehicleInfo, isLoading, error, fetchVehicleInfo } = useVehicleInfo();

  // Buscar informações do veículo quando a placa mudar
  useEffect(() => {
    const timer = setTimeout(() => {
      if (licensePlate && licensePlate.length >= 7) {
        fetchVehicleInfo(licensePlate);
      }
    }, 500); // Pequeno debounce para evitar requisições excessivas

    return () => clearTimeout(timer);
  }, [licensePlate, fetchVehicleInfo]);

  // Notificar componente pai sobre a validade do veículo
  useEffect(() => {
    if (onChange) {
      // Veículo é válido se temos dados e não há erro
      const isValid = !!vehicleInfo && !vehicleInfo.error && !error;
      onChange(isValid);
    }
  }, [vehicleInfo, error, onChange]);

  // Se não tem placa ou é muito curta, mostra mensagem solicitando
  if (!licensePlate || licensePlate.length < 5) {
    return (
      <div className={`p-4 border rounded-md bg-gray-50 text-gray-500 ${className}`}>
        Insira a placa do veículo para consultar informações
      </div>
    );
  }

  // Se está carregando, mostra indicador
  if (isLoading) {
    return (
      <div className={`p-4 border rounded-md bg-gray-50 flex items-center justify-center ${className}`}>
        <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
        <span>Consultando informações...</span>
      </div>
    );
  }

  // Se tem erro, mostra mensagem
  if (error || (vehicleInfo && vehicleInfo.error)) {
    return (
      <div className={`p-4 border rounded-md bg-red-50 text-red-700 ${className}`}>
        {error || vehicleInfo?.error || 'Erro ao consultar veículo'}
      </div>
    );
  }

  // Se tem dados, mostra informações do veículo
  if (vehicleInfo) {
    return (
      <div className={`p-4 border rounded-md bg-green-50 ${className}`}>
        <h3 className="font-semibold text-green-800 mb-2">Informações do Veículo</h3>
        <div className="space-y-1 text-sm">
          <p><span className="font-medium">Marca:</span> {vehicleInfo.MARCA}</p>
          <p><span className="font-medium">Modelo:</span> {vehicleInfo.MODELO}</p>
          {vehicleInfo.ano && <p><span className="font-medium">Ano:</span> {vehicleInfo.ano}</p>}
          {vehicleInfo.anoModelo && <p><span className="font-medium">Ano Modelo:</span> {vehicleInfo.anoModelo}</p>}
          {vehicleInfo.cor && <p><span className="font-medium">Cor:</span> {vehicleInfo.cor}</p>}
        </div>
      </div>
    );
  }

  // Estado vazio (placa inserida mas ainda não consultou)
  return (
    <div className={`p-4 border rounded-md bg-gray-50 text-gray-500 ${className}`}>
      Aguardando consulta de informações do veículo...
    </div>
  );
}