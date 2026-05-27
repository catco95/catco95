import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { BookOpen, Users, Award, Star, ChevronRight, Globe, CirclePlay as PlayCircle, CircleCheck as CheckCircle, Menu, X, ArrowRight, Quote } from "lucide-react";
import { supabase } from "../lib/supabase";

const NAV_LINKS = [
  { label: "Courses", path: "/courses" },
];

const STATS = [
  { value: "5,000+", label: "Active Students" },
  { value: "34+", label: "Lessons" },
  { value: "5", label: "Expert Courses" },
  { value: "3", label: "Categories" },
];

const FEATURES = [
  {
    icon: <BookOpen className="w-7 h-7" />,
    title: "Structured Curriculum",
    description: "Progressive courses designed by qualified scholars and educators.",
  },
  {
    icon: <Users className="w-7 h-7" />,
    title: "Expert Instructors",
    description: "Learn from certified teachers with years of hands-on experience.",
  },
  {
    icon: <Award className="w-7 h-7" />,
    title: "Track Progress",
    description: "Monitor your advancement with detailed lesson-by-lesson tracking.",
  },
  {
    icon: <Star className="w-7 h-7" />,
    title: "Quality Content",
    description: "Structured lessons with comprehensive study materials.",
  },
];

const TESTIMONIALS = [
  {
    name: "Ahmed Al-Rashid",
    role: "Student",
    text: "AMDAAD² transformed how I study Quran. The structured lessons and progress tracking keep me motivated every single day.",
    avatar: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?w=80&h=80&fit=crop",
  },
  {
    name: "Fatima Hassan",
    role: "Student",
    text: "I've tried many platforms, but nothing compares to the depth of content here. The Tajweed course is exceptional.",
    avatar: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?w=80&h=80&fit=crop",
  },
  {
    name: "Omar Khalid",
    role: "Student",
    text: "The Arabic language course took me from complete beginner to reading confidently in just a few months.",
    avatar: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?w=80&h=80&fit=crop",
  },
];

