import React from 'react';
import { Link } from 'wouter';

const Header: React.FC = () => {
  return (
    <header className="bg-black w-full">
      <div className="container mx-auto px-4 py-6 flex items-center justify-start">
        <Link href="/">
          <img 
            src="https://i.ibb.co/wFFn5HSn/13093103960002-1.png" 
            alt="Uber Logo" 
            className="h-6 cursor-pointer"
          />
        </Link>
      </div>
    </header>
  );
};

export default Header;