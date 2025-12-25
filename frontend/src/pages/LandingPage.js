import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Watch, TrendingUp, Shield, BarChart3 } from "lucide-react";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/70 border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <div className="font-heading text-3xl tracking-tight text-primary" data-testid="logo">
            Crowntime AI
          </div>
          <button
            onClick={() => navigate("/valuate")}
            data-testid="header-valuate-button"
            className="rounded-none uppercase tracking-widest text-xs font-bold px-8 py-4 bg-primary text-primary-foreground hover:bg-white hover:text-black transition-all duration-300"
          >
            Valuate
          </button>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-24">
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://images.unsplash.com/photo-1745305023239-b476a0faa159?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzZ8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjB3YXRjaCUyMG1hY3JvJTIwbWVjaGFuaWNhbCUyMG1vdmVtZW50fGVufDB8fHx8MTc2NjY2MjAzN3ww&ixlib=rb-4.1.0&q=85"
            alt="Watch movement"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/80"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <div className="text-xs uppercase tracking-widest text-muted-foreground mb-6" data-testid="hero-tagline">
                Market Intelligence
              </div>
              <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl tracking-tight mb-8 leading-tight" data-testid="hero-title">
                Conservative Valuation
                <br />
                <span className="text-primary">Intelligence</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-12 leading-relaxed max-w-xl" data-testid="hero-description">
                Professional-grade watch market analysis for collectors, dealers, and investors.
                No hype. No speculation. Just conservative, data-driven valuation guidance.
              </p>
              <button
                onClick={() => navigate("/valuate")}
                data-testid="hero-cta-button"
                className="rounded-none uppercase tracking-widest text-xs font-bold px-12 py-5 bg-primary text-primary-foreground hover:bg-white hover:text-black transition-all duration-300"
              >
                Get Started
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
              className="hidden lg:block"
            >
              <div className="bg-card/50 backdrop-blur-sm border border-white/5 rounded-sm p-12">
                <img
                  src="https://images.unsplash.com/photo-1631802042706-230bce420129?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzZ8MHwxfHNlYXJjaHw0fHxsdXh1cnklMjB3YXRjaCUyMG1hY3JvJTIwbWVjaGFuaWNhbCUyMG1vdmVtZW50fGVufDB8fHx8MTc2NjY2MjAzN3ww&ixlib=rb-4.1.0&q=85"
                  alt="Luxury watch"
                  className="w-full h-auto rounded-sm"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 bg-card/30" data-testid="features-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-20"
          >
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
              Our Approach
            </div>
            <h2 className="font-heading text-4xl sm:text-5xl tracking-tight">
              Investment-Grade Intelligence
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Shield className="w-8 h-8" />,
                title: "Conservative",
                description: "Realistic valuations based on actual sales data, not speculative listings.",
                testId: "feature-conservative"
              },
              {
                icon: <TrendingUp className="w-8 h-8" />,
                title: "Market-Aware",
                description: "Real-time sentiment analysis across luxury watch market segments.",
                testId: "feature-market-aware"
              },
              {
                icon: <BarChart3 className="w-8 h-8" />,
                title: "Data-Driven",
                description: "AI-powered analysis of comparable sales and market liquidity.",
                testId: "feature-data-driven"
              },
              {
                icon: <Watch className="w-8 h-8" />,
                title: "Expert-Level",
                description: "Trained on dealer knowledge and collector experience.",
                testId: "feature-expert-level"
              }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                data-testid={feature.testId}
                className="bg-card/50 backdrop-blur-sm border border-white/5 hover:border-primary/30 transition-colors duration-300 rounded-sm p-8"
              >
                <div className="text-primary mb-6">{feature.icon}</div>
                <h3 className="font-heading text-xl mb-4">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32" data-testid="cta-section">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="font-heading text-4xl sm:text-5xl tracking-tight mb-8">
              Ready for Professional Valuation?
            </h2>
            <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
              Get conservative, investment-grade market intelligence for your timepiece in minutes.
            </p>
            <button
              onClick={() => navigate("/valuate")}
              data-testid="cta-button"
              className="rounded-none uppercase tracking-widest text-xs font-bold px-12 py-5 bg-primary text-primary-foreground hover:bg-white hover:text-black transition-all duration-300"
            >
              Start Valuation
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12" data-testid="footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="font-heading text-2xl text-primary">
              Crowntime AI
            </div>
            <div className="text-xs text-muted-foreground">
              Indicative market intelligence only. Not a certified appraisal.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;