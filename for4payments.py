"""
API client para For4Payments
"""
import os
import requests
import time
import random
import string
from typing import Dict, Any, Optional

class For4PaymentsAPI:
    API_URL = "https://app.for4payments.com.br/api/v1"

    def __init__(self, secret_key: str):
        self.secret_key = secret_key
        self.extra_headers = {}  # Headers adicionais para evitar problemas de 403 Forbidden

    def _get_headers(self) -> Dict[str, str]:
        headers = {
            'Authorization': self.secret_key,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
        return headers

    def _generate_random_email(self, name: str) -> str:
        clean_name = ''.join(e.lower() for e in name if e.isalnum())
        random_num = ''.join(random.choices(string.digits, k=4))
        domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com']
        domain = random.choice(domains)
        return f"{clean_name}{random_num}@{domain}"

    def _generate_random_phone(self) -> str:
        """
        Gera um número de telefone brasileiro aleatório no formato DDDNNNNNNNNN
        sem o prefixo +55. Usado apenas como fallback quando um telefone válido não está disponível.
        """
        ddd = str(random.randint(11, 99))
        number = ''.join(random.choices(string.digits, k=9))
        return f"{ddd}{number}"

    def create_pix_payment(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a PIX payment request"""
        print(f"Utilizando token de autenticação: {self.secret_key[:3]}...{self.secret_key[-3:]} ({len(self.secret_key)} caracteres)")
        
        # Log dos dados recebidos para processamento
        safe_data = {k: v for k, v in data.items()}
        if 'cpf' in safe_data:
            safe_data['cpf'] = f"{safe_data['cpf'][:3]}...{safe_data['cpf'][-2:]}" if len(safe_data['cpf']) > 5 else "***"
        print(f"Dados recebidos para pagamento: {safe_data}")
        
        # Em vez de chamar a API real, retornaremos dados de teste
        print("Simulando transação PIX - modo de desenvolvimento")
        
        # Gerar um código PIX de exemplo
        pix_code = "00020126580014BR.GOV.BCB.PIX0136f5f04a2d-ecec-4072-955c-9e1d44c5060a0224Pagamento Kit Seguranca5204000053039865406107.805802BR5909ShopeeKit6009Sao Paulo62100506codigo6304E57B"
        
        # QR Code PIX (base64 de uma imagem de QR code)
        pix_qr_code = "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=" + pix_code
        
        # Simular resposta de API
        payment_id = f"test_{int(time.time())}"
        print(f"Transação simulada criada, ID: {payment_id}")
        
        # Retornar dados simulados da transação
        return {
            'id': payment_id,
            'pixCode': pix_code,
            'pixQrCode': pix_qr_code,
            'status': 'pending'
        }

    def create_encceja_payment(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Criar um pagamento PIX para a taxa do Kit de Segurança"""
        print(f"Solicitação de pagamento kit recebida: {user_data}")

        # Validação dos dados obrigatórios
        if not user_data:
            print("Dados de usuário vazios")
            raise ValueError("Nenhum dado de usuário fornecido")

        if not user_data.get('nome'):
            print("Nome do usuário não fornecido")
            raise ValueError("Nome do usuário é obrigatório")

        if not user_data.get('cpf'):
            print("CPF do usuário não fornecido")
            raise ValueError("CPF do usuário é obrigatório")

        # Valor fixo do Kit de Segurança Shopee
        amount = 84.70
        print(f"Valor do Kit de Segurança: R$ {amount:.2f}")

        # Sanitização e preparação dos dados
        try:
            # Formatar o CPF para remover caracteres não numéricos
            cpf_original = user_data.get('cpf', '')
            cpf = ''.join(filter(str.isdigit, str(cpf_original)))
            if len(cpf) != 11:
                print(f"CPF com formato inválido: {cpf_original} → {cpf} ({len(cpf)} dígitos)")
            else:
                print(f"CPF formatado: {cpf[:3]}...{cpf[-2:]}")

            # Gerar um email aleatório baseado no nome do usuário
            nome = user_data.get('nome', '').strip()
            email = self._generate_random_email(nome)
            print(f"Email gerado: {email}")

            # Limpar o telefone se fornecido, ou gerar um aleatório
            phone_original = user_data.get('telefone', '')
            phone_digits = ''.join(filter(str.isdigit, str(phone_original)))

            if not phone_digits or len(phone_digits) < 10:
                phone = self._generate_random_phone()
                print(f"Telefone inválido '{phone_original}', gerado novo: {phone}")
            else:
                phone = phone_digits
                print(f"Telefone formatado: {phone}")

            print(f"Preparando pagamento para: {nome} (CPF: {cpf[:3]}...{cpf[-2:]})")

            # Formatar os dados para o pagamento
            payment_data = {
                'name': nome,
                'email': email,
                'cpf': cpf,
                'amount': amount,
                'phone': phone,
                'description': 'Kit de Segurança'
            }

            print("Chamando API de pagamento PIX")
            # Chamar a função create_pix_payment com os dados formatados
            result = self.create_pix_payment(payment_data)
            # Log do ID da transação
            print(f"Pagamento criado com sucesso, ID: {result.get('id')}")
            # Retornar resultado com os dados do PIX
            return result

        except Exception as e:
            print(f"Erro ao processar pagamento kit: {str(e)}")
            raise ValueError(f"Erro ao processar pagamento: {str(e)}")


def create_payment_api(secret_key: Optional[str] = None) -> For4PaymentsAPI:
    """Factory function to create For4PaymentsAPI instance"""
    if secret_key is None:
        secret_key = os.environ.get("FOR4PAYMENTS_SECRET_KEY")
        if not secret_key:
            # Para desenvolvimento, usar uma chave fake
            secret_key = "test_api_key_00000000000000000000000000000000"
            print("Usando chave API de teste para desenvolvimento")
            
    return For4PaymentsAPI(secret_key)