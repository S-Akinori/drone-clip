import Link from 'next/link';
import MenuIcon from '@mui/icons-material/Menu';
import React, { createContext, useState } from 'react';
import { IconButton } from '@mui/material';
import { useAuth } from '../../../lib/auth/auth';
const Header = () => {
  const auth = useAuth();
  return (
    <>
      <style jsx>{`
        .nav-container {
          opacity: 0;
          transition: 300ms;
        }
        .nav-container.open {
          opacity: 1;
        }
      `}</style>
      <header className="flex items-center fixed top-0 z-40 px-4 bg-white border-b border-black w-full h-16">
        <div className="container flex justify-between items-center mx-auto">
          <div className='pb-0 text-lg'><Link href="/">{process.env.NEXT_PUBLIC_SITE_NAME}</Link></div>
          <nav>
            <ul className='flex items-center'>
              {!auth?.user && (
                <>
                  <li className='px-4'><Link href='/register'>登録</Link></li>
                  <li className='px-4'><Link href='/login'>ログイン</Link></li>
                </>
              )}
              {auth?.user && (
                <>
                  <li className='px-4'><Link href='/home'>ホーム</Link></li>
                </>
              )}
            </ul>
          </nav>
        </div>
      </header>
      <div className="h-16"></div>
    </>
  )
}

export default Header; 