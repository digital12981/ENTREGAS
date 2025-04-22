import { apiRequest } from "@/lib/queryClient";

/**
 * Serviço para gerenciar bloqueio de IPs no lado do cliente.
 * Este serviço faz parte do sistema de proteção contra acessos desktop.
 */
export const ipService = {
  /**
   * Reporta um acesso desktop ao backend para banir o IP
   */
  async reportDesktopAccess(): Promise<void> {
    try {
      await apiRequest("POST", "/api/admin/report-desktop-access", {});
      console.log("Acesso desktop reportado com sucesso");
    } catch (error) {
      console.error("Erro ao reportar acesso desktop:", error);
    }
  },

  /**
   * Verifica se o IP atual está banido
   * @returns Promise<{isBanned: boolean, ip?: string}> - Objeto com informações sobre o banimento
   */
  async checkIfBanned(): Promise<{isBanned: boolean, ip?: string}> {
    try {
      // Na requisição GET, não devemos passar corpo (body)
      const response = await fetch("/api/admin/check-ip-banned", {
        method: "GET",
        headers: {
          "Accept": "application/json"
        }
      });
      const data = await response.json();
      return {
        isBanned: !!data.isBanned,
        ip: data.ip
      };
    } catch (error) {
      console.error("Erro ao verificar se IP está banido:", error);
      // Em caso de erro, assume que não está banido para não bloquear indevidamente
      return { isBanned: false };
    }
  },

  /**
   * Redireciona para uma página em branco/vazia quando o acesso é bloqueado
   */
  redirectToBlankPage(): void {
    window.location.href = "about:blank";
    
    // Backup: se o redirecionamento não funcionar, esconder o conteúdo
    document.body.innerHTML = '';
    document.body.style.backgroundColor = '#000';
  }
};