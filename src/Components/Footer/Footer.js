import React from 'react';
import { useLocation } from 'react-router-dom';

const Footer = () => {
  const location = useLocation();
  const pathname = location.pathname;
  return (
    <footer className={`bg-custom-red ${pathname==='/'?'md:fixed':''} md:bottom-0 w-full text-black py-2`}>
      <div className='container mx-auto'>
        <div className='flex flex-col md:flex-row justify-between items-center'>
          <div className='text-center md:text-left'>
            <a
              href='https://www.apnacollege.in/'
              target="_blank"
              rel="noopener noreferrer"
              className='hover:underline text-sm'
            >
              ✨ Support | Contact Us
            </a>
          </div>
          <div className='md:mt-0 text-center'>
            <p className='text-sm'>
              &copy; {new Date().getFullYear()} Apna College. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
export default Footer;