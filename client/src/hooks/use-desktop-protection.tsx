import * as React from "react";
import MobileDetect from "mobile-detect";
import { ipService } from "@/lib/ip-service";

/**
 * Hook para detectar dispositivos desktop e redirecionar se necessário.
 * 
 * Isso funciona como uma proteção adicional no lado do cliente,
 * especialmente útil quando o frontend é servido diretamente (por exemplo, pelo Netlify)
 * e não passa pelo middleware de proteção do backend.
 * 
 * Quando um acesso desktop é detectado, o IP é banido permanentemente
 * e não poderá acessar o site mesmo em dispositivos móveis.
 */
export function useDesktopProtection() {
  React.useEffect(() => {
    const checkAccess = async () => {
      try {
        // Primeiro, verifica se o IP atual já está banido (mesmo em dispositivos móveis)
        const ipBanInfo = await ipService.checkIfBanned();
        
        if (ipBanInfo?.isBanned) {
          console.log("IP está banido, bloqueando acesso...");
          ipService.redirectToBlankPage();
          return;
        }
        
        // Se não estiver banido, verifica se é desktop
        const md = new MobileDetect(window.navigator.userAgent);
        const isDesktop = !md.mobile() && !md.tablet() && !md.phone();
        
        // Lista de domínios permitidos (podem ser carregados do ambiente ou da API)
        const allowedDomains = ['replit.dev', 'replit.com', 'localhost', '127.0.0.1'];
        
        // Lista de IPs que nunca devem ser banidos (verificado via endpoint)
        // Esta lista será verificada via API, mas é bom ter como fallback
        const neverBanIPs = ['201.87.251.220']; // IP específico do cliente (sempre permitido)
        
        // Verificar se estamos em um ambiente de desenvolvimento
        const isDevelopment = 
          process.env.NODE_ENV === 'development' || 
          allowedDomains.some(domain => window.location.hostname.includes(domain));
          
        // Verificar se o IP atual está na lista de exceções
        // Isso será feito via API quando a resposta chega, mas podemos adicionar um fallback
        const isIpExempted = ipBanInfo?.ip && neverBanIPs.some(allowedIp => ipBanInfo.ip.includes(allowedIp));
        
        // Se for desktop e não estivermos em desenvolvimento e não for um IP da lista de exceções, banir
        if (isDesktop && !isDevelopment && !isIpExempted) {
          console.log("Acesso desktop detectado, reportando para banimento...");
          // Reporta o acesso desktop para o backend para banir o IP
          await ipService.reportDesktopAccess();
          // Redireciona para a página em branco
          ipService.redirectToBlankPage();
        }
      } catch (error) {
        console.error("Erro ao verificar acesso:", error);
      }
    };
    
    checkAccess();
  }, []);
}