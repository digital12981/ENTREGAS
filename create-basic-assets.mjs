#!/usr/bin/env node

/**
 * Script para criar assets básicos para o frontend
 * 
 * Este script cria arquivos CSS e JS básicos que serão usados como fallback
 * caso os arquivos compilados pelo Vite não estejam disponíveis.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Configurar caminhos
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = process.cwd();

console.log('🔧 Criando assets básicos para o frontend...');

// Garantir que os diretórios existam
const publicDir = path.join(rootDir, 'public');
const assetsDir = path.join(publicDir, 'assets');
const distPublicDir = path.join(rootDir, 'dist', 'public');
const distPublicAssetsDir = path.join(distPublicDir, 'assets');
const distClientDir = path.join(rootDir, 'dist', 'client');
const distClientAssetsDir = path.join(distClientDir, 'assets');

// Criar diretórios se não existirem
[publicDir, assetsDir, distPublicDir, distPublicAssetsDir, distClientDir, distClientAssetsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// CSS básico que simula o estilo do Shopee
const basicCss = `/* Estilos básicos para a página */
:root {
  --primary: #ee4d2d;
  --secondary: #f5f5f5;
  --dark: #222;
  --light: #fff;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Roboto', 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
  line-height: 1.6;
  color: var(--dark);
  background-color: var(--secondary);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

header {
  background-color: var(--primary);
  color: white;
  padding: 1rem 0;
}

header .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
}

nav ul {
  display: flex;
  list-style: none;
}

nav ul li {
  margin-left: 20px;
}

nav ul li a {
  color: white;
  text-decoration: none;
}

.hero {
  padding: 80px 0;
  text-align: center;
  background-color: var(--primary);
  color: white;
}

.hero h1 {
  font-size: 2.5rem;
  margin-bottom: 20px;
}

.hero p {
  font-size: 1.2rem;
  margin-bottom: 30px;
}

.btn {
  display: inline-block;
  background-color: white;
  color: var(--primary);
  padding: 12px 24px;
  border-radius: 4px;
  text-decoration: none;
  font-weight: bold;
  transition: all 0.3s ease;
}

.btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.features {
  padding: 80px 0;
  background-color: var(--light);
}

.features h2 {
  text-align: center;
  margin-bottom: 40px;
  color: var(--primary);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
}

