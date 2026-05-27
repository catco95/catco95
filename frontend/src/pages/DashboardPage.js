import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Clock, TrendingUp, ChevronRight, Award, ArrowRight } from "lucide-react";
import { supabase } from "../lib/supabase";
import Navbar from "../components/Navbar";

const StatCard = ({ icon, label, value, color }) => (
  <div className="bg-white rounded-2xl border border-gray-100 p-6 flex items-center gap-4 shadow-sm">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
    </div>
  </div>
);

const DashboardPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [recentProgress, setRecentProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/login"); return; }
      setUser(user);
      await fetchUserData(user);
    };
    init();
  }, []);

  const fetchUserData = async (user) => {
    try {
      const { data: allProgress } = await supabase
        .from("user_progress")
        .select(`*, lessons(id, title, course_id, order, duration_minutes, courses(id, title, category, image_url))`)
        .eq("user_id", user.id)
        .eq("completed", true)
        .order("completed_at", { ascending: false });

      const progress = allProgress || [];
      setRecentProgress(progress.slice(0, 8));

      const courseMap = {};
      progress.forEach((p) => {
        const c = p.lessons?.courses;
        if (c && !courseMap[c.id]) courseMap[c.id] = c;
      });
      setEnrolledCourses(Object.values(courseMap).slice(0, 6));

      const totalLessons = progress.length;
      const totalHours = Math.floor(totalLessons * 30 / 60);

      setProfile({
        name: user.user_metadata?.full_name || user.email?.split("@")[0],
        email: user.email,
        lessonsCompleted: totalLessons,
        hoursLearned: totalHours,
        coursesInProgress: Object.keys(courseMap).length,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center min-h-[80vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Page header */}
      <div className="bg-white border-b border-gray-100 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-sm text-emerald-600 font-semibold uppercase tracking-wider mb-1">Welcome back</p>
            <h1 className="text-3xl font-bold text-gray-900">{profile?.name}</h1>
            <p className="text-gray-500 mt-1">{profile?.email}</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          <StatCard
            icon={<BookOpen className="w-6 h-6 text-emerald-600" />}
            label="Lessons Completed"
            value={profile?.lessonsCompleted || 0}
            color="bg-emerald-50"
          />
          <StatCard
            icon={<Clock className="w-6 h-6 text-blue-600" />}
            label="Hours Learned"
            value={profile?.hoursLearned || 0}
            color="bg-blue-50"
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6 text-teal-600" />}
            label="Courses In Progress"
            value={profile?.coursesInProgress || 0}
            color="bg-teal-50"
          />
        </motion.div>

        {/* Courses section */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-gray-900">My Courses</h2>
            <button
              onClick={() => navigate("/courses")}
              className="text-sm text-emerald-600 font-semibold flex items-center gap-1 hover:text-emerald-700 transition-colors"
            >
              Browse All <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {enrolledCourses.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center shadow-sm">
              <BookOpen className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Start Your Learning Journey</h3>
              <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto">
                You haven't started any courses yet. Explore our courses and begin learning.
              </p>
              <button
                onClick={() => navigate("/courses")}
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold text-sm"
              >
                Explore Courses <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {enrolledCourses.map((course, i) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  onClick={() => navigate(`/courses/${course.id}`)}
                  className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md hover:border-emerald-100 cursor-pointer transition-all"
                >
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={course.image_url}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-gray-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
                      {course.title}
                    </h3>
                    <button className="mt-3 text-emerald-600 text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                      Continue Learning <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.section>

        {/* Recent Activity */}
        {recentProgress.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <h2 className="text-xl font-bold text-gray-900 mb-5">Recent Activity</h2>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
              {recentProgress.map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate(`/lessons/${item.lesson_id}`)}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Award className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{item.lessons?.title}</p>
                    <p className="text-xs text-gray-500 truncate">{item.lessons?.courses?.title}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">Completed</span>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(item.completed_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
