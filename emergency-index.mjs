#!/usr/bin/env node

/**
 * Script de emergência para criar um index.html simples
 * que não depende de arquivos externos específicos
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Configurar caminhos
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = process.cwd();

console.log('🚨 Criando página HTML de emergência para a Heroku...');

// Conteúdo HTML simples sem recursos externos específicos
const emergencyHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Shopee Entregas</title>
    <style>
        /* Estilos incorporados - não dependem de arquivos externos */
        :root {
            --primary: #ee4d2d;
            --secondary: #f5f5f5;
            --text: #333;
            --white: #fff;
            --shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: var(--text);
            background-color: var(--white);
        }
        .container {
            width: 100%;
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
        }
        header {
            background-color: var(--white);
            box-shadow: var(--shadow);
            padding: 20px 0;
        }
        header .container {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: var(--primary);
        }
        nav ul {
            display: flex;
            list-style: none;
        }
        nav ul li {
            margin-left: 20px;
        }
        nav ul li a {
            color: var(--text);
            text-decoration: none;
        }
        nav ul li a:hover {
            color: var(--primary);
        }
        .hero {
            background-color: var(--secondary);
            padding: 60px 0;
        }
        .hero h1 {
            font-size: 2.5em;
            margin-bottom: 20px;
            color: var(--primary);
        }
        .hero p {
            font-size: 1.2em;
            margin-bottom: 30px;
        }
        .btn-primary {
            display: inline-block;
            background-color: var(--primary);
            color: var(--white);
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 4px;
            font-weight: bold;
        }
        .btn-primary:hover {
            opacity: 0.9;
        }
        .benefits {
            padding: 60px 0;
        }
        h2 {
            text-align: center;
            margin-bottom: 40px;
            color: var(--primary);
        }
        .benefits-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 30px;
        }
        .benefit-card {
            background: var(--white);
            padding: 30px;
            border-radius: 5px;
            box-shadow: var(--shadow);
            text-align: center;
        }
        .benefit-card h3 {
            margin: 20px 0;
            color: var(--primary);
        }
        .icon {
            font-size: 40px;
            color: var(--primary);
        }
        .registration {
            background-color: var(--secondary);
            padding: 60px 0;
        }
        form {
            max-width: 600px;
            margin: 0 auto;
            background: var(--white);
            padding: 30px;
            border-radius: 5px;
            box-shadow: var(--shadow);
        }
        .form-group {
            margin-bottom: 20px;
        }
        label {
            display: block;
            margin-bottom: 8px;
            font-weight: bold;
        }
        input, select {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        button {
            background-color: var(--primary);
            color: var(--white);
            border: none;
            padding: 12px 24px;
            border-radius: 4px;
            font-weight: bold;
            cursor: pointer;
            width: 100%;
        }
        footer {
            background-color: #333;
            color: var(--white);
            padding: 40px 0 20px;
            margin-top: 60px;
        }
        .footer-content {
            display: flex;
            justify-content: space-between;
            flex-wrap: wrap;
            margin-bottom: 20px;
        }
        .footer-section {
            flex: 1;
            min-width: 200px;
            margin-bottom: 20px;
        }
        .footer-section h3 {
            color: var(--primary);
            margin-bottom: 15px;
        }
        .footer-section ul {
            list-style: none;
        }
        .footer-section ul li {
            margin-bottom: 10px;
        }
        .footer-section ul li a {
            color: var(--white);
            text-decoration: none;
        }
        .footer-bottom {
            text-align: center;
            padding-top: 20px;
            border-top: 1px solid #444;
        }
        @media (max-width: 768px) {
            nav ul {
                flex-direction: column;
                text-align: center;
            }
            nav ul li {
                margin: 10px 0;
            }
            header .container {
                flex-direction: column;
            }
            .logo {
                margin-bottom: 20px;
            }
            .hero h1 {
                font-size: 2em;
            }
        }
    </style>
</head>
<body>
    <header>
        <div class="container">
            <div class="logo">Shopee Entregas</div>
            <nav>
                <ul>
                    <li><a href="#home">Início</a></li>
                    <li><a href="#benefits">Benefícios</a></li>
                    <li><a href="#registration">Cadastre-se</a></li>
                    <li><a href="#contact">Contato</a></li>
                </ul>
            </nav>
        </div>
    </header>

    <section class="hero" id="home">
        <div class="container">
            <h1>Seja um entregador parceiro da Shopee</h1>
            <p>Junte-se à nossa equipe de entregadores e tenha uma fonte de renda extra com flexibilidade de horários.</p>
            <a href="#registration" class="btn-primary">Quero ser entregador</a>
        </div>
    </section>

    <section class="benefits" id="benefits">
        <div class="container">
            <h2>Nossos Benefícios</h2>
            <div class="benefits-grid">
                <div class="benefit-card">
                    <div class="icon">⏱️</div>
                    <h3>Flexibilidade de Horários</h3>
                    <p>Você decide quando e quanto tempo quer trabalhar.</p>
                </div>
                <div class="benefit-card">
                    <div class="icon">💰</div>
                    <h3>Pagamentos Semanais</h3>
                    <p>Receba seus ganhos toda semana diretamente na sua conta.</p>
                </div>
                <div class="benefit-card">
                    <div class="icon">🛣️</div>
                    <h3>Trabalhe na sua Região</h3>
                    <p>Atenda pedidos em áreas próximas de você.</p>
                </div>
                <div class="benefit-card">
                    <div class="icon">🎯</div>
                    <h3>Suporte 24/7</h3>
                    <p>Conte com nossa equipe a qualquer momento.</p>
                </div>
            </div>
        </div>
    </section>

    <section class="registration" id="registration">
        <div class="container">
            <h2>Cadastre-se como Entregador</h2>
            <form id="registration-form">
                <div class="form-group">
                    <label for="name">Nome Completo</label>
                    <input type="text" id="name" required>
                </div>
                <div class="form-group">
                    <label for="email">E-mail</label>
                    <input type="email" id="email" required>
                </div>
                <div class="form-group">
                    <label for="phone">Telefone</label>
                    <input type="tel" id="phone" required>
                </div>
                <div class="form-group">
                    <label for="city">Cidade</label>
                    <input type="text" id="city" required>
                </div>
                <div class="form-group">
                    <label for="state">Estado</label>
                    <select id="state" required>
                        <option value="">Selecione</option>
                        <option value="SP">São Paulo</option>
                        <option value="RJ">Rio de Janeiro</option>
                        <option value="MG">Minas Gerais</option>
                        <option value="RS">Rio Grande do Sul</option>
                        <option value="PR">Paraná</option>
                        <option value="SC">Santa Catarina</option>
                        <option value="BA">Bahia</option>
                        <option value="DF">Distrito Federal</option>
                        <option value="GO">Goiás</option>
                        <option value="ES">Espírito Santo</option>
                        <option value="PE">Pernambuco</option>
                        <option value="CE">Ceará</option>
                        <option value="MT">Mato Grosso</option>
                        <option value="MS">Mato Grosso do Sul</option>
                        <option value="PA">Pará</option>
                        <option value="AM">Amazonas</option>
                    </select>
                </div>
                <button type="submit">Cadastrar como Entregador</button>
            </form>
        </div>
    </section>

    <footer id="contact">
        <div class="container">
            <div class="footer-content">
                <div class="footer-section">
                    <h3>Shopee Entregas</h3>
                    <p>Serviço de entrega oficial da Shopee Brasil.</p>
                </div>
                <div class="footer-section">
                    <h3>Links Úteis</h3>
                    <ul>
                        <li><a href="#">Sobre Nós</a></li>
                        <li><a href="#">Como Funciona</a></li>
                        <li><a href="#">Perguntas Frequentes</a></li>
                        <li><a href="#">Termos de Uso</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h3>Contato</h3>
                    <ul>
                        <li>contato@shopee-entregas.com.br</li>
                        <li>(11) 4000-1234</li>
                    </ul>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2025 Shopee Entregas. Todos os direitos reservados.</p>
            </div>
        </div>
    </footer>

    <script>
        // Script básico incorporado - não depende de arquivos externos
        document.addEventListener('DOMContentLoaded', function() {
            const form = document.getElementById('registration-form');
            if (form) {
                form.addEventListener('submit', function(e) {
                    e.preventDefault();
                    const name = document.getElementById('name').value;
                    alert('Obrigado pelo seu interesse, ' + name + '! Em breve entraremos em contato.');
                    form.reset();
                });
            }

            // Animação suave para links âncora
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function(e) {
                    e.preventDefault();
                    const targetId = this.getAttribute('href');
                    const targetElement = document.querySelector(targetId);
                    
                    if (targetElement) {
                        window.scrollTo({
                            top: targetElement.offsetTop,
                            behavior: 'smooth'
                        });
                    }
                });
            });
        });
    </script>
