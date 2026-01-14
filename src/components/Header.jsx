import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { UserRound } from 'lucide-react';
import { useTexts } from '@/hooks/useTexts';
import { useGridDebug } from '@/contexts/GridDebugContext';
import SearchDialog from '@/components/SearchDialog';

function Header({
  cartItemCount,
  onCartClick,
  onUserClick,
  offersHeaderVisible = false,
  adminBannerVisible = false
}) {
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const location = useLocation();
  const texts = useTexts();
  const { getDebugStyle, isSectionEnabled } = useGridDebug();

  const isHomePage = location.pathname === '/';

  const navLinks = [
    { name: texts.header.navigation.firstContact, href: '/first-contact' },
    { name: texts.header.navigation.theHumanInside, href: '/the-human-inside' },
    { name: texts.header.navigation.austen, href: '/austen' },
    { name: texts.header.navigation.cube, href: '/cube' },
    { name: texts.header.navigation.outcasted, href: '/outcasted' }
  ];

  return (
    <motion.header
      className="fixed left-0 right-0 z-[10000] bg-white border-b border-gray-200"
      initial={false}
      animate={{
        top: adminBannerVisible && offersHeaderVisible ? '80px' : adminBannerVisible ? '40px' : offersHeaderVisible ? '40px' : '0px'
      }}
      transition={{
        duration: 0.35,
        ease: [0.32, 0.72, 0, 1]
      }}
      style={isSectionEnabled('header') ? getDebugStyle('header', 'main') : {}}
    >
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div
          className="relative flex items-center h-16 lg:h-20"
          style={isSectionEnabled('header') ? getDebugStyle('header', 'row1') : {}}
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex-shrink-0"
          >
            <Link
              to="/"
              className="block transition-transform hover:scale-105 active:scale-95 lg:active:scale-100"
              title="GRÀFIC - Inici"
            >
              <img
                src="/custom_logos/brand/marca-grafic-logo.svg"
                alt="GRAFC"
                className="h-8 lg:h-10 w-auto"
              />
            </Link>
          </motion.div>

          {/* Center: Search Button (mobile) / Navigation (desktop) */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex justify-center flex-1"
          >
            {/* Mobile: Search Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSearchDialogOpen(true)}
              className="h-9 w-9 hover:bg-transparent focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 lg:hidden"
              aria-label="Obrir cerca"
            >
              <svg className="h-5 w-5 text-gray-900 relative top-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="sr-only">Cerca</span>
            </Button>

            {/* Desktop: Navigation */}
            <nav className="hidden lg:flex items-center gap-6 flex-nowrap">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="font-roboto text-sm font-normal text-gray-900 transition-all inline-block whitespace-nowrap"
                  onMouseEnter={(e) => {
                    const color = document.documentElement.classList.contains('dark') ? '#ffffff' : '#141414';
                    e.target.style.textShadow = `0 0 0.55px ${color}, 0 0 0.55px ${color}`;
                  }}
                  onMouseLeave={(e) => e.target.style.textShadow = 'none'}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </motion.div>

          {/* Right: Cart and User (+ Search on desktop) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center justify-end gap-2"
          >
            {/* Search Button (desktop only) */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSearchDialogOpen(true)}
              className="hidden lg:flex h-10 w-10 hover:bg-transparent focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
              aria-label="Obrir cerca"
            >
              <svg className="h-6 w-6 text-gray-900 relative top-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="sr-only">Cerca</span>
            </Button>

            {/* Cart */}
            <Button variant="ghost" size="icon" onClick={onCartClick} className="relative h-9 w-9 lg:h-10 lg:w-10 hover:bg-transparent focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2">
               <img
                src={cartItemCount > 0 ? "/custom_logos/icons/basket-full-2.svg" : "/custom_logos/icons/basket-empty.svg"}
                alt={cartItemCount > 0 ? texts.header.cart.altFull : texts.header.cart.altEmpty}
                className="h-[27px] w-[27px] lg:h-[31px] lg:w-[31px] transition-all duration-200"
              />
              {cartItemCount > 0 && (
                <span className="absolute left-1/2 -translate-x-1/2 text-white text-[13.75px] lg:text-[16.25px] font-bold" style={{ top: 'calc(60% - 1px)', transform: 'translate(-50%, -50%)', lineHeight: '1' }}>
                  {cartItemCount}
                </span>
              )}
              <span className="sr-only">{texts.header.cart.srOnly}</span>
            </Button>

            {/* User Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onUserClick}
              className="h-9 w-9 lg:h-10 lg:w-10 hover:bg-transparent focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
            >
              <UserRound className="h-5 w-5 lg:h-6 lg:w-6 text-gray-900 relative top-1" />
              <span className="sr-only">Obrir menú d'usuari</span>
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Search Dialog */}
      <SearchDialog
        isOpen={isSearchDialogOpen}
        onClose={() => setIsSearchDialogOpen(false)}
      />
    </motion.header>
  );
}

export default Header;
