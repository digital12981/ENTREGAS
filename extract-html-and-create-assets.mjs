#!/usr/bin/env node

/**
 * Script para extrair HTML e criar assets correspondentes
 * 
 * Este script recebe o HTML atual do site e cria assets
 * compatíveis com as referências encontradas no código.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Configurar caminhos
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = process.cwd();
const publicDir = path.join(rootDir, 'public');
const assetsDir = path.join(publicDir, 'assets');

console.log('🔍 Extraindo HTML e criando assets correspondentes...');

// Garantir que os diretórios existam
if (!fs.existsSync(publicDir)) {
  console.log('Criando diretório public/...');
  fs.mkdirSync(publicDir, { recursive: true });
}

if (!fs.existsSync(assetsDir)) {
  console.log('Criando diretório assets/...');
  fs.mkdirSync(assetsDir, { recursive: true });
}

// HTML de referência
const referenceHtml = `<!DOCTYPE html>
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
    <!-- This is a replit script which adds a banner on the top of the page when opened in development mode outside the replit environment -->
    <script type="text/javascript" src="https://replit.com/public/js/replit-dev-banner.js"></script>
  </body>
</html>`;

// Salvar o HTML de referência
const indexHtmlPath = path.join(publicDir, 'index.html');
try {
  fs.writeFileSync(indexHtmlPath, referenceHtml);
  console.log('✅ index.html salvo com sucesso.');
} catch (err) {
  console.error('❌ Erro ao salvar index.html:', err.message);
}

// Extrair nomes de arquivos de assets do HTML
const jsMatch = referenceHtml.match(/src="\/assets\/(index-[^"]+\.js)"/);
const cssMatch = referenceHtml.match(/href="\/assets\/(index-[^"]+\.css)"/);

const jsFilename = jsMatch ? jsMatch[1] : 'index-B7US44-a.js';
const cssFilename = cssMatch ? cssMatch[1] : 'index-BRHWOuev.css';

console.log(`Detectado arquivo JS: ${jsFilename}`);
console.log(`Detectado arquivo CSS: ${cssFilename}`);

// Criar arquivo JS básico
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
            <img src="https://img.freepik.com/free-photo/young-delivery-man-red-uniform-cap-holding-pizza-box-looking-confident-standing-over-isolated-green-wall_141793-59334.jpg" alt="Entregador Shopee" width="450">
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
                <option value="AC">Acre</option>
                <option value="AL">Alagoas</option>
                <option value="AP">Amapá</option>
                <option value="AM">Amazonas</option>
                <option value="BA">Bahia</option>
                <option value="CE">Ceará</option>
                <option value="DF">Distrito Federal</option>
                <option value="ES">Espírito Santo</option>
                <option value="GO">Goiás</option>
                <option value="MA">Maranhão</option>
                <option value="MT">Mato Grosso</option>
                <option value="MS">Mato Grosso do Sul</option>
                <option value="MG">Minas Gerais</option>
                <option value="PA">Pará</option>
                <option value="PB">Paraíba</option>
                <option value="PR">Paraná</option>
                <option value="PE">Pernambuco</option>
                <option value="PI">Piauí</option>
                <option value="RJ">Rio de Janeiro</option>
                <option value="RN">Rio Grande do Norte</option>
                <option value="RS">Rio Grande do Sul</option>
                <option value="RO">Rondônia</option>
                <option value="RR">Roraima</option>
                <option value="SC">Santa Catarina</option>
                <option value="SP">São Paulo</option>
                <option value="SE">Sergipe</option>
                <option value="TO">Tocantins</option>
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
            <img src="https://shopee.com.br/public/shopee/safety-center/ShopeeEn/images/logo-shopee.svg" alt="Shopee" height="30">
            <span>Entregas</span>
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

// Criar arquivo CSS básico
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
  display: flex;
  align-items: center;
}

.footer-logo span {
  margin-left: 8px;
  font-weight: 700;
  font-family: 'Poppins', sans-serif;
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
  
  .footer-logo {
    justify-content: center;
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

// Salvar os arquivos de assets
const jsPath = path.join(assetsDir, jsFilename);
const cssPath = path.join(assetsDir, cssFilename);

try {
  fs.writeFileSync(jsPath, jsContent);
  console.log(`✅ ${jsFilename} salvo com sucesso.`);
} catch (err) {
  console.error(`❌ Erro ao salvar ${jsFilename}:`, err.message);
}

try {
  fs.writeFileSync(cssPath, cssContent);
  console.log(`✅ ${cssFilename} salvo com sucesso.`);
} catch (err) {
  console.error(`❌ Erro ao salvar ${cssFilename}:`, err.message);
}

// Verificar favicon.ico
const faviconPath = path.join(publicDir, 'favicon.ico');
if (!fs.existsSync(faviconPath)) {
  console.log('favicon.ico não encontrado. Criando...');
  
  // Importar create-favicon.mjs se existir
  const faviconScript = path.join(rootDir, 'create-favicon.mjs');
  if (fs.existsSync(faviconScript)) {
    try {
      // Use dynamic import in Node.js environment
      import('./create-favicon.mjs')
        .then(() => console.log('favicon.ico criado via script externo.'))
        .catch(err => {
          console.error('Erro ao importar script de favicon:', err);
          createBasicFavicon();
        });
    } catch (err) {
      console.error('Erro ao importar script de favicon:', err);
      createBasicFavicon();
    }
  } else {
    createBasicFavicon();
  }
}

// Função para criar um favicon básico
function createBasicFavicon() {
  console.log('Criando favicon básico diretamente...');
  
  // Dados binários básicos para um favicon simples (cor laranja da Shopee)
  const faviconData = Buffer.from([
    0, 0, 1, 0, 1, 0, 16, 16, 0, 0, 1, 0, 24, 0, 104, 4, 
    0, 0, 22, 0, 0, 0, 40, 0, 0, 0, 16, 0, 0, 0, 32, 0, 
    0, 0, 1, 0, 24, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 238, 77, 45, 238, 77, 
    45, 238, 77, 45, 238, 77, 45, 238, 77, 45, 238, 77, 45
  ]);
  
  try {
    fs.writeFileSync(faviconPath, faviconData);
    console.log('✅ favicon.ico básico criado com sucesso.');
  } catch (err) {
    console.error('❌ Erro ao criar favicon.ico:', err.message);
  }
}

// Verificar estrutura final
console.log('\n📂 Resumo da estrutura de arquivos:');
console.log(`- ${publicDir}/`);
console.log(`  - index.html`);
console.log(`  - favicon.ico`);
console.log(`  - assets/`);
console.log(`    - ${jsFilename}`);
console.log(`    - ${cssFilename}`);

console.log('\n✅ Criação de assets concluída com sucesso!');