import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { BookOpen, Users, Award, Star, ChevronRight, Globe } from "lucide-react";
import { supabase } from "../lib/supabase";

const LandingPage = () => {
  const navigate = useNavigate();
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedCourses();
  }, []);

  const fetchFeaturedCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      setFeaturedCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryLabel = (category) => {
    const labels = {
      'arabic': 'Arabic Language',
      'quran': 'Quran Studies',
      'tajweed': 'Tajweed'
    };
    return labels[category] || category;
  };

  const getLevelLabel = (level) => {
    const labels = {
      'beginner': 'Beginner',
      'intermediate': 'Intermediate',
      'advanced': 'Advanced'
    };
    return labels[level] || level;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/80 border-b border-emerald-100"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div
            className="cursor-pointer flex items-center gap-3"
            onClick={() => navigate("/")}
            data-testid="logo"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">AMDAAD²</h1>
              <p className="text-xs text-emerald-600 -mt-1">Learn Arabic & Quran</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/courses")}
              className="text-gray-700 hover:text-emerald-600 transition-colors font-medium"
            >
              Courses
            </button>
            <button
              onClick={() => navigate("/login")}
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold"
            >
              Sign In
            </button>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-24 overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 rounded-full mb-6">
                <Star className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-700">Begin Your Journey</span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight" data-testid="hero-title">
                Master Arabic
                <br />
                <span className="text-emerald-600">& Quran</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-xl" data-testid="hero-description">
                Embark on a transformative learning journey with expert-led courses
                in Arabic language, Quran memorization, and Tajweed.
                Study at your own pace with structured lessons.
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => navigate("/courses")}
                  data-testid="hero-cta-button"
                  className="px-8 py-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl"
                >
                  Explore Courses
                  <ChevronRight className="w-5 h-5 inline ml-2" />
                </button>
                <button
                  onClick={() => navigate("/register")}
                  className="px-8 py-4 bg-white text-emerald-600 rounded-lg hover:bg-emerald-50 transition-all duration-300 font-semibold text-lg border-2 border-emerald-600"
                >
                  Get Started Free
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
              className="hidden lg:block"
            >
              <div className="bg-white rounded-2xl shadow-2xl p-8 border border-emerald-100">
                <img
                  src="https://images.unsplash.com/photo-1585036156165-8a3bf38b03e1?w=800&h=600&fit=crop"
                  alt="Arabic Calligraphy"
                  className="w-full h-auto rounded-lg"
                />
                <div className="mt-6 flex items-center justify-between">
                  <div>
                    <p className="text-gray-600">Join thousands of learners</p>
                    <p className="text-2xl font-bold text-gray-900">5,000+ Students</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-600">Expert instructors</p>
                    <p className="text-2xl font-bold text-gray-900">20+ Teachers</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white" data-testid="features-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Why Choose AMDAAD²?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              A comprehensive platform designed for authentic Islamic learning
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <BookOpen className="w-8 h-8" />,
                title: "Structured Curriculum",
                description: "Progressive courses designed by qualified scholars and educators.",
                testId: "feature-structured"
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: "Expert Instructors",
                description: "Learn from certified teachers with years of experience.",
                testId: "feature-expert"
              },
              {
                icon: <Award className="w-8 h-8" />,
                title: "Track Progress",
                description: "Monitor your advancement with detailed progress tracking.",
                testId: "feature-progress"
              },
              {
                icon: <Star className="w-8 h-8" />,
                title: "Quality Content",
                description: "HD video lessons with comprehensive study materials.",
                testId: "feature-quality"
              }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                data-testid={feature.testId}
                className="bg-gradient-to-br from-emerald-50 to-white p-8 rounded-xl border border-emerald-100 hover:border-emerald-300 transition-all duration-300 hover:shadow-lg"
              >
                <div className="w-16 h-16 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white" data-testid="courses-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Featured Courses
            </h2>
            <p className="text-xl text-gray-600">
              Start learning with our most popular courses
            </p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredCourses.map((course, idx) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
                  onClick={() => navigate(`/courses/${course.id}`)}
                >
                  <div className="aspect-video relative">
                    <img
                      src={course.image_url}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-emerald-600 text-white text-sm font-semibold rounded-full">
                        {getCategoryLabel(course.category)}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                      <span className="px-2 py-1 bg-gray-100 rounded">{getLevelLabel(course.level)}</span>
                      <span>•</span>
                      <span>{course.lessons_count} lessons</span>
                      <span>•</span>
                      <span>{course.duration_hours}h</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{course.description}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <p className="text-sm text-gray-600">By {course.instructor}</p>
                      <ChevronRight className="w-5 h-5 text-emerald-600" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <button
              onClick={() => navigate("/courses")}
              className="px-8 py-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all duration-300 font-semibold text-lg"
            >
              View All Courses
              <ChevronRight className="w-5 h-5 inline ml-2" />
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-emerald-600 to-teal-600" data-testid="cta-section">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Begin Your Learning Journey Today
            </h2>
            <p className="text-xl text-emerald-50 mb-10 max-w-2xl mx-auto">
              Join thousands of students who are mastering Arabic and Quran
              with our comprehensive courses.
            </p>
            <button
              onClick={() => navigate("/register")}
              data-testid="cta-button"
              className="px-12 py-5 bg-white text-emerald-600 rounded-lg hover:bg-gray-100 transition-all duration-300 font-bold text-lg shadow-xl"
            >
              Get Started Now
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12" data-testid="footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">AMDAAD²</h3>
                  <p className="text-sm text-gray-400">Learn Arabic & Quran</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed max-w-md">
                A comprehensive platform for learning Arabic language, Quran memorization,
                and Tajweed. Study with qualified instructors at your own pace.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="/courses" className="hover:text-white transition-colors">All Courses</a></li>
                <li><a href="/about" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>support@amdaad2.com</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>© 2025 AMDAAD². All rights reserved. Made with Emergent</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
