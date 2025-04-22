#!/usr/bin/env python3
"""Wrapper API para processar pagamentos via For4Payments API"""
import os
import json
import traceback
from flask import Flask, request, jsonify
from flask_cors import CORS
from for4payments import create_payment_api

app = Flask(__name__)
CORS(app)  # Habilitar CORS para todas as rotas

@app.route('/api/for4payments', methods=['POST'])
def process_payment():
    try:
        # Log da requisição
        print(f"[INFO] Recebida requisição de pagamento: {request.remote_addr}")
        
        # Processar o JSON da requisição
        user_data = request.json
        
        if not user_data:
            print("[ERROR] Dados de usuário não fornecidos")
            return jsonify({"error": "Dados de usuário não fornecidos"}), 400
        
        # Log dos dados (ocultar informações sensíveis)
        print(f"[INFO] Nome: {user_data.get('nome', 'N/A')}")
        print(f"[INFO] CPF: {user_data.get('cpf', 'N/A')[:3]}...{user_data.get('cpf', 'N/A')[-2:] if len(user_data.get('cpf', 'N/A')) > 5 else 'N/A'}")
        
        # Verificar se a chave de API está configurada
        if not os.environ.get("FOR4PAYMENTS_SECRET_KEY"):
            print("[ERROR] FOR4PAYMENTS_SECRET_KEY não configurada")
            return jsonify({"error": "Chave de API For4Payments não configurada"}), 500
        
        # Criar a instância da API
        print("[INFO] Criando instância da API For4Payments")
        api = create_payment_api()
        
        # Processar o pagamento
        print("[INFO] Processando pagamento via API For4Payments")
        result = api.create_encceja_payment(user_data)
        
        # Log do resultado
        print(f"[INFO] Pagamento processado com sucesso: ID={result.get('id', 'N/A')}")
        
        # Retornar o resultado como JSON
        return jsonify(result)
        
    except Exception as e:
        error_message = str(e)
        print(f"[ERROR] Erro ao processar pagamento: {error_message}")
        print(traceback.format_exc())
        return jsonify({"error": f"Erro ao processar pagamento: {error_message}"}), 500

@app.route('/')
def index():
    return "For4Payments API está funcionando. Use POST /api/for4payments para processar pagamentos."

@app.route('/health')
def health():
    # Endpoint de verificação de saúde para monitoramento
    try:
        # Verificar se a chave de API está configurada
        api_key = os.environ.get("FOR4PAYMENTS_SECRET_KEY", "")
        
        status = {
            "status": "ok",
            "api_configured": bool(api_key),
            "timestamp": str(os.path.getmtime(__file__))
        }
        
        return jsonify(status)
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)