import React from 'react';
import lgLogo from '@/assets/lg-logo-nav.png';
import { useNavigate } from 'react-router-dom';

const Logo = () => {
  const navigate = useNavigate();
  return (
    <div className="fixed top-4 left-4 z-50">
      <img
        src={lgLogo}
        alt="LG Logo"
        className="h-10 w-auto opacity-90 hover:opacity-100 transition-opacity cursor-pointer"
        onClick={() => navigate('/home')}
      />
    </div>
  );
};

export default Logo;
