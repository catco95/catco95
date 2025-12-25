const CrowntimeLogo = ({ size = 'md' }) => {
  const sizes = {
    sm: { height: 'h-12', crown: 'text-2xl', title: 'text-sm', subtitle: 'text-[8px]', tm: 'text-[10px]' },
    md: { height: 'h-16', crown: 'text-3xl', title: 'text-base', subtitle: 'text-[10px]', tm: 'text-xs' },
    lg: { height: 'h-20', crown: 'text-4xl', title: 'text-lg', subtitle: 'text-xs', tm: 'text-sm' },
    xl: { height: 'h-24', crown: 'text-5xl', title: 'text-xl', subtitle: 'text-sm', tm: 'text-base' }
  };

  const sizeClass = sizes[size];

  return (
    <div className="flex items-start gap-1" data-testid="crowntime-logo">
      <div className={`flex flex-col items-center ${sizeClass.height} justify-center`}>
        {/* Crown Symbol */}
        <div className={`${sizeClass.crown} text-primary font-bold leading-none mb-1`} style={{ fontFamily: 'serif' }}>
          ♔
        </div>
        {/* Brand Name */}
        <div className="flex flex-col items-center leading-none">
          <div className={`${sizeClass.title} text-primary font-bold tracking-wider`} style={{ fontFamily: 'Playfair Display, serif', letterSpacing: '0.15em' }}>
            CROWNTIME
          </div>
          <div className={`${sizeClass.subtitle} text-primary/80 tracking-widest mt-0.5`} style={{ fontFamily: 'Manrope, sans-serif', letterSpacing: '0.2em' }}>
            EST. 2025
          </div>
        </div>
      </div>
      {/* TM Symbol */}
      <span className={`${sizeClass.tm} text-primary font-bold`} style={{ marginTop: '2px' }}>
        TM
      </span>
    </div>
  );
};

export default CrowntimeLogo;