</body>
</html>`;

// Lista de diretórios onde salvar a página
const directories = [
  path.join(rootDir, 'public'),
  path.join(rootDir, 'dist', 'public'),
  path.join(rootDir, 'dist', 'client'),
  path.join(rootDir, 'dist', 'server', 'public')
];

// Garantir que os diretórios existam
directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    console.log(`Criando diretório ${dir}...`);
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Salvar o HTML em todos os diretórios
let savedCount = 0;
directories.forEach(dir => {
  const filePath = path.join(dir, 'index.html');
  try {
    fs.writeFileSync(filePath, emergencyHtml);
    console.log(`✅ HTML de emergência salvo em ${filePath}`);
    savedCount++;
  } catch (err) {
    console.error(`❌ Erro ao salvar HTML em ${filePath}: ${err.message}`);
  }
});

console.log(`\n📋 HTML de emergência salvo em ${savedCount} de ${directories.length} diretórios.`);
console.log('🚨 Processo de emergência concluído.');

// Checar se estamos em ambiente Heroku e restartar processos
if (process.env.PORT) {
  console.log('Detectado ambiente Heroku. Reiniciando processos...');
  try {
    const restartCommand = 'heroku restart';
    const result = require('child_process').execSync(restartCommand, { 
      encoding: 'utf8', 
      stdio: 'inherit' 
    });
    console.log('Comando de reinicialização enviado.');
  } catch (err) {
    console.log('Não foi possível reiniciar automaticamente os processos.');
    console.log('Por favor, reinicie manualmente os processos após este script terminar.');
  }
}