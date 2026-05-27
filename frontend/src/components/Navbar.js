import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Globe, Menu, X, LayoutDashboard, LogOut } from "lucide-react";
import { supabase } from "../lib/supabase";

const Navbar = ({ transparent = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const isTransparent = transparent && !scrolled;
  const textColor = isTransparent ? "text-white/90 hover:text-white" : "text-gray-600 hover:text-gray-900";
  const logoColor = isTransparent ? "text-white" : "text-gray-900";

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isTransparent ? "bg-transparent" : "bg-white/95 backdrop-blur-xl shadow-sm border-b border-gray-100"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="cursor-pointer flex items-center gap-2.5" onClick={() => navigate("/")}>
          <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-md">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <span className={`text-lg font-bold transition-colors ${logoColor}`}>AMDAAD²</span>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <button
            onClick={() => navigate("/courses")}
            className={`text-sm font-medium transition-colors ${
              location.pathname === "/courses" ? "text-emerald-600" : textColor
            }`}
          >
            Courses
          </button>
          {user ? (
            <>
              <button
                onClick={() => navigate("/dashboard")}
                className={`text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  location.pathname === "/dashboard" ? "text-emerald-600" : textColor
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </button>
              <button
                onClick={handleSignOut}
                className={`text-sm font-medium transition-colors flex items-center gap-1.5 ${textColor}`}
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                className={`text-sm font-medium transition-colors ${textColor}`}
              >
                Sign In
              </button>
              <button
                onClick={() => navigate("/register")}
                className="px-5 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
              >
                Get Started
              </button>
            </>
          )}
        </nav>

        <button
          className={`md:hidden transition-colors ${isTransparent ? "text-white" : "text-gray-700"}`}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {menuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-white border-b border-gray-100 px-4 pb-4 space-y-2"
        >
          <button onClick={() => { navigate("/courses"); setMenuOpen(false); }} className="block w-full text-left text-gray-700 font-medium py-2">Courses</button>
          {user ? (
            <>
              <button onClick={() => { navigate("/dashboard"); setMenuOpen(false); }} className="block w-full text-left text-gray-700 font-medium py-2">Dashboard</button>
              <button onClick={handleSignOut} className="block w-full text-left text-gray-700 font-medium py-2">Sign Out</button>
            </>
          ) : (
            <>
              <button onClick={() => { navigate("/login"); setMenuOpen(false); }} className="block w-full text-left text-gray-700 font-medium py-2">Sign In</button>
              <button onClick={() => { navigate("/register"); setMenuOpen(false); }} className="w-full py-2.5 bg-emerald-600 text-white rounded-lg font-semibold mt-1">Get Started</button>
            </>
          )}
        </motion.div>
      )}
    </motion.header>
  );
};

export default Navbar;
