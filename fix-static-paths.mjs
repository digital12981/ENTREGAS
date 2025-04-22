#!/usr/bin/env node

/**
 * Script para corrigir caminhos específicos de assets na Heroku
 * 
 * Este script copia os arquivos de assets para todos os diretórios
 * possíveis que o servidor possa verificar.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

// Configurar caminhos
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = process.cwd();
const publicDir = path.join(rootDir, 'public');
const distDir = path.join(rootDir, 'dist');
const distPublicDir = path.join(distDir, 'public');
const serverPublicDir = path.join(distDir, 'server', 'public');

console.log('🔧 Corrigindo caminhos de arquivos estáticos na Heroku...');
console.log(`Data/Hora: ${new Date().toISOString()}`);
console.log(`Diretório atual: ${rootDir}`);

// Função para executar comandos
function execCmd(command) {
  console.log(`Executando: ${command}`);
  const result = spawnSync(command, { shell: true, stdio: 'inherit' });
  return result.status === 0;
}

// Função para copiar um diretório recursivamente
function copyDir(src, dest) {
  console.log(`Copiando de ${src} para ${dest}`);
  
  // Criar diretório de destino se não existir
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  // Ler conteúdo do diretório fonte
  let entries;
  try {
    entries = fs.readdirSync(src, { withFileTypes: true });
  } catch (err) {
    console.error(`Erro ao ler diretório ${src}: ${err.message}`);
    return false;
  }
  
  let success = true;
  
  // Copiar cada item
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    try {
      if (entry.isDirectory()) {
        if (!copyDir(srcPath, destPath)) {
          success = false;
        }
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    } catch (err) {
      console.error(`Erro ao copiar ${srcPath}: ${err.message}`);
      success = false;
    }
  }
  
  return success;
}

// Verificar e criar diretórios necessários
const dirsToCreate = [
  publicDir,
  distPublicDir,
  serverPublicDir,
  path.join(publicDir, 'assets'),
  path.join(distPublicDir, 'assets'),
  path.join(serverPublicDir, 'assets')
];

dirsToCreate.forEach(dir => {
  if (!fs.existsSync(dir)) {
    console.log(`Criando diretório: ${dir}`);
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Verificar se o HTML precisa ser atualizado
const sourceHtml = `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1" />
    <title>Shopee Delivery Partners</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&family=Poppins:wght@400;700&display=swap" rel="stylesheet">
    <script type="module" crossorigin src="/assets/index-B7US44-a.js"></script>
    <link rel="stylesheet" crossorigin href="/assets/index-BRHWOuev.css">
  </head>
  <body>
    <div id="root"></div>
    <script src="/assets/main.js"></script>
  </body>
</html>`;

// Extrair nomes dos arquivos no HTML
const jsMatch = sourceHtml.match(/src="\/assets\/(index-[^"]+\.js)"/);
const cssMatch = sourceHtml.match(/href="\/assets\/(index-[^"]+\.css)"/);

const jsFilename = jsMatch ? jsMatch[1] : 'index-B7US44-a.js';
const cssFilename = cssMatch ? cssMatch[1] : 'index-BRHWOuev.css';

// Armazenar caminhos dos arquivos de assets
const jsSourcePath = path.join(publicDir, 'assets', jsFilename);
const cssSourcePath = path.join(publicDir, 'assets', cssFilename);
const mainJsPath = path.join(publicDir, 'assets', 'main.js');

// Verificar se temos os arquivos necessários, caso não, criar
if (!fs.existsSync(jsSourcePath)) {
  console.log(`Criando arquivo JavaScript ${jsFilename}...`);
  
  const jsContent = `// Shopee Entregas - JavaScript básico
console.log('Shopee Entregas - Arquivo JS carregado');

// Configurar componentes básicos da interface
document.addEventListener('DOMContentLoaded', function() {
  const root = document.getElementById('root');
  if (!root) return;
  
  // Criar estrutura básica
  const appStructure = \`
    <header class="header">
      <div class="container">
        <div class="logo">
          <img src="https://shopee.com.br/public/shopee/safety-center/ShopeeEn/images/logo-shopee.svg" alt="Shopee" height="40">
          <span>Entregas</span>
        </div>
        <nav>
          <ul>
            <li><a href="#inicio">Início</a></li>
            <li><a href="#como-funciona">Como Funciona</a></li>
            <li><a href="#beneficios">Benefícios</a></li>
            <li><a href="#cadastro">Cadastre-se</a></li>
          </ul>
        </nav>
      </div>
    </header>
    
    <main>
      <section class="hero" id="inicio">
        <div class="container">
          <div class="hero-content">
            <h1>Seja um entregador parceiro da Shopee</h1>
            <p>Tenha flexibilidade para trabalhar quando quiser e aumente sua renda.</p>
            <a href="#cadastro" class="btn-primary">Quero ser parceiro</a>
          </div>
          <div class="hero-image">
            <div class="placeholder-image">Imagem de Entregador</div>
          </div>
        </div>
      </section>
      
      <section class="como-funciona" id="como-funciona">
        <div class="container">
          <h2>Como funciona</h2>
          <div class="steps">
            <div class="step">
              <i class="fas fa-user-plus"></i>
              <h3>Cadastre-se</h3>
              <p>Faça seu cadastro em nossa plataforma</p>
            </div>
            <div class="step">
              <i class="fas fa-motorcycle"></i>
              <h3>Escolha seu veículo</h3>
              <p>Moto, bicicleta ou carro, você decide</p>
            </div>
            <div class="step">
              <i class="fas fa-clock"></i>
              <h3>Defina seus horários</h3>
              <p>Trabalhe quando puder, com total flexibilidade</p>
            </div>
            <div class="step">
              <i class="fas fa-hand-holding-usd"></i>
              <h3>Receba seus pagamentos</h3>
              <p>Pagamentos semanais diretamente na sua conta</p>
            </div>
          </div>
        </div>
      </section>
      
      <section class="beneficios" id="beneficios">
        <div class="container">
          <h2>Benefícios</h2>
          <div class="benefits-grid">
            <div class="benefit-card">
              <i class="fas fa-calendar-alt"></i>
              <h3>Flexibilidade de horários</h3>
              <p>Você decide quando e quanto tempo quer trabalhar</p>
            </div>
            <div class="benefit-card">
              <i class="fas fa-wallet"></i>
              <h3>Pagamentos semanais</h3>
              <p>Receba seus ganhos toda semana</p>
            </div>
            <div class="benefit-card">
              <i class="fas fa-map-marked-alt"></i>
              <h3>Escolha sua região</h3>
              <p>Trabalhe em áreas próximas de você</p>
            </div>
            <div class="benefit-card">
              <i class="fas fa-headset"></i>
              <h3>Suporte 24h</h3>
              <p>Conte com nossa equipe a qualquer momento</p>
            </div>
          </div>
        </div>
      </section>
      
      <section class="cadastro" id="cadastro">
        <div class="container">
          <h2>Cadastre-se como entregador</h2>
          <form id="cadastro-form">
            <div class="form-group">
              <label for="nome">Nome completo</label>
              <input type="text" id="nome" placeholder="Seu nome completo" required>
            </div>
            <div class="form-group">
              <label for="email">E-mail</label>
              <input type="email" id="email" placeholder="seu@email.com" required>
            </div>
            <div class="form-group">
              <label for="telefone">Telefone</label>
              <input type="tel" id="telefone" placeholder="(00) 00000-0000" required>
            </div>
            <div class="form-group">
              <label for="cep">CEP</label>
              <input type="text" id="cep" placeholder="00000-000" required>
            </div>
            <div class="form-group">
              <label for="cidade">Cidade</label>
              <input type="text" id="cidade" placeholder="Sua cidade" required>
            </div>
            <div class="form-group">
              <label for="estado">Estado</label>
              <select id="estado" required>
                <option value="">Selecione seu estado</option>
                <option value="SP">São Paulo</option>
                <option value="RJ">Rio de Janeiro</option>
                <option value="MG">Minas Gerais</option>
                <!-- Outros estados -->
              </select>
            </div>
            <div class="form-group">
              <label>Tipo de veículo</label>
              <div class="radio-group">
                <label>
                  <input type="radio" name="veiculo" value="moto" required> Moto
                </label>
                <label>
                  <input type="radio" name="veiculo" value="carro"> Carro
                </label>
                <label>
                  <input type="radio" name="veiculo" value="bicicleta"> Bicicleta
                </label>
              </div>
            </div>
            <button type="submit" class="btn-primary">Cadastrar como entregador</button>
          </form>
        </div>
      </section>
    </main>
    
    <footer>
      <div class="container">
        <div class="footer-content">
          <div class="footer-logo">
            <span>Shopee Entregas</span>
          </div>
          <div class="footer-links">
            <h4>Links Úteis</h4>
            <ul>
              <li><a href="#">Termos de Uso</a></li>
              <li><a href="#">Política de Privacidade</a></li>
              <li><a href="#">Ajuda</a></li>
              <li><a href="#">Contato</a></li>
            </ul>
          </div>
          <div class="footer-contact">
            <h4>Contato</h4>
            <p><i class="fas fa-envelope"></i> entregas@shopee.com.br</p>
            <p><i class="fas fa-phone"></i> (11) 4000-1234</p>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; 2025 Shopee Entregas. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  \`;
  
  // Adicionar à página
  root.innerHTML = appStructure;
  
  // Adicionar comportamento ao formulário
  const form = document.getElementById('cadastro-form');
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      const nome = document.getElementById('nome').value;
      alert('Obrigado pelo interesse, ' + nome + '! Entraremos em contato em breve.');
    });
  }
});`;
  
  fs.writeFileSync(jsSourcePath, jsContent);
  console.log(`✓ ${jsFilename} criado com sucesso.`);
}

if (!fs.existsSync(cssSourcePath)) {
  console.log(`Criando arquivo CSS ${cssFilename}...`);
  
  const cssContent = `/* Shopee Entregas - CSS básico */
