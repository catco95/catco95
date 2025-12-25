const CrowntimeLogo = ({ size = 'md' }) => {
  const sizes = {
    sm: { height: 'h-12', crown: 'text-3xl', title: 'text-sm', subtitle: 'text-[8px]', tm: 'text-[8px]' },
    md: { height: 'h-16', crown: 'text-4xl', title: 'text-base', subtitle: 'text-[10px]', tm: 'text-[9px]' },
    lg: { height: 'h-20', crown: 'text-5xl', title: 'text-lg', subtitle: 'text-xs', tm: 'text-[10px]' },
    xl: { height: 'h-24', crown: 'text-6xl', title: 'text-xl', subtitle: 'text-sm', tm: 'text-xs' }
  };

  const sizeClass = sizes[size];

  return (
    <div className="flex flex-col items-center" data-testid="crowntime-logo">
      {/* Crown Symbol */}
      <div className={`${sizeClass.crown} text-primary font-bold leading-none mb-1`} style={{ fontFamily: 'serif' }}>
        ♔
      </div>
      {/* Brand Name with TM */}
      <div className="flex flex-col items-center leading-none">
        <div className="relative">
          <div className={`${sizeClass.title} text-primary font-bold tracking-wider`} style={{ fontFamily: 'Playfair Display, serif', letterSpacing: '0.15em' }}>
            CROWNTIM<span className="relative inline-block">E<span className={`absolute ${sizeClass.tm} text-primary font-bold`} style={{ top: '-0.6em', right: '-0.8em' }}>TM</span></span>
          </div>
        </div>
        <div className={`${sizeClass.subtitle} text-primary/80 tracking-widest mt-0.5`} style={{ fontFamily: 'Manrope, sans-serif', letterSpacing: '0.2em' }}>
          EST. 2025
        </div>
      </div>
    </div>
  );
};

export default CrowntimeLogo;