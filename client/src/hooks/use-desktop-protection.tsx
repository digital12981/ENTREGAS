import * as React from "react";
import MobileDetect from "mobile-detect";

/**
 * Hook para detectar dispositivos desktop e redirecionar se necessário.
 * 
 * Isso funciona como uma proteção adicional no lado do cliente,
 * especialmente útil quando o frontend é servido diretamente (por exemplo, pelo Netlify)
 * e não passa pelo middleware de proteção do backend.
 */
export function useDesktopProtection() {
  React.useEffect(() => {
    const md = new MobileDetect(window.navigator.userAgent);
    const isDesktop = !md.mobile() && !md.tablet() && !md.phone();
    
    // Lista de domínios permitidos (podem ser carregados do ambiente ou da API)
    const allowedDomains = ['replit.dev', 'replit.com', 'localhost', '127.0.0.1'];
    
    // Verificar se estamos em um ambiente de desenvolvimento
    const isDevelopment = 
      process.env.NODE_ENV === 'development' || 
      allowedDomains.some(domain => window.location.hostname.includes(domain));
    
    // Se for desktop e não estivermos em desenvolvimento, redirecionar
    if (isDesktop && !isDevelopment) {
      // Não mostrar mensagem, apenas redirecionar para about:blank para esconder o site
      window.location.href = 'about:blank';
      
      // Backup: se o redirecionamento não funcionar, esconder o conteúdo
      document.body.innerHTML = '';
      document.body.style.backgroundColor = '#000';
    }
  }, []);
}