import { apiRequest } from "@/lib/queryClient";

// Chave de storage para verificar mais tarde se o usuário já foi bloqueado
const BANNED_KEY = 'sp_access_blocked';
const BANNED_DEVICE_KEY = 'sp_device_id';

/**
 * Serviço para gerenciar bloqueio de IPs no lado do cliente.
 * Este serviço faz parte do sistema de proteção contra acessos desktop.
 */
export const ipService = {
  /**
   * Reporta um acesso desktop ao backend para banir o IP.
   * Também armazena localmente o bloqueio para evitar contornar com about:blank.
   */
  async reportDesktopAccess(): Promise<void> {
    try {
      // Gravar um identificador único para este dispositivo
      const deviceId = this.generateDeviceId();
      localStorage.setItem(BANNED_DEVICE_KEY, deviceId);
      
      // Marcar o bloqueio permanente no localStorage e sessionStorage
      localStorage.setItem(BANNED_KEY, 'true');
      sessionStorage.setItem(BANNED_KEY, 'true');
      
      // Definir um cookie de bloqueio de longa duração
      document.cookie = `${BANNED_KEY}=true; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/`;
      
      // Enviar para API para banir o IP permanentemente
      await apiRequest("POST", "/api/admin/report-desktop-access", {
        deviceId: deviceId,
        userAgent: navigator.userAgent,
        isAboutBlank: window.location.href.includes('about:blank'),
        screen: {
          width: window.screen.width,
          height: window.screen.height
        }
      });
      
      console.log("Acesso desktop reportado com sucesso");
    } catch (error) {
      console.error("Erro ao reportar acesso desktop:", error);
      
      // Mesmo se falhar a API, ainda mantém o bloqueio local
      localStorage.setItem(BANNED_KEY, 'true');
      sessionStorage.setItem(BANNED_KEY, 'true');
    }
  },

  /**
   * Verifica se o dispositivo/IP atual está banido.
   * Combina verificação local (localStorage/cookie) e remota (API)
   */
  async checkIfBanned(): Promise<{isBanned: boolean, ip?: string}> {
    try {
      // 1. Primeiro verifica localmente (mais rápido)
      const isLocallyBanned = this.isLocallyBanned();
      if (isLocallyBanned) {
        console.log("Dispositivo bloqueado localmente.");
        return { isBanned: true };
      }
      
      // 2. Se não estiver banido localmente, verifica com o servidor
      const response = await fetch("/api/admin/check-ip-banned", {
        method: "GET",
        headers: {
          "Accept": "application/json"
        }
      });
      const data = await response.json();
      
      // 3. Se estiver banido no servidor, atualiza o estado local também
      if (data.isBanned) {
        console.log("IP banido confirmado pelo servidor");
        
        // Marca bloqueio localmente também
        localStorage.setItem(BANNED_KEY, 'true');
        sessionStorage.setItem(BANNED_KEY, 'true');
        document.cookie = `${BANNED_KEY}=true; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/`;
        
        // Se tiver um device ID salvo, enviar para o servidor para consolidar bloqueio
        const deviceId = localStorage.getItem(BANNED_DEVICE_KEY);
        if (deviceId) {
          this.registerDeviceId(deviceId).catch(console.error);
        }
      }
      
      return {
        isBanned: !!data.isBanned,
        ip: data.ip
      };
    } catch (error) {
      console.error("Erro ao verificar se IP está banido:", error);
      
      // Em caso de erro de conexão, verificamos localmente como última tentativa
      const isLocallyBanned = this.isLocallyBanned();
      if (isLocallyBanned) {
        return { isBanned: true };
      }
      
      // Só aqui assumimos que não está banido (último caso)
      return { isBanned: false };
    }
  },

  /**
   * Verifica se o dispositivo atual está marcado como banido localmente
   */
  isLocallyBanned(): boolean {
    // Verificar localStorage
    const localBan = localStorage.getItem(BANNED_KEY);
    if (localBan === 'true') return true;
    
    // Verificar sessionStorage
    const sessionBan = sessionStorage.getItem(BANNED_KEY);
    if (sessionBan === 'true') return true;
    
    // Verificar cookies
    return document.cookie.split(';').some(cookie => 
      cookie.trim().startsWith(`${BANNED_KEY}=true`)
    );
  },

  /**
   * Envia o deviceId para o servidor para consolidar o bloqueio
   */
  async registerDeviceId(deviceId: string): Promise<void> {
    try {
      await apiRequest("POST", "/api/admin/register-device", { deviceId });
    } catch (error) {
      console.error("Erro ao registrar deviceId:", error);
    }
  },

  /**
   * Gera um identificador único para este dispositivo baseado em características do navegador
   */
  generateDeviceId(): string {
    const components = [
      navigator.userAgent,
      navigator.language,
      new Date().getTimezoneOffset(),
      screen.colorDepth,
      screen.width + 'x' + screen.height,
      navigator.hardwareConcurrency || ''
    ];
    
    // Criar um hash simples
    let hash = 0;
    const str = components.join('|||');
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0; // Converter para 32bit integer
    }
    
    return 'dev_' + Math.abs(hash).toString(16) + '_' + Date.now().toString(36);
  },

  /**
   * Bloqueia o acesso quando um IP/dispositivo está banido.
   * Muito mais eficaz que apenas redirecionar para about:blank.
   */
  redirectToBlankPage(): void {
    // 1. Marcar como banido em múltiplos armazenamentos locais
    localStorage.setItem(BANNED_KEY, 'true');
    sessionStorage.setItem(BANNED_KEY, 'true');
    document.cookie = `${BANNED_KEY}=true; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/`;
    
    // 2. Desabilitar todo o site e mostrar mensagem de bloqueio permanente
    document.body.innerHTML = `
      <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: #000; color: #fff; display: flex; flex-direction: column; justify-content: center; align-items: center; z-index: 99999; text-align: center; font-family: Arial, sans-serif;">
        <h1 style="color: #f00; font-size: 24px; margin-bottom: 20px;">ACESSO BLOQUEADO</h1>
        <p style="font-size: 16px; max-width: 80%; line-height: 1.5;">Seu IP foi permanentemente banido por violar os termos de uso. Esta plataforma é exclusiva para dispositivos móveis.</p>
      </div>
    `;
    
    // 3. Aplicar CSS para prevenir qualquer alteração ou bypass
    const style = document.createElement('style');
    style.innerHTML = `
      * { display: none !important; }
      body, html { overflow: hidden !important; margin: 0 !important; padding: 0 !important; }
      body > div:first-child { display: flex !important; }
      body > div:first-child * { display: block !important; }
    `;
    document.head.appendChild(style);
    
    // 4. Bloquear tentativas de recuperação via JavaScript
    setInterval(() => {
      // Verificar periodicamente se alguém tentou remover nosso bloqueio
      if (!document.body.querySelector('div[style*="ACESSO BLOQUEADO"]')) {
        window.location.reload(); // Recarregar a página se o bloqueio for removido
      }
    }, 500);
    
    // 5. Usar about:blank como fallback apenas se tudo acima falhar
    setTimeout(() => {
      try {
        window.location.href = "about:blank";
      } catch (e) {
        console.error("Falha ao redirecionar para about:blank", e);
      }
    }, 3000);
  }
};