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
/**
 * Hook para proteção contra acesso desktop.
 * Verifica se o dispositivo atual é desktop e, se for, reporta para banimento.
 * Inclui exceções para ambiente de desenvolvimento e IPs específicos.
 */
export function useDesktopProtection() {
  React.useEffect(() => {
    const checkAccess = async () => {
      try {
        // Lista de domínios permitidos (podem ser carregados do ambiente ou da API)
        const allowedDomains = ['replit.dev', 'replit.com', 'localhost', '127.0.0.1'];
        
        // Lista de IPs que nunca devem ser banidos
        const neverBanIPs = ['201.87.251.220']; // IP específico do cliente (sempre permitido)
        
        // Verificar se estamos em ambiente de desenvolvimento
        const isDevelopment = 
          process.env.NODE_ENV === 'development' || 
          allowedDomains.some(domain => window.location.hostname.includes(domain));
          
        // Se for ambiente de desenvolvimento, não verifica banimento
        if (isDevelopment) {
          console.log("Ambiente de desenvolvimento detectado. Proteção desktop desativada.");
          return;
        }
        
        // Verificar se o IP atual já está banido
        const response = await ipService.checkIfBanned();
        
        // Se já estiver banido, redireciona
        if (response.isBanned) {
          console.log("IP está banido, bloqueando acesso...");
          ipService.redirectToBlankPage();
          return;
        }
        
        // Verificar se o IP está na lista de exceções
        const clientIp = response.ip || '';
        const isIpExempted = neverBanIPs.some(allowedIp => clientIp.includes(allowedIp));
        
        if (isIpExempted) {
          console.log("IP na lista de exceções. Acesso permitido em qualquer dispositivo.");
          return;
        }
        
        // Se não estiver banido, verifica se é desktop
        const md = new MobileDetect(window.navigator.userAgent);
        const isDesktop = !md.mobile() && !md.tablet() && !md.phone();
        
        // Se for desktop e não for um IP da lista de exceções, banir
        if (isDesktop) {
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