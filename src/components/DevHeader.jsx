import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { UserRound } from 'lucide-react';
import SearchDialog from '@/components/SearchDialog';

export default function DevHeader({
  adminBannerHeight = 0,
  cartItemCount = 0,
  onCartClick,
  onUserClick,
}) {
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);

  const demoLinks = [
    { label: 'Nike També', href: '/nike-tambe' },
    { label: 'Adidas', href: '/adidas-demo' },
    { label: 'Nike Hero', href: '/nike-hero-demo' },
  ];

  return (
    <div
      className="fixed left-0 right-0 z-[20000] bg-white border-b border-gray-200"
      style={{ top: `${adminBannerHeight}px` }}
    >
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="relative flex items-center h-16 lg:h-20">
          <div className="flex-shrink-0" id="dev-header-left">
            <Link
              to="/dev-links"
              className="block transition-transform hover:scale-105 active:scale-95 lg:active:scale-100"
              title="DEV"
            >
              <div className="h-8 lg:h-10 flex items-center font-roboto text-sm font-semibold tracking-[0.22em] text-gray-900">
                DEV
              </div>
            </Link>
          </div>

          <div className="absolute left-1/2 -translate-x-1/2 hidden lg:flex items-center gap-6 flex-nowrap">
            {demoLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="font-roboto text-sm font-normal text-gray-900 transition-all inline-block whitespace-nowrap"
                onMouseEnter={(e) => {
                  const color = document.documentElement.classList.contains('dark') ? '#ffffff' : '#141414';
                  e.currentTarget.style.textShadow = `0 0 0.55px ${color}, 0 0 0.55px ${color}`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.textShadow = 'none';
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex-1" />

          <div className="flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSearchDialogOpen(true)}
              className="h-9 w-9 lg:h-10 lg:w-10 hover:bg-transparent focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
              aria-label="Obrir cerca"
            >
              <svg className="h-6 w-6 text-gray-900 relative top-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="sr-only">Cerca</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={onCartClick}
              className="relative h-9 w-9 lg:h-10 lg:w-10 hover:bg-transparent focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
              aria-label="Obrir cistell"
            >
              <img
                src={cartItemCount > 0 ? "/custom_logos/icons/basket-full-2.svg" : "/custom_logos/icons/basket-empty.svg"}
                alt={cartItemCount > 0 ? 'Cistell ple' : 'Cistell buit'}
                className="h-[27px] w-[27px] lg:h-[31px] lg:w-[31px] transition-all duration-200"
              />
              {cartItemCount > 0 && (
                <span
                  className="absolute left-1/2 -translate-x-1/2 text-white text-[13.75px] lg:text-[16.25px] font-bold"
                  style={{ top: 'calc(60% - 1px)', transform: 'translate(-50%, -50%)', lineHeight: '1' }}
                >
                  {cartItemCount}
                </span>
              )}
              <span className="sr-only">Cistell</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={onUserClick}
              className="h-9 w-9 lg:h-10 lg:w-10 hover:bg-transparent focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
              aria-label="Obrir menú d'usuari"
              id="dev-header-user"
            >
              <UserRound className="h-5 w-5 lg:h-6 lg:w-6 text-gray-900 relative top-1" />
              <span className="sr-only">Usuari</span>
            </Button>
          </div>
        </div>
      </div>

      <SearchDialog
        isOpen={isSearchDialogOpen}
        onClose={() => setIsSearchDialogOpen(false)}
      />
    </div>
  );
}
