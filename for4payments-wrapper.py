#!/usr/bin/env python3
"""Wrapper API para processar pagamentos via For4Payments API"""
import os
import json
from flask import Flask, request, jsonify
from for4payments import create_payment_api

app = Flask(__name__)

@app.route('/api/for4payments', methods=['POST'])
def process_payment():
    try:
        # Processar o JSON da requisição
        user_data = request.json
        
        if not user_data:
            return jsonify({"error": "Dados de usuário não fornecidos"}), 400
        
        # Criar a instância da API
        api = create_payment_api()
        
        # Processar o pagamento
        result = api.create_encceja_payment(user_data)
        
        # Retornar o resultado como JSON
        return jsonify(result)
        
    except Exception as e:
        error_message = str(e)
        return jsonify({"error": f"Erro ao processar pagamento: {error_message}"}), 500

@app.route('/')
def index():
    return "For4Payments API está funcionando. Use POST /api/for4payments para processar pagamentos."

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)