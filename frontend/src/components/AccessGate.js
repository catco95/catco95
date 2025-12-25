import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Shield } from 'lucide-react';
import CrowntimeLogo from './CrowntimeLogo';

const AccessGate = ({ onAccessGranted }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Check access code
    if (code.toUpperCase() === 'CROWNTIME2025') {
      localStorage.setItem('crowntime_access', 'granted');
      localStorage.setItem('crowntime_valuations_used', '0');
      setTimeout(() => {
        onAccessGranted();
      }, 500);
    } else {
      setError('Invalid access code. Please contact Crowntime for access.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <div className="text-center mb-8">
          <div className="mb-6 flex justify-center">
            <CrowntimeLogo size="xl" />
          </div>
          <div className="inline-block px-4 py-1 bg-primary/20 border border-primary/30 rounded-sm mb-6">
            <span className="text-xs uppercase tracking-widest text-primary font-semibold">Beta Testing</span>
          </div>
          <h1 className="font-heading text-3xl mb-4">Dealer Access Portal</h1>
          <p className="text-muted-foreground text-sm">
            This is an exclusive beta testing program for select watch dealers.
            Enter your access code to continue.
          </p>
        </div>

        <div className="bg-card/50 backdrop-blur-sm border border-white/5 rounded-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-3">
                <Lock className="w-4 h-4 inline mr-2" />
                Access Code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter your code"
                className="w-full bg-transparent border-b border-white/20 rounded-none px-0 py-4 focus:border-primary focus:outline-none placeholder:text-white/20 transition-all text-center text-lg tracking-widest uppercase"
                required
                data-testid="access-code-input"
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-destructive text-sm text-center bg-destructive/10 border border-destructive/20 rounded-sm p-3"
                data-testid="access-error"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              data-testid="access-submit-button"
              className="w-full rounded-none uppercase tracking-widest text-xs font-bold px-8 py-5 bg-primary text-primary-foreground hover:bg-white hover:text-black transition-all duration-300 disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Enter Portal'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="flex items-start gap-3 text-xs text-muted-foreground">
              <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>
                <strong className="text-foreground">Beta Test Limitations:</strong><br />
                • 5 valuations per session<br />
                • Access code required<br />
                • Testing phase only
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Need access? Contact <span className="text-primary">dealers@crowntime.ai</span>
        </p>
      </motion.div>
    </div>
  );
};

export default AccessGate;