const LandingPage = () => {
  const navigate = useNavigate();
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    fetchFeaturedCourses();
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const fetchFeaturedCourses = async () => {
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("is_featured", true)
        .order("created_at", { ascending: false })
        .limit(3);
      if (error) throw error;
      setFeaturedCourses(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryLabel = (cat) =>
    ({ arabic: "Arabic Language", quran: "Quran Studies", tajweed: "Tajweed" }[cat] || cat);

  const getLevelColor = (level) =>
    ({ beginner: "bg-emerald-100 text-emerald-700", intermediate: "bg-amber-100 text-amber-700", advanced: "bg-rose-100 text-rose-700" }[level] || "bg-gray-100 text-gray-600");

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Navbar */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-white/95 backdrop-blur-xl shadow-sm border-b border-gray-100" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="cursor-pointer flex items-center gap-2.5" onClick={() => navigate("/")}>
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-md">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <span className={`text-lg font-bold transition-colors ${scrolled ? "text-gray-900" : "text-white"}`}>
              AMDAAD²
            </span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((l) => (
              <button
                key={l.path}
                onClick={() => navigate(l.path)}
                className={`text-sm font-medium transition-colors hover:text-emerald-500 ${scrolled ? "text-gray-600" : "text-white/90"}`}
              >
                {l.label}
              </button>
            ))}
            <button
              onClick={() => navigate("/login")}
              className={`text-sm font-medium transition-colors ${scrolled ? "text-gray-600 hover:text-gray-900" : "text-white/90 hover:text-white"}`}
            >
              Sign In
            </button>
            <button
              onClick={() => navigate("/register")}
              className="px-5 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
            >
              Get Started
            </button>
          </nav>

          {/* Mobile menu toggle */}
          <button
            className={`md:hidden ${scrolled ? "text-gray-800" : "text-white"}`}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-white border-b border-gray-100 px-4 pb-4 space-y-3"
          >
            {NAV_LINKS.map((l) => (
              <button
                key={l.path}
                onClick={() => { navigate(l.path); setMenuOpen(false); }}
                className="block w-full text-left text-gray-700 font-medium py-2"
              >
                {l.label}
              </button>
            ))}
            <button onClick={() => navigate("/login")} className="block w-full text-left text-gray-700 font-medium py-2">Sign In</button>
            <button onClick={() => navigate("/register")} className="w-full py-2.5 bg-emerald-600 text-white rounded-lg font-semibold">Get Started</button>
          </motion.div>
        )}
      </motion.header>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-gray-900 via-emerald-950 to-teal-900">
        {/* Background image overlay */}
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/3747463/pexels-photo-3747463.jpeg?w=1600&fit=crop"
            alt=""
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 via-emerald-950/70 to-teal-900/80" />
        </div>

        {/* Decorative Arabic pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2310b981' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 w-full">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-full text-sm font-medium mb-6">
                <Star className="w-3.5 h-3.5 fill-current" />
                Begin Your Sacred Journey
              </span>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
                Master Arabic
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                  & Quran
                </span>
              </h1>

              <p className="text-xl text-gray-300 mb-8 leading-relaxed max-w-2xl">
                Embark on a transformative learning journey with expert-led courses
                in Arabic language, Quran memorization, and Tajweed. Study at your own pace.
              </p>

              <div className="flex flex-wrap gap-4 mb-12">
                <button
                  onClick={() => navigate("/courses")}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-emerald-900/40 text-lg"
                >
                  Explore Courses
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => navigate("/register")}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-all duration-200 border border-white/20 text-lg backdrop-blur-sm"
                >
                  <PlayCircle className="w-5 h-5" />
                  Get Started Free
                </button>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap items-center gap-6 text-gray-400 text-sm">
                {["No credit card required", "Cancel anytime", "Expert instructors"].map((t) => (
                  <span key={t} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    {t}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/30 backdrop-blur-sm border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="text-center"
              >
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-emerald-600 text-sm font-semibold uppercase tracking-widest">Why Choose Us</span>
            <h2 className="text-4xl font-bold text-gray-900 mt-2 mb-4">Everything You Need to Learn</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              A comprehensive platform designed for authentic Islamic learning
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group p-8 rounded-2xl border border-gray-100 hover:border-emerald-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white"
              >
                <div className="w-14 h-14 bg-emerald-50 group-hover:bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 mb-5 transition-colors">
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4"
          >
            <div>
              <span className="text-emerald-600 text-sm font-semibold uppercase tracking-widest">Popular</span>
              <h2 className="text-4xl font-bold text-gray-900 mt-1">Featured Courses</h2>
            </div>
            <button
              onClick={() => navigate("/courses")}
              className="inline-flex items-center gap-2 text-emerald-600 font-semibold hover:text-emerald-700 transition-colors"
            >
              View All <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[0, 1, 2].map((i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow animate-pulse">
                  <div className="aspect-video bg-gray-200" />
                  <div className="p-6 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-6 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCourses.map((course, i) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => navigate(`/courses/${course.id}`)}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-emerald-100"
                >
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={course.image_url}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <span className="absolute bottom-3 left-3 px-3 py-1 bg-emerald-600 text-white text-xs font-semibold rounded-full">
                      {getCategoryLabel(course.category)}
                    </span>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getLevelColor(course.level)}`}>
                        {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                      </span>
                      <span className="text-xs text-gray-400">{course.lessons_count} lessons · {course.duration_hours}h</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-emerald-700 transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-4">{course.description}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <span className="text-sm text-gray-500">By {course.instructor}</span>
                      <ArrowRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <span className="text-emerald-600 text-sm font-semibold uppercase tracking-widest">Testimonials</span>
            <h2 className="text-4xl font-bold text-gray-900 mt-2">What Our Students Say</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-gray-50 rounded-2xl p-8 border border-gray-100"
              >
                <Quote className="w-8 h-8 text-emerald-200 mb-4" />
                <p className="text-gray-700 leading-relaxed mb-6 text-sm">{t.text}</p>
                <div className="flex items-center gap-3">
                  <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-emerald-600 to-teal-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-5">
              Begin Your Learning Journey Today
            </h2>
            <p className="text-emerald-100 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              Join thousands of students mastering Arabic and Quran with our comprehensive, expert-led courses.
            </p>
            <button
              onClick={() => navigate("/register")}
              className="inline-flex items-center gap-2 px-10 py-4 bg-white text-emerald-700 font-bold rounded-lg hover:bg-emerald-50 transition-colors shadow-xl text-lg"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">AMDAAD²</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
                A comprehensive platform for learning Arabic language, Quran memorization,
                and Tajweed. Study with qualified instructors at your own pace.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm uppercase tracking-wider text-gray-300 mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><button onClick={() => navigate("/courses")} className="hover:text-white transition-colors">All Courses</button></li>
                <li><button onClick={() => navigate("/register")} className="hover:text-white transition-colors">Sign Up</button></li>
                <li><button onClick={() => navigate("/login")} className="hover:text-white transition-colors">Sign In</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm uppercase tracking-wider text-gray-300 mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li>support@amdaad2.com</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-xs text-gray-600">
            © 2025 AMDAAD². All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