:root {
  --primary: #ee4d2d;
  --primary-dark: #d5331a;
  --secondary: #f5f5f5;
  --text: #333;
  --text-light: #666;
  --white: #fff;
  --border: #e0e0e0;
  --shadow: 0 2px 8px rgba(0,0,0,0.1);
  --radius: 4px;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  line-height: 1.6;
  color: var(--text);
  background-color: var(--white);
}

a {
  color: var(--primary);
  text-decoration: none;
  transition: all 0.3s ease;
}

a:hover {
  color: var(--primary-dark);
}

img {
  max-width: 100%;
  height: auto;
}

.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Header */
.header {
  background-color: var(--white);
  box-shadow: var(--shadow);
  padding: 20px 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  font-family: 'Poppins', sans-serif;
  font-weight: 700;
  font-size: 1.5rem;
}

.logo span {
  color: var(--primary);
  margin-left: 8px;
}

nav ul {
  display: flex;
  list-style: none;
}

nav ul li {
  margin-left: 30px;
}

nav ul li a {
  color: var(--text);
  font-weight: 500;
}

nav ul li a:hover {
  color: var(--primary);
}

/* Hero Section */
.hero {
  padding: 80px 0;
  background-color: var(--secondary);
}

.hero .container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.hero-content {
  flex: 1;
  padding-right: 40px;
}

