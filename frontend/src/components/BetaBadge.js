import { motion } from 'framer-motion';

const BetaBadge = ({ valuationsUsed = 0, valuationsLimit = 5 }) => {
  const remaining = valuationsLimit - valuationsUsed;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-20 right-4 z-40"
      data-testid="beta-badge"
    >
      <div className="bg-card/90 backdrop-blur-sm border border-primary/30 rounded-sm px-4 py-3 shadow-lg">
        <div className="text-xs uppercase tracking-widest text-primary font-semibold mb-1">
          Beta Testing
        </div>
        <div className="text-xs text-muted-foreground">
          {remaining} {remaining === 1 ? 'valuation' : 'valuations'} remaining
        </div>
        {remaining === 0 && (
          <div className="text-xs text-destructive mt-1 font-semibold">
            Limit reached
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default BetaBadge;