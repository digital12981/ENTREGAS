#!/usr/bin/env node

/**
 * Script para criar arquivos básicos de assets quando o build falha
 * 
 * Este script cria arquivos CSS e JavaScript básicos para garantir
 * que a aplicação funcione minimamente mesmo quando o build falha.
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

console.log('🔧 Criando assets básicos para o frontend...');

// Garantir que o diretório public exista
if (!fs.existsSync(publicDir)) {
  console.log('Criando diretório public/ que não existe...');
  fs.mkdirSync(publicDir, { recursive: true });
}

// Criar diretório de assets
if (!fs.existsSync(assetsDir)) {
  console.log('Criando diretório assets/...');
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Criar arquivo CSS básico
const cssContent = `
/* CSS básico para Shopee Entregas */
:root {
  --primary: #ee4d2d;
  --background: #ffffff;
  --text: #333333;
  --border: #e0e0e0;
  --radius: 8px;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  background-color: var(--background);
  color: var(--text);
  line-height: 1.5;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
}

.header {
  background-color: var(--primary);
  color: white;
  padding: 16px 0;
}

.header .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 24px;
  font-weight: bold;
}

.btn {
  display: inline-block;
  background-color: var(--primary);
  color: white;
  padding: 8px 16px;
  border-radius: var(--radius);
  text-decoration: none;
  font-weight: 500;
  border: none;
  cursor: pointer;
}

.btn:hover {
  opacity: 0.9;
}

.section {
  padding: 48px 0;
}

.section-title {
  font-size: 32px;
  margin-bottom: 24px;
  color: var(--primary);
}

.card {
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 24px;
  margin-bottom: 16px;
}

.footer {
  background-color: #f5f5f5;
  padding: 24px 0;
  margin-top: 48px;
}
`;

// Criar arquivo JS básico
const jsContent = `
// Script básico para Shopee Entregas
document.addEventListener('DOMContentLoaded', function() {
  console.log('Shopee Entregas carregado em modo básico');
  
  // Função básica para mostrar alerta ao clicar em botões
  const buttons = document.querySelectorAll('button, .btn');
  buttons.forEach(button => {
    button.addEventListener('click', (e) => {
      if (e.target.getAttribute('data-no-action') !== 'true') {
        e.preventDefault();
        alert('Esta funcionalidade não está disponível no modo básico.');
      }
    });
  });

  // Manipulador básico para formulários
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Envio de formulário não disponível no modo básico.');
    });
  });
});
`;

// Criar index.html básico se não existir
const indexHtmlPath = path.join(publicDir, 'index.html');
if (!fs.existsSync(indexHtmlPath)) {
  console.log('Criando index.html básico...');
  
  const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Shopee Entregas</title>
  <link rel="stylesheet" href="/assets/basic.css">
  <link rel="icon" href="/favicon.ico">
</head>
<body>
  <header class="header">
    <div class="container">
      <div class="logo">Shopee Entregas</div>
      <div>
        <a href="#contato" class="btn">Quero ser entregador</a>
      </div>
    </div>
  </header>

  <main>
    <section class="section">
      <div class="container">
        <h1 class="section-title">Seja um entregador parceiro da Shopee</h1>
        <p>Junte-se a nossa equipe de entregadores e aproveite os benefícios:</p>
        <div class="cards">
          <div class="card">
            <h3>Flexibilidade de horários</h3>
            <p>Trabalhe nos dias e horários que mais combinam com você.</p>
          </div>
          <div class="card">
            <h3>Pagamentos semanais</h3>
            <p>Receba seus pagamentos toda semana diretamente na sua conta.</p>
          </div>
          <div class="card">
            <h3>Suporte 24/7</h3>
            <p>Conte com nossa equipe de suporte a qualquer momento.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section" id="contato">
      <div class="container">
        <h2 class="section-title">Cadastre-se como entregador</h2>
        <p>Preencha o formulário abaixo para iniciar seu cadastro:</p>
        <div class="card">
          <form id="cadastro-form">
            <div>
              <label for="nome">Nome completo</label>
              <input type="text" id="nome" placeholder="Seu nome completo">
            </div>
            <div>
              <label for="email">E-mail</label>
              <input type="email" id="email" placeholder="seu@email.com">
            </div>
            <div>
              <label for="telefone">Telefone</label>
              <input type="tel" id="telefone" placeholder="(00) 00000-0000">
            </div>
            <div>
              <label for="cidade">Cidade</label>
              <input type="text" id="cidade" placeholder="Sua cidade">
            </div>
            <div>
              <button type="submit" class="btn">Cadastrar</button>
            </div>
          </form>
        </div>
      </div>
    </section>
  </main>

  <footer class="footer">
    <div class="container">
      <p>&copy; 2025 Shopee Entregas. Todos os direitos reservados.</p>
    </div>
  </footer>

  <script src="/assets/basic.js"></script>
</body>
</html>`;

  try {
    fs.writeFileSync(indexHtmlPath, htmlContent);
    console.log('✅ index.html básico criado com sucesso.');
  } catch (err) {
    console.error('❌ Erro ao criar index.html:', err.message);
  }
}

// Salvar os arquivos
try {
  fs.writeFileSync(path.join(assetsDir, 'basic.css'), cssContent);
  fs.writeFileSync(path.join(assetsDir, 'basic.js'), jsContent);
  console.log('✅ Arquivos de assets básicos criados com sucesso.');
} catch (err) {
  console.error('❌ Erro ao criar arquivos de assets:', err.message);
  process.exit(1);
}

// Verificar se favicon.ico existe
const faviconPath = path.join(publicDir, 'favicon.ico');
if (!fs.existsSync(faviconPath)) {
  console.log('favicon.ico não encontrado. Criando...');
  try {
    const faviconScript = path.join(rootDir, 'create-favicon.mjs');
    if (fs.existsSync(faviconScript)) {
      // Use dynamic import
      import('./create-favicon.mjs')
        .then(() => console.log('favicon.ico criado via script externo.'))
        .catch(err => console.error('Erro ao importar script de favicon:', err));
    } else {
      // Dados binários básicos para um favicon simples
      const faviconData = Buffer.from([
        0, 0, 1, 0, 1, 0, 16, 16, 0, 0, 1, 0, 24, 0, 104, 4, 
        0, 0, 22, 0, 0, 0, 40, 0, 0, 0, 16, 0, 0, 0, 32, 0, 
        0, 0, 1, 0, 24, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 238, 77, 45, 238, 77, 
        45, 238, 77, 45, 238, 77, 45, 238, 77, 45, 238, 77, 45
      ]);
      
      fs.writeFileSync(faviconPath, faviconData);
      console.log('favicon.ico básico criado com sucesso.');
    }
  } catch (err) {
    console.error('Erro ao criar favicon.ico:', err.message);
  }
}

console.log('\nVerificando diretório public:');
if (fs.existsSync(publicDir)) {
  const publicFiles = fs.readdirSync(publicDir);
  console.log(`Diretório public/ contém ${publicFiles.length} arquivos/diretórios:`);
  console.log(publicFiles.join(', '));
  
  if (fs.existsSync(assetsDir)) {
    const assetFiles = fs.readdirSync(assetsDir);
    console.log(`Diretório assets/ contém ${assetFiles.length} arquivos:`);
    console.log(assetFiles.join(', '));
  }
}

console.log('\n🎉 Criação de assets básicos concluída.');