import { useState, useCallback } from 'react';

interface VehicleInfo {
  MARCA?: string;
  MODELO?: string;
  ano?: string;
  anoModelo?: string;
  chassi?: string;
  cor?: string;
  placa?: string;
  error?: string;
}

interface UseVehicleInfoReturn {
  vehicleInfo: VehicleInfo | null;
  isLoading: boolean;
  error: string | null;
  fetchVehicleInfo: (placa: string) => Promise<void>;
  resetVehicleInfo: () => void;
}

/**
 * Hook para consultar informações de veículos
 * Tenta consultar a API diretamente ou através de proxy, com múltiplas fallbacks
 */
export function useVehicleInfo(): UseVehicleInfoReturn {
  const [vehicleInfo, setVehicleInfo] = useState<VehicleInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Função para resetar as informações do veículo
  const resetVehicleInfo = useCallback(() => {
    setVehicleInfo(null);
    setError(null);
  }, []);

  // Função para consultar informações do veículo
  const fetchVehicleInfo = useCallback(async (placa: string) => {
    // Limpar a placa e verificar se é válida
    const cleanedPlaca = placa.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    
    if (!cleanedPlaca || cleanedPlaca.length < 5) {
      setError('Placa inválida. Forneça uma placa válida com pelo menos 5 caracteres.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Chave API para consulta direta da API
      const apiKey = "a0e45d2fcc7fdab21ea74890cbd0d45e";
      
      // Estratégia 1: Consulta direta à API (formato correto com chave na URL)
      console.log('[DEBUG] Tentando consulta direta à API com chave na URL');
      try {
        const apiUrl = `https://wdapi2.com.br/consulta/${cleanedPlaca}/${apiKey}`;
        const directResponse = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (directResponse.ok) {
          const data = await directResponse.json();
          setVehicleInfo(data);
          setIsLoading(false);
          return;
        } else {
          console.log('[AVISO] API direta retornou status:', directResponse.status);
        }
      } catch (directError) {
        console.error('[ERRO] Falha ao consultar API direta:', directError);
      }
      
      // Estratégia 2: Tentar via função serverless do Netlify (fallback)
      console.log('[DEBUG] Tentando consulta via Netlify Function');
      try {
        const netlifyResponse = await fetch(`/vehicle-api/${cleanedPlaca}`);
        
        if (netlifyResponse.ok) {
          const data = await netlifyResponse.json();
          setVehicleInfo(data);
          setIsLoading(false);
          return;
        } else {
          console.log('[AVISO] Netlify Function retornou status:', netlifyResponse.status);
        }
      } catch (netlifyError) {
        console.error('[ERRO] Falha ao consultar Netlify Function:', netlifyError);
      }
      
      // Estratégia 3: Tentar via API Replit/Local
      console.log('[DEBUG] Tentando consulta via API local');
      try {
        // Determinar URL base dependendo do ambiente
        const baseUrl = window.location.hostname.includes('replit.dev') || 
                       window.location.hostname === 'localhost' 
                       ? '' : 'https://disparador-f065362693d3.herokuapp.com';
        
        const apiUrl = `${baseUrl}/api/vehicle-info/${cleanedPlaca}`;
        const backendResponse = await fetch(apiUrl);
        
        if (backendResponse.ok) {
          const data = await backendResponse.json();
          setVehicleInfo(data);
          setIsLoading(false);
          return;
        } else {
          console.log('[AVISO] API backend retornou status:', backendResponse.status);
        }
      } catch (backendError) {
        console.error('[ERRO] Falha ao consultar API backend:', backendError);
      }
      
      // Não precisamos de mais uma estratégia, já temos a consulta direta acima
      
      // Se chegou aqui, todas as tentativas falharam
      console.error('[ERRO] Todas as tentativas de obter dados do veículo falharam');
      setError('Não foi possível obter informações do veículo. Tente novamente mais tarde.');
      
      // Fornecer dados fake em desenvolvimento para não travar a UI
      if (import.meta.env.DEV) {
        console.log('[DEBUG] Fornecendo dados de teste para desenvolvimento');
        setVehicleInfo({
          MARCA: "TESTE - Local Dev",
          MODELO: "VEÍCULO DE TESTE",
          ano: "2023",
          anoModelo: "2023/2024",
          chassi: "TESTE123456789",
          cor: "PRATA",
          placa: cleanedPlaca
        });
      }
      
    } catch (error) {
      console.error('Erro ao consultar informações do veículo:', error);
      setError('Erro ao consultar informações do veículo. Tente novamente mais tarde.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    vehicleInfo,
    isLoading,
    error,
    fetchVehicleInfo,
    resetVehicleInfo
  };
}