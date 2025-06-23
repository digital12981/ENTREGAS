import React from 'react';
import { Link } from 'wouter';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/">
          <svg 
            width="91" 
            height="20" 
            viewBox="0 0 91 20" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 cursor-pointer"
          >
            <path 
              d="M85.399 10.12c0 4.76-3.47 7.88-8.36 7.88s-8.35-3.12-8.35-7.88 3.46-7.88 8.35-7.88 8.36 3.12 8.36 7.88zm-4.34 0c0-2.28-1.47-3.96-4.02-3.96s-4.02 1.68-4.02 3.96 1.47 3.96 4.02 3.96 4.02-1.68 4.02-3.96zM91 5.76h-4.18v12.04H82.8V5.76h-4.18V2.56H91v3.2zM40.48 11.6V2.16h4.02V11c0 1.92.72 2.8 2.16 2.8s2.16-.88 2.16-2.8V2.16h4.02v9.44c0 4.24-2.4 6.6-6.18 6.6s-6.18-2.36-6.18-6.6zM23.36 17.8V2.56h7.76c4.64 0 7.6 2.72 7.6 7.2 0 4.48-2.96 7.2-7.6 7.2h-3.74v.84h-4.02zm4.02-4.04h3.18c2.32 0 3.82-1.36 3.82-3.76s-1.5-3.76-3.82-3.76h-3.18v7.52zM59.239 2.16h4.02v15.64h-4.02V2.16zM0 17.8V2.56h7.76c4.64 0 7.6 2.72 7.6 7.2 0 4.48-2.96 7.2-7.6 7.2H4.02v.84H0zm4.02-4.04h3.18c2.32 0 3.82-1.36 3.82-3.76S9.52 6.24 7.2 6.24H4.02v7.52z" 
              fill="#000"
            />
          </svg>
        </Link>
        <div className="hamburger-menu cursor-pointer">
          <div className="hamburger-line w-[16px] h-[3px] bg-black my-1 transition-all duration-400"></div>
          <div className="hamburger-line w-[20px] h-[3px] bg-black my-1 transition-all duration-400"></div>
          <div className="hamburger-line w-[24px] h-[3px] bg-black my-1 transition-all duration-400"></div>
        </div>
      </div>
    </header>
  );
};

export default Header;