.hero-image {
  flex: 1;
  text-align: center;
}

.placeholder-image {
  background-color: #ddd;
  width: 100%;
  max-width: 400px;
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  border-radius: var(--radius);
  color: var(--text-light);
  font-weight: 500;
}

.hero h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 20px;
  color: var(--primary);
  font-family: 'Poppins', sans-serif;
}

.hero p {
  font-size: 1.2rem;
  margin-bottom: 30px;
  color: var(--text-light);
}

.btn-primary {
  display: inline-block;
  background-color: var(--primary);
  color: var(--white);
  padding: 12px 30px;
  border-radius: var(--radius);
  font-weight: 500;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
  font-size: 1rem;
}

.btn-primary:hover {
  background-color: var(--primary-dark);
  color: var(--white);
}

/* Section Styling */
section {
  padding: 80px 0;
}

section:nth-child(even) {
  background-color: var(--secondary);
}

section h2 {
  text-align: center;
  font-size: 2rem;
  margin-bottom: 50px;
  color: var(--primary);
  font-family: 'Poppins', sans-serif;
}

/* Como Funciona */
.steps {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 20px;
}

.step {
  flex: 1;
  min-width: 200px;
  text-align: center;
  padding: 30px 20px;
  background-color: var(--white);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}

.step i {
  color: var(--primary);
  font-size: 2.5rem;
  margin-bottom: 20px;
}

