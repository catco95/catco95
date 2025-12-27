import React from 'react';

const Header = () => {
  return (
    <header className="border-b border-emerald-800/30 bg-emerald-950/80 backdrop-blur-sm sticky top-0 z-40" data-testid="header">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold to-yellow-600 flex items-center justify-center shadow-lg shadow-gold/20">
              <svg className="w-6 h-6 text-emerald-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-serif font-semibold" data-testid="logo-text">
                <span className="text-emerald-100">Crowntime</span>{' '}
                <span className="text-gold">AI</span>
              </h1>
              <p className="text-xs text-emerald-100/50 tracking-wider uppercase">Market Intelligence</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <span className="text-emerald-100/60 text-sm">Conservative Valuations</span>
            <span className="text-gold/40 text-sm">|</span>
            <span className="text-emerald-100/60 text-sm">Trade-Level Pricing</span>
          </nav>

          {/* Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-900/50 rounded-full border border-emerald-700/30">
            <div className="w-2 h-2 rounded-full bg-gold animate-pulse"></div>
            <span className="text-xs text-emerald-100/70">Live Market Data</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
