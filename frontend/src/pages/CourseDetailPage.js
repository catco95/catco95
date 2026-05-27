import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import {
  Clock, BookOpen, CirclePlay as PlayCircle,
  CircleCheck as CheckCircle2, Circle, ArrowLeft, Lock
} from "lucide-react";
import { supabase } from "../lib/supabase";
import Navbar from "../components/Navbar";

const CATEGORY_LABELS = { arabic: "Arabic Language", quran: "Quran Studies", tajweed: "Tajweed" };
const LEVEL_COLORS = {
  beginner: "bg-emerald-100 text-emerald-700",
  intermediate: "bg-amber-100 text-amber-700",
  advanced: "bg-rose-100 text-rose-700",
};

const CourseDetailPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [userProgress, setUserProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      await fetchCourseData(user);
    };
    init();
  }, [courseId]);

  const fetchCourseData = async (currentUser) => {
    try {
      const [{ data: courseData, error: courseError }, { data: lessonsData, error: lessonsError }] = await Promise.all([
        supabase.from("courses").select("*").eq("id", courseId).single(),
        supabase.from("lessons").select("*").eq("course_id", courseId).order("order", { ascending: true }),
      ]);
      if (courseError) throw courseError;
      if (lessonsError) throw lessonsError;
      setCourse(courseData);
      setLessons(lessonsData || []);

      if (currentUser && lessonsData?.length) {
        const { data: progress } = await supabase
          .from("user_progress")
          .select("*")
          .eq("user_id", currentUser.id)
          .in("lesson_id", lessonsData.map((l) => l.id));
        setUserProgress(progress || []);
      }
    } catch {
      navigate("/courses");
    } finally {
      setLoading(false);
    }
  };

  const isLessonCompleted = (id) => userProgress.some((p) => p.lesson_id === id && p.completed);

  const completedCount = lessons.filter((l) => isLessonCompleted(l.id)).length;
  const progressPct = lessons.length ? Math.round((completedCount / lessons.length) * 100) : 0;

  const handleStartCourse = () => {
    if (!user) { navigate("/login"); return; }
    if (lessons.length) {
      const firstIncomplete = lessons.find((l) => !isLessonCompleted(l.id));
      navigate(`/lessons/${(firstIncomplete || lessons[0]).id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600" />
        </div>
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero header */}
      <div className="bg-gradient-to-br from-gray-900 via-emerald-950 to-teal-900 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <button
            onClick={() => navigate("/courses")}
            className="inline-flex items-center gap-2 text-emerald-300 hover:text-white text-sm font-medium mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Courses
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-2"
            >
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${LEVEL_COLORS[course.level] || "bg-gray-100 text-gray-600"}`}>
                  {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                </span>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {CATEGORY_LABELS[course.category] || course.category}
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 leading-tight">{course.title}</h1>
              {course.title_ar && (
                <p className="text-2xl text-emerald-200 mb-4">{course.title_ar}</p>
              )}
              <p className="text-gray-300 text-lg leading-relaxed mb-6 max-w-2xl">{course.description}</p>

              <div className="flex flex-wrap gap-5 mb-6 text-gray-300 text-sm">
                <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> {course.duration_hours} hours</span>
                <span className="flex items-center gap-2"><BookOpen className="w-4 h-4" /> {course.lessons_count} lessons</span>
                <span className="flex items-center gap-2">Instructor: <strong className="text-white">{course.instructor}</strong></span>
              </div>

              {user && progressPct > 0 && (
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-300 mb-2">
                    <span>Your progress</span>
                    <span>{progressPct}% complete ({completedCount}/{lessons.length})</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPct}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full bg-emerald-400 rounded-full"
                    />
                  </div>
                </div>
              )}

              <button
                onClick={handleStartCourse}
                className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-lg transition-all duration-200 shadow-lg text-lg"
              >
                <PlayCircle className="w-5 h-5" />
                {user ? (completedCount > 0 ? "Continue Learning" : "Start Learning") : "Sign In to Start"}
              </button>
            </motion.div>

            {/* Course thumbnail */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="hidden lg:block"
            >
              <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                <img src={course.image_url} alt={course.title} className="w-full h-auto" />
                <div className="bg-white/10 backdrop-blur-sm p-5 space-y-3 text-sm text-gray-200">
                  <div className="flex justify-between"><span>Duration</span><span className="font-semibold text-white">{course.duration_hours}h</span></div>
                  <div className="flex justify-between"><span>Lessons</span><span className="font-semibold text-white">{course.lessons_count}</span></div>
                  <div className="flex justify-between"><span>Level</span><span className="font-semibold text-white capitalize">{course.level}</span></div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Lessons list */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Content</h2>
          <div className="space-y-2.5">
            {lessons.map((lesson) => {
              const completed = isLessonCompleted(lesson.id);
              const clickable = !!user;

              return (
                <div
                  key={lesson.id}
                  onClick={() => clickable && navigate(`/lessons/${lesson.id}`)}
                  className={`group bg-white rounded-xl border transition-all duration-200 p-5 flex items-center gap-4 ${
                    completed
                      ? "border-emerald-200 bg-emerald-50/50"
                      : clickable
                      ? "border-gray-100 hover:border-emerald-200 hover:shadow-md cursor-pointer"
                      : "border-gray-100 opacity-70 cursor-default"
                  }`}
                >
                  <div className="flex-shrink-0">
                    {completed ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                    ) : clickable ? (
                      <Circle className="w-6 h-6 text-gray-300 group-hover:text-emerald-400 transition-colors" />
                    ) : (
                      <Lock className="w-5 h-5 text-gray-300" />
                    )}
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs text-gray-400 font-medium">Lesson {lesson.order}</span>
                      {lesson.duration_minutes && (
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {lesson.duration_minutes} min
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors truncate">
                      {lesson.title}
                    </h3>
                    {lesson.title_ar && (
                      <p className="text-sm text-gray-500 mt-0.5">{lesson.title_ar}</p>
                    )}
                  </div>
                  {completed && (
                    <span className="flex-shrink-0 text-xs font-semibold text-emerald-600 bg-emerald-100 px-2.5 py-1 rounded-full">
                      Done
                    </span>
                  )}
                  {!completed && clickable && (
                    <PlayCircle className="flex-shrink-0 w-5 h-5 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
              );
            })}
          </div>

          {!user && (
            <div className="mt-6 text-center p-6 bg-emerald-50 rounded-xl border border-emerald-200">
              <p className="text-gray-700 font-medium mb-3">Sign in to access all lessons and track your progress</p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => navigate("/login")} className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors text-sm">Sign In</button>
                <button onClick={() => navigate("/register")} className="px-6 py-2.5 border border-emerald-600 text-emerald-600 rounded-lg font-semibold hover:bg-emerald-50 transition-colors text-sm">Register Free</button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default CourseDetailPage;
