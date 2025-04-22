"""
Módulo para rastreamento de tentativas de transação
"""
import os
from typing import Dict, Any
import time
from flask import request, current_app

# Armazena tentativas de transação por IP (em memória)
# Na produção, isso seria feito com Redis ou outro sistema de cache
transaction_attempts: Dict[str, Any] = {}

def get_client_ip() -> str:
    """Obtém o IP do cliente atual ou um placeholder se não for possível"""
    try:
        if request:
            # Tenta obter do encaminhamento de proxy (comum em ambientes de produção)
            forwarded_for = request.headers.get('X-Forwarded-For')
            if forwarded_for:
                return forwarded_for.split(',')[0].strip()
            # Fallback para o IP remoto direto
            return request.remote_addr or "127.0.0.1"
    except Exception as e:
        current_app.logger.warning(f"Erro ao obter IP do cliente: {str(e)}")
    
    # Fallback se não estiver em um contexto de requisição
    return "127.0.0.1"

def track_transaction_attempt(transaction_id: str, payment_data: Dict[str, Any]) -> tuple:
    """
    Registra uma tentativa de transação e verifica se é permitida
    
    Retorna:
    - tuple(bool, str): (permitido, mensagem)
      - Se permitido=True, a transação pode prosseguir
      - Se permitido=False, a mensagem explica o motivo do bloqueio
    """
    client_ip = get_client_ip()
    timestamp = time.time()
    
    # Em memória apenas para esta implementação
    if client_ip not in transaction_attempts:
        transaction_attempts[client_ip] = []
    
    # Adiciona a tentativa atual
    transaction_attempts[client_ip].append({
        'timestamp': timestamp,
        'transaction_id': transaction_id,
        'amount': payment_data.get('amount', 0),
    })
    
    # Log da tentativa
    current_app.logger.info(f"Tentativa de transação de {client_ip}: ID {transaction_id}")
    
    # Sempre permitir na implementação simplificada
    return True, "Transação permitida"

def is_transaction_ip_banned(client_ip: str) -> bool:
    """
    Verifica se um IP está banido por excesso de tentativas de transação
    
    Em produção, isso verificaria contra um banco de dados de IPs banidos
    ou regras de rate limiting mais sofisticadas
    """
    # Configuração simples: máximo de tentativas por janela de tempo
    MAX_ATTEMPTS = 10  # Máximo de tentativas
    TIME_WINDOW = 3600  # Janela de 1 hora (em segundos)
    
    # Se o IP não tem tentativas registradas, não está banido
    if client_ip not in transaction_attempts:
        return False
    
    # Filtra tentativas na janela de tempo
    now = time.time()
    recent_attempts = [
        attempt for attempt in transaction_attempts[client_ip]
        if now - attempt['timestamp'] < TIME_WINDOW
    ]
    
    # Atualiza a lista para manter apenas tentativas recentes
    transaction_attempts[client_ip] = recent_attempts
    
    # Verifica se excedeu o limite
    return len(recent_attempts) >= MAX_ATTEMPTS