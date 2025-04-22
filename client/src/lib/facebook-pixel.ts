/**
 * Script de integração com Facebook Pixel
 * Implementação priorizada para execução no frontend (Netlify)
 */

// Facebook Pixel ID fornecido
const FACEBOOK_PIXEL_ID = '1418766538994503';

/**
 * Inicializa o Facebook Pixel
 */
export function initFacebookPixel(): void {
  console.log('[PIXEL] Inicializando Facebook Pixel');
  
  // Adicionar o script do Facebook Pixel à página
  if (typeof window !== 'undefined' && !window.fbq) {
    const head = document.head || document.getElementsByTagName('head')[0];
    const pixelScript = document.createElement('script');
    pixelScript.type = 'text/javascript';
    pixelScript.innerHTML = `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${FACEBOOK_PIXEL_ID}');
      fbq('track', 'PageView');
    `;
    head.appendChild(pixelScript);

    // Adicionar noscript fallback para rastreamento
    const noscript = document.createElement('noscript');
    const img = document.createElement('img');
    img.height = 1;
    img.width = 1;
    img.style.display = 'none';
    img.src = `https://www.facebook.com/tr?id=${FACEBOOK_PIXEL_ID}&ev=PageView&noscript=1`;
    noscript.appendChild(img);
    head.appendChild(noscript);
    
    console.log('[PIXEL] Facebook Pixel inicializado com sucesso.');
  }
}

/**
 * Rastreia um evento do Facebook Pixel
 * @param eventName Nome do evento
 * @param eventData Dados do evento (opcional)
 */
export function trackEvent(eventName: string, eventData?: Record<string, any>): void {
  if (typeof window !== 'undefined') {
    // Inicializar o Pixel se ainda não estiver inicializado
    if (!window.fbq) {
      initFacebookPixel();
      
      // Aguardar a inicialização do pixel
      setTimeout(() => {
        if (window.fbq) {
          console.log(`[PIXEL] Rastreando evento após inicialização: ${eventName}`, eventData || '');
          window.fbq('track', eventName, eventData);
        } else {
          console.warn('[PIXEL] Falha ao inicializar o Facebook Pixel para rastrear evento.');
        }
      }, 500);
      return;
    }
    
    console.log(`[PIXEL] Rastreando evento: ${eventName}`, eventData || '');
    window.fbq('track', eventName, eventData);
  } else {
    console.warn('[PIXEL] Ambiente sem janela detectado, não é possível rastrear evento.');
  }
}

/**
 * Rastreia um evento de compra aprovada
 * @param transactionId ID da transação
 * @param amount Valor da transação
 * @param currency Moeda (default: BRL)
 * @param itemName Nome do item
 */
export function trackPurchase(
  transactionId: string, 
  amount: number,
  currency: string = 'BRL',
  itemName: string = 'Kit de Segurança Shopee'
): boolean {
  console.log('[PIXEL] Rastreando compra aprovada:', { transactionId, amount });
  
  const eventData = {
    value: amount,
    currency: currency,
    content_name: itemName,
    content_type: 'product',
    content_ids: [transactionId],
    transaction_id: transactionId,
  };
  
  trackEvent('Purchase', eventData);
  
  // Também envia um evento personalizado para ter certeza
  trackEvent('CompleteRegistration', {
    content_name: 'Cadastro com pagamento aprovado',
    transaction_id: transactionId,
    status: 'approved'
  });
  
  // Enviar evento via beacon para garantir envio mesmo se página for fechada
  try {
    if (navigator.sendBeacon) {
      const pixelUrl = `https://www.facebook.com/tr?id=${FACEBOOK_PIXEL_ID}&ev=Purchase&noscript=1&cd[value]=${amount}&cd[currency]=${currency}&cd[transaction_id]=${transactionId}`;
      navigator.sendBeacon(pixelUrl);
      console.log('[PIXEL] Evento de compra enviado via beacon para garantir entrega.');
    }
  } catch (err) {
    console.error('[PIXEL] Erro ao enviar via beacon:', err);
  }
  
  return true;
}

/**
 * Verifica o status de um pagamento diretamente na API For4Payments
 * Esta função permite que o frontend verifique o status diretamente 
 * quando o backend não conseguir processar
 */
export async function checkPaymentStatus(paymentId: string, apiKey: string): Promise<any> {
  try {
    const response = await fetch(`https://app.for4payments.com.br/api/v1/transaction.getPayment?id=${paymentId}`, {
      method: 'GET',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Erro ao verificar status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('[PIXEL] Status do pagamento verificado:', data);
    
    // Se aprovado, rastrear imediatamente
    if (data && data.status === 'APPROVED') {
      console.log('[PIXEL] Pagamento APROVADO! Rastreando evento...');
      const amount = data.amount ? parseFloat(data.amount) : 119.70;
      trackPurchase(paymentId, amount);
      return { success: true, data };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('[PIXEL] Erro ao verificar status diretamente:', error);
    return { success: false, error };
  }
}

// Adicionar tipagem para o Facebook Pixel no window global
declare global {
  interface Window {
    fbq?: any;
    _fbq?: any;
  }
}