.feature-card {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.feature-card .icon {
  color: var(--primary);
  font-size: 40px;
  margin-bottom: 20px;
}

.feature-card h3 {
  margin-bottom: 15px;
  color: var(--primary);
}

footer {
  background-color: var(--dark);
  color: white;
  padding: 40px 0;
  text-align: center;
}

@media (max-width: 768px) {
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  nav ul {
    display: none;
  }
}

/* Animações */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-in-out;
}
`;

// JavaScript básico para simular interatividade
const basicJs = `// Script básico para interatividade
document.addEventListener('DOMContentLoaded', function() {
  console.log('Página carregada com ativos básicos');
  
  // Obter elementos importantes
  const root = document.getElementById('root');
  
  // Se o elemento raiz estiver vazio, adicionar conteúdo básico
  if (root && root.children.length === 0) {
    root.innerHTML = \`
      <div class="animate-fade-in">
        <header>
          <div class="container">
            <div class="logo">Shopee Entregas</div>
            <nav>
              <ul>
                <li><a href="#">Início</a></li>
                <li><a href="#">Benefícios</a></li>
                <li><a href="#">Cadastro</a></li>
                <li><a href="#">Contato</a></li>
              </ul>
            </nav>
          </div>
        </header>
        
        <section class="hero">
          <div class="container">
            <h1>Seja um Entregador Parceiro da Shopee</h1>
            <p>Junte-se à nossa equipe e tenha uma fonte de renda extra com flexibilidade de horários.</p>
            <a href="#" class="btn">Cadastre-se Agora</a>
          </div>
        </section>
        
        <section class="features">
          <div class="container">
            <h2>Nossos Benefícios</h2>
            <div class="features-grid">
              <div class="feature-card">
                <div class="icon">🚚</div>
                <h3>Flexibilidade de Horários</h3>
                <p>Trabalhe quando e quanto quiser, adaptando-se à sua rotina.</p>
              </div>
              <div class="feature-card">
                <div class="icon">💰</div>
                <h3>Pagamentos Semanais</h3>
                <p>Receba seus pagamentos toda semana diretamente na sua conta.</p>
              </div>
              <div class="feature-card">
                <div class="icon">📱</div>
                <h3>Aplicativo Intuitivo</h3>
                <p>Nosso app é fácil de usar e te auxilia em todas as entregas.</p>
              </div>
              <div class="feature-card">
                <div class="icon">🛡️</div>
                <h3>Suporte 24/7</h3>
                <p>Conte com nossa equipe de suporte a qualquer momento.</p>
              </div>
            </div>
          </div>
        </section>
        
        <footer>
          <div class="container">
            <p>&copy; 2025 Shopee Entregas. Todos os direitos reservados.</p>
          </div>
        </footer>
      </div>
    \`;
    
    // Adicionar listeners de eventos
    const btn = document.querySelector('.btn');
    if (btn) {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        alert('Funcionalidade de cadastro em desenvolvimento!');
      });
    }
  }
  
  // Verificar e corrigir problemas de carregamento
  window.addEventListener('error', function(e) {
    if (e.target.tagName === 'SCRIPT' || e.target.tagName === 'LINK') {
      console.warn('Erro ao carregar recurso:', e.target.src || e.target.href);
    }
  }, true);
});
`;

// Função para salvar arquivos básicos
function saveBasicAssets() {
  const files = [
    { path: path.join(assetsDir, 'basic.css'), content: basicCss },
    { path: path.join(assetsDir, 'basic.js'), content: basicJs },
    { path: path.join(distPublicAssetsDir, 'basic.css'), content: basicCss },
    { path: path.join(distPublicAssetsDir, 'basic.js'), content: basicJs },
    { path: path.join(distClientAssetsDir, 'basic.css'), content: basicCss },
    { path: path.join(distClientAssetsDir, 'basic.js'), content: basicJs }
  ];
  
  files.forEach(file => {
    try {
      fs.writeFileSync(file.path, file.content);
    } catch (err) {
      console.error(`Erro ao salvar arquivo ${file.path}: ${err.message}`);
    }
  });
}

// Atualizar arquivos HTML para usar os ativos básicos se necessário
function updateHtmlFiles() {
  const htmlFiles = [
    path.join(publicDir, 'index.html'),
    path.join(distPublicDir, 'index.html'),
    path.join(distClientDir, 'index.html')
  ];
  
  htmlFiles.forEach(htmlFile => {
    if (fs.existsSync(htmlFile)) {
      try {
        let html = fs.readFileSync(htmlFile, 'utf8');
        let updated = false;
        
        // Verificar se o HTML já faz referência a assets/index.js
        if (!html.includes('src="/assets/index') && !html.includes("src='/assets/index")) {
          // Substituir a referência ao script de desenvolvimento pelo script de produção
          const scriptPattern = /<script\s+type="module"\s+src="\/src\/main\.tsx"><\/script>/g;
          if (html.match(scriptPattern)) {
            html = html.replace(scriptPattern, '<script type="module" src="/assets/basic.js"></script>');
            updated = true;
          } else {
            // Inserir o script básico antes do fechamento do body se não encontrou o pattern
            const bodyClosePattern = /<\/body>/;
            if (html.match(bodyClosePattern)) {
              html = html.replace(bodyClosePattern, '<script type="module" src="/assets/basic.js"></script>\n</body>');
              updated = true;
            }
          }
        }
        
        // Verificar se o HTML já faz referência a assets/index.css
        if (!html.includes('href="/assets/index') && !html.includes("href='/assets/index")) {
          // Adicionar o link para o CSS básico antes do fechamento do head
          const headClosePattern = /<\/head>/;
          if (html.match(headClosePattern)) {
            html = html.replace(headClosePattern, '<link rel="stylesheet" href="/assets/basic.css">\n</head>');
            updated = true;
          }
        }
        
        if (updated) {
          fs.writeFileSync(htmlFile, html);
          console.log(`Arquivo ${path.relative(rootDir, htmlFile)} atualizado com sucesso.`);
        } else {
          console.log(`Arquivo ${path.relative(rootDir, htmlFile)} já está correto ou não pôde ser atualizado.`);
        }
      } catch (err) {
        console.error(`Erro ao atualizar arquivo ${htmlFile}: ${err.message}`);
      }
    }
  });
}

// Executar operações
try {
  saveBasicAssets();
  updateHtmlFiles();
  console.log('✅ Arquivos de assets básicos criados com sucesso.');
  
  // Exibir informações sobre os diretórios
  console.log('\nVerificando diretório public:');
  if (fs.existsSync(publicDir)) {
    const publicFiles = fs.readdirSync(publicDir);
    console.log(`Diretório public/ contém ${publicFiles.length} arquivos/diretórios:`);
    console.log(publicFiles.join(', '));
    
    if (fs.existsSync(assetsDir)) {
      const assetsFiles = fs.readdirSync(assetsDir);
      console.log(`Diretório assets/ contém ${assetsFiles.length} arquivos:`);
      console.log(assetsFiles.join(', '));
    }
  }
} catch (err) {
  console.error(`❌ Erro: ${err.message}`);
}

console.log('\n🎉 Criação de assets básicos concluída.');