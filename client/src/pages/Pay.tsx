import React from 'react';

const Pay: React.FC = () => {
  return (
    <>
      <html lang="pt-BR">
<head>
    <meta charSet="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Pagamento</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css" />
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500&display=swap" rel="stylesheet" />
    <style dangerouslySetInnerHTML={{__html: `
        body {
            font-family: 'Roboto', sans-serif;
        }
        input::placeholder {
            color: #969696;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .spinner {
            width: 20px;
            height: 20px;
            border: 2px solid #FFECE6;
            border-top: 2px solid #EF4444;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
    `}} />
</head>
<body className="bg-[#F5F5F5] text-sm">
    <header className="bg-white py-2 px-4 flex items-center rounded-b-sm">
        <a href="#" className="text-[#EF4444] text-xl"></a>
        <div className="flex-grow flex items-center justify-center">
            <div className="spinner mr-2"></div>
            <h1 className="text-lg font-normal text-center text-[#10172A]">Aguardando pagamento...</h1>
        </div>
    </header>

    <div className="w-full bg-white mt-2 rounded-sm">
        <div className="p-3">
            <div className="flex items-start mb-4">
                <img src="https://i.ibb.co/Q7RXTRzN/a0e45d2fcc7fdab21ea74890cbd0d45e-2-1.png" alt="Uniforme de Segurança" className="w-[100px] bg-[#F5F5F5] rounded-[4px]" />
                <div className="ml-4 flex flex-col justify-start">
                    <p className="text-[#212121] font-bold">Entregador Shopee</p>
                    <p className="text-[#212121]"><strong>Nome:</strong> João da Silva</p>
                    <p className="text-[#212121]"><strong>CPF:</strong> 123.456.789-00</p>
                </div>
            </div>

            <hr className="w-full border-t border-gray-200 my-4" />

            <div className="flex items-center justify-center mb-4">
                <img src="https://img.icons8.com/color/512/pix.png" alt="Pix logo" className="w-6 h-6 mr-2" />
                <span className="text-[#212121]">Pix</span>
            </div>

            <div className="bg-[#FFF3CD] border border-[#FFEEBA] rounded-sm p-3 mb-4 text-center">
                <p className="text-[#856404]">Realize o pagamento de <strong>R$79,90</strong> para receber o Uniforme de Segurança e ativar seu cadastro.</p>
            </div>

            <div className="mb-4">
                <p className="text-[#212121] text-center mb-1">Código Pix</p>
                <div className="flex justify-center">
                    <div className="w-4/5 bg-[#F5F5F5] border border-[#E0E0E0] rounded">
                        <input type="text" defaultValue="000201010212268500..." className="w-full h-[32px] text-[#737373] bg-transparent focus:outline-none text-center overflow-hidden px-2" readOnly />
                    </div>
                </div>
            </div>

            <button className="w-full bg-[#EF4444] text-white py-2 rounded-sm">
            Copiar Código Pix
        </button>
        </div>
    </div>

    <div className="w-full bg-white mt-2 rounded-sm">
        <div className="p-3">
            <p className="text-[#212121] font-medium mb-4 pb-2 border-b border-[#E0E0E0]">Por favor siga as instruções</p>

            <div className="flex mb-2">
                <div className="w-5 flex-shrink-0">
                    <div className="w-5 h-5 rounded-full bg-[#CCCCCC] flex items-center justify-center text-white text-xs">1</div>
                </div>
                <p className="text-[#737373] ml-2">Copie o código Pix acima.</p>
            </div>

            <div className="flex mb-2">
                <div className="w-5 flex-shrink-0">
                    <div className="w-5 h-5 rounded-full bg-[#CCCCCC] flex items-center justify-center text-white text-xs">2</div>
                </div>
                <p className="text-[#737373] ml-2">Acesse o app do seu banco ou internet banking de preferência.</p>
            </div>

            <div className="flex mb-2">
                <div className="w-5 flex-shrink-0">
                    <div className="w-5 h-5 rounded-full bg-[#CCCCCC] flex items-center justify-center text-white text-xs">3</div>
                </div>
                <p className="text-[#737373] ml-2">Escolha pagar com o Pix, cole o código e finalize o pagamento.</p>
            </div>

            <div className="flex mb-2">
                <div className="w-5 flex-shrink-0">
                    <div className="w-5 h-5 rounded-full bg-[#CCCCCC] flex items-center justify-center text-white text-xs">4</div>
                </div>
                <p className="text-[#737373] ml-2">Seu pagamento será aprovado em alguns segundos.</p>
            </div>
        </div>
    </div>

    <div className="p-3 mt-2">
    </div>
</body>
</html>
    </>
  );
};

export default Pay;