.step h3 {
  margin-bottom: 15px;
  font-family: 'Poppins', sans-serif;
}

/* Benefícios */
.benefits-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
}

.benefit-card {
  background-color: var(--white);
  border-radius: var(--radius);
  padding: 30px;
  box-shadow: var(--shadow);
  text-align: center;
}

.benefit-card i {
  color: var(--primary);
  font-size: 2.5rem;
  margin-bottom: 20px;
}

.benefit-card h3 {
  margin-bottom: 15px;
  font-family: 'Poppins', sans-serif;
}

/* Cadastro */
.cadastro {
  background-color: var(--secondary);
}

form {
  max-width: 700px;
  margin: 0 auto;
  background-color: var(--white);
  padding: 40px;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

input[type="text"],
input[type="email"],
input[type="tel"],
select {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  font-size: 1rem;
  font-family: inherit;
}

input:focus,
select:focus {
  outline: none;
  border-color: var(--primary);
}

.radio-group {
  display: flex;
  gap: 20px;
}

.radio-group label {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.radio-group input {
  margin-right: 8px;
}

form .btn-primary {
  width: 100%;
  margin-top: 20px;
}

/* Footer */
footer {
  background-color: #222;
  color: var(--white);
  padding: 60px 0 20px;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 40px;
  margin-bottom: 40px;
}

.footer-logo {
  font-size: 1.5rem;
  font-weight: 700;
  font-family: 'Poppins', sans-serif;
  color: var(--primary);
}

.footer-links h4,
.footer-contact h4 {
  color: var(--primary);
  margin-bottom: 20px;
  font-family: 'Poppins', sans-serif;
}

.footer-links ul {
  list-style: none;
}

.footer-links ul li {
  margin-bottom: 10px;
}

.footer-links a {
  color: var(--white);
}

.footer-links a:hover {
  color: var(--primary);
}

.footer-contact p {
  margin-bottom: 10px;
}

.footer-contact i {
  margin-right: 10px;
  color: var(--primary);
}

.footer-bottom {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #444;
}

/* Responsive */
@media (max-width: 768px) {
  .hero .container {
    flex-direction: column;
  }
  
  .hero-content {
    padding-right: 0;
    text-align: center;
    margin-bottom: 40px;
  }
  
  .steps {
    flex-direction: column;
  }
  
  .footer-content {
    flex-direction: column;
    text-align: center;
  }
  
  nav ul {
    flex-direction: column;
    text-align: center;
  }
  
  nav ul li {
    margin: 10px 0;
  }
  
  .header .container {
    flex-direction: column;
  }
  
  .logo {
    margin-bottom: 20px;
  }
  
  .radio-group {
    flex-direction: column;
    gap: 10px;
  }
}`;
  
  fs.writeFileSync(cssSourcePath, cssContent);
  console.log(`✓ ${cssFilename} criado com sucesso.`);
}

// Também criar um arquivo main.js para inicialização do app
if (!fs.existsSync(mainJsPath)) {
  console.log('Criando arquivo assets/main.js...');
  
  const mainJsContent = `// Arquivo principal de inicialização
console.log('Shopee Entregas - Aplicação inicializada');

document.addEventListener('DOMContentLoaded', function() {
  // Inicializar a aplicação
  console.log('DOM carregado, inicializando aplicação...');
  
  // Verificar se o conteúdo do root existe
  const root = document.getElementById('root');
  if (root && root.innerHTML.trim() === '') {
    console.log('Elemento root vazio, criando conteúdo básico...');
    
    // Criar um HTML básico com visual simples
    root.innerHTML = \`
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <header style="text-align: center; margin-bottom: 40px;">
          <h1 style="color: #ee4d2d; font-size: 32px;">Shopee Entregas</h1>
          <p style="font-size: 18px;">Seja um entregador parceiro e aumente sua renda</p>
        </header>
        
        <main>
          <section style="background-color: #f8f8f8; padding: 30px; border-radius: 8px; margin-bottom: 30px;">
            <h2 style="color: #ee4d2d; margin-bottom: 20px;">Benefícios de ser um entregador Shopee</h2>
            <ul style="list-style-type: none; padding: 0;">
              <li style="margin-bottom: 15px; padding-left: 25px; position: relative;">
                <span style="color: #ee4d2d; position: absolute; left: 0;">✓</span>
                <strong>Flexibilidade de horários</strong> - Trabalhe quando quiser
              </li>
              <li style="margin-bottom: 15px; padding-left: 25px; position: relative;">
                <span style="color: #ee4d2d; position: absolute; left: 0;">✓</span>
                <strong>Pagamentos semanais</strong> - Receba toda semana
              </li>
              <li style="margin-bottom: 15px; padding-left: 25px; position: relative;">
                <span style="color: #ee4d2d; position: absolute; left: 0;">✓</span>
                <strong>Suporte 24/7</strong> - Conte com nossa ajuda a qualquer momento
              </li>
              <li style="margin-bottom: 15px; padding-left: 25px; position: relative;">
                <span style="color: #ee4d2d; position: absolute; left: 0;">✓</span>
                <strong>Escolha sua região</strong> - Trabalhe perto de casa
              </li>
            </ul>
          </section>
          
          <section style="text-align: center;">
            <h2 style="color: #ee4d2d; margin-bottom: 20px;">Cadastre-se agora</h2>
            <p style="margin-bottom: 30px;">Preencha o formulário abaixo para começar sua jornada como entregador parceiro</p>
            
            <form id="simple-form" style="text-align: left; max-width: 500px; margin: 0 auto;">
              <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; font-weight: bold;">Nome completo</label>
                <input type="text" id="simple-nome" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;" required>
              </div>
              
              <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; font-weight: bold;">Email</label>
                <input type="email" id="simple-email" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;" required>
              </div>
              
              <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; font-weight: bold;">Telefone</label>
                <input type="tel" id="simple-telefone" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;" required>
              </div>
              
              <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; font-weight: bold;">Cidade</label>
                <input type="text" id="simple-cidade" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;" required>
              </div>
              
              <button type="submit" style="background-color: #ee4d2d; color: white; border: none; padding: 12px 20px; border-radius: 4px; cursor: pointer; width: 100%; font-weight: bold;">
                Quero ser entregador
              </button>
            </form>
          </section>
        </main>
        
        <footer style="margin-top: 50px; text-align: center; color: #666; padding-top: 20px; border-top: 1px solid #eee;">
          <p>&copy; 2025 Shopee Entregas. Todos os direitos reservados.</p>
        </footer>
      </div>
    \`;
    
    // Adicionar comportamento ao formulário
    const form = document.getElementById('simple-form');
    if (form) {
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        const nome = document.getElementById('simple-nome').value;
        alert('Obrigado pelo interesse, ' + nome + '! Entraremos em contato em breve.');
      });
    }
  }
});`;
  
  fs.writeFileSync(mainJsPath, mainJsContent);
  console.log('✓ assets/main.js criado com sucesso.');
}

// Atualizar o HTML em todos os diretórios
const updatedHtml = `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1" />
    <title>Shopee Delivery Partners</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&family=Poppins:wght@400;700&display=swap" rel="stylesheet">
    <script type="module" crossorigin src="/assets/${jsFilename}"></script>
    <link rel="stylesheet" crossorigin href="/assets/${cssFilename}">
  </head>
  <body>
    <div id="root"></div>
    <script src="/assets/main.js"></script>
  </body>
</html>`;

// Salvar o HTML em todos os diretórios
const htmlPaths = [
  path.join(publicDir, 'index.html'),
  path.join(distPublicDir, 'index.html'),
  path.join(serverPublicDir, 'index.html')
];

htmlPaths.forEach(htmlPath => {
  try {
    fs.writeFileSync(htmlPath, updatedHtml);
    console.log(`✓ HTML atualizado em ${htmlPath}`);
  } catch (err) {
    console.error(`Erro ao salvar HTML em ${htmlPath}: ${err.message}`);
  }
});

// Copiar assets para todos os diretórios possíveis
const assetsSrc = path.join(publicDir, 'assets');
const assetsDest = [
  path.join(distPublicDir, 'assets'),
  path.join(serverPublicDir, 'assets')
];

// Garantir que o diretório de assets na origem existe
if (!fs.existsSync(assetsSrc)) {
  fs.mkdirSync(assetsSrc, { recursive: true });
}

// Copiar para todos os destinos
assetsDest.forEach(dest => {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  copyDir(assetsSrc, dest);
});

// Verificar favicon em todos os diretórios
const faviconPaths = [
  path.join(publicDir, 'favicon.ico'),
  path.join(distPublicDir, 'favicon.ico'),
  path.join(serverPublicDir, 'favicon.ico')
];

// Garantir que temos um favicon na origem
const faviconSrc = path.join(publicDir, 'favicon.ico');
if (!fs.existsSync(faviconSrc)) {
  console.log('Favicon não encontrado. Criando básico...');
  
  // Dados binários básicos para um favicon simples (cor laranja da Shopee)
  const faviconData = Buffer.from([
    0, 0, 1, 0, 1, 0, 16, 16, 0, 0, 1, 0, 24, 0, 104, 4, 
    0, 0, 22, 0, 0, 0, 40, 0, 0, 0, 16, 0, 0, 0, 32, 0, 
    0, 0, 1, 0, 24, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 238, 77, 45, 238, 77, 
    45, 238, 77, 45, 238, 77, 45, 238, 77, 45, 238, 77, 45
  ]);
  
  fs.writeFileSync(faviconSrc, faviconData);
  console.log('✓ favicon.ico criado com sucesso.');
}

// Copiar favicon para todos os caminhos
faviconPaths.forEach(faviconPath => {
  if (faviconPath !== faviconSrc && fs.existsSync(faviconSrc)) {
    try {
      fs.copyFileSync(faviconSrc, faviconPath);
      console.log(`✓ Favicon copiado para ${faviconPath}`);
    } catch (err) {
      console.error(`Erro ao copiar favicon para ${faviconPath}: ${err.message}`);
    }
  }
});

// Mostrar resumo de status
console.log('\n📂 RESUMO DOS DIRETÓRIOS:');

const checkDirectory = (dirPath) => {
  if (fs.existsSync(dirPath)) {
    try {
      const files = fs.readdirSync(dirPath);
      console.log(`✓ ${dirPath} existe com ${files.length} arquivos`);
      
      // Verificar arquivo HTML
      if (fs.existsSync(path.join(dirPath, 'index.html'))) {
        console.log(`  ✓ index.html encontrado`);
      } else {
        console.log(`  ✗ index.html NÃO encontrado`);
      }
      
      // Verificar favicon
      if (fs.existsSync(path.join(dirPath, 'favicon.ico'))) {
        console.log(`  ✓ favicon.ico encontrado`);
      } else {
        console.log(`  ✗ favicon.ico NÃO encontrado`);
      }
      
      // Verificar pasta assets
      const assetsDir = path.join(dirPath, 'assets');
      if (fs.existsSync(assetsDir)) {
        const assetFiles = fs.readdirSync(assetsDir);
        console.log(`  ✓ Diretório assets/ encontrado com ${assetFiles.length} arquivos`);
        
        // Verificar arquivos JS e CSS
        const jsFiles = assetFiles.filter(file => file.endsWith('.js'));
        const cssFiles = assetFiles.filter(file => file.endsWith('.css'));
        
        if (jsFiles.length > 0) {
          console.log(`  ✓ Arquivos JS: ${jsFiles.join(', ')}`);
        } else {
          console.log(`  ✗ Nenhum arquivo JS encontrado`);
        }
        
        if (cssFiles.length > 0) {
          console.log(`  ✓ Arquivos CSS: ${cssFiles.join(', ')}`);
        } else {
          console.log(`  ✗ Nenhum arquivo CSS encontrado`);
        }
      } else {
        console.log(`  ✗ Diretório assets/ NÃO encontrado`);
      }
    } catch (err) {
      console.error(`✗ Erro ao verificar ${dirPath}: ${err.message}`);
    }
  } else {
    console.error(`✗ ${dirPath} não existe`);
  }
  console.log('');
};

console.log('\n1. Diretório public/');
checkDirectory(publicDir);

console.log('2. Diretório dist/public/');
checkDirectory(distPublicDir);

console.log('3. Diretório dist/server/public/');
checkDirectory(serverPublicDir);

console.log('✅ Processo de correção de caminhos concluído!');
console.log('Faça deploy do aplicativo novamente para que as mudanças tenham efeito.');