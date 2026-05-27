import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, CircleCheck as CheckCircle, Clock, BookOpen, ArrowLeft } from "lucide-react";
import { supabase } from "../lib/supabase";
import ReactMarkdown from "react-markdown";
import Navbar from "../components/Navbar";

const LessonPage = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [course, setCourse] = useState(null);
  const [allLessons, setAllLessons] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [completedIds, setCompletedIds] = useState(new Set());

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      await fetchData(user);
    };
    init();
  }, [lessonId]);

  const fetchData = async (currentUser) => {
    try {
      const { data: lessonData, error: lessonErr } = await supabase
        .from("lessons").select("*").eq("id", lessonId).single();
      if (lessonErr) throw lessonErr;

      const [{ data: courseData }, { data: siblingsData }] = await Promise.all([
        supabase.from("courses").select("*").eq("id", lessonData.course_id).single(),
        supabase.from("lessons").select("*").eq("course_id", lessonData.course_id).order("order", { ascending: true }),
      ]);

      setLesson(lessonData);
      setCourse(courseData);
      setAllLessons(siblingsData || []);
      setCurrentIndex((siblingsData || []).findIndex((l) => l.id === lessonId));

      if (currentUser) {
        const { data: progress } = await supabase
          .from("user_progress").select("*")
          .eq("user_id", currentUser.id)
          .in("lesson_id", (siblingsData || []).map((l) => l.id));

        const doneIds = new Set((progress || []).filter((p) => p.completed).map((p) => p.lesson_id));
        setCompletedIds(doneIds);
        setIsCompleted(doneIds.has(lessonId));
      }
    } catch {
      navigate("/courses");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async () => {
    if (!user) { navigate("/login"); return; }
    setMarking(true);
    try {
      const { error } = await supabase.from("user_progress").upsert(
        { user_id: user.id, lesson_id: lessonId, completed: true, completed_at: new Date().toISOString() },
        { onConflict: "user_id,lesson_id" }
      );
      if (error) throw error;
      setIsCompleted(true);
      setCompletedIds((prev) => new Set([...prev, lessonId]));
    } catch (e) {
      console.error(e);
    } finally {
      setMarking(false);
    }
  };

  const goTo = (delta) => {
    const next = allLessons[currentIndex + delta];
    if (next) navigate(`/lessons/${next.id}`);
  };

  const completedCount = allLessons.filter((l) => completedIds.has(l.id)).length;
  const progressPct = allLessons.length ? Math.round((completedCount / allLessons.length) * 100) : 0;

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

  if (!lesson || !course) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-16 flex flex-col lg:flex-row min-h-screen">
        {/* Sidebar */}
        <aside className="lg:w-80 xl:w-96 bg-white border-r border-gray-100 flex-shrink-0 lg:h-[calc(100vh-64px)] lg:sticky lg:top-16 overflow-y-auto">
          <div className="p-5 border-b border-gray-100">
            <button
              onClick={() => navigate(`/courses/${course.id}`)}
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-emerald-600 transition-colors mb-3"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to course
            </button>
            <h2 className="font-bold text-gray-900 text-lg leading-tight">{course.title}</h2>
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                <span>{completedCount} of {allLessons.length} completed</span>
                <span>{progressPct}%</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>

          <div className="p-3">
            {allLessons.map((l) => {
              const active = l.id === lessonId;
              const done = completedIds.has(l.id);
              return (
                <button
                  key={l.id}
                  onClick={() => navigate(`/lessons/${l.id}`)}
                  className={`w-full text-left px-3 py-3 rounded-lg mb-1 flex items-center gap-3 transition-all ${
                    active ? "bg-emerald-50 border border-emerald-200" : "hover:bg-gray-50"
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                    done ? "bg-emerald-500 text-white" : active ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
                  }`}>
                    {done ? <CheckCircle className="w-3.5 h-3.5" /> : l.order}
                  </div>
                  <div className="min-w-0">
                    <p className={`text-sm font-medium truncate ${active ? "text-emerald-800" : "text-gray-700"}`}>
                      {l.title}
                    </p>
                    {l.duration_minutes && (
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" /> {l.duration_minutes}m
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>

              {/* Lesson meta */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="text-xs font-semibold px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                  Lesson {lesson.order}
                </span>
                {lesson.duration_minutes && (
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {lesson.duration_minutes} minutes
                  </span>
                )}
                {isCompleted && (
                  <span className="text-xs font-semibold px-3 py-1 bg-emerald-500 text-white rounded-full flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Completed
                  </span>
                )}
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-1">{lesson.title}</h1>
              {lesson.title_ar && <p className="text-xl text-gray-500 mb-4">{lesson.title_ar}</p>}
              }
              {lesson.description && <p className="text-gray-600 mb-6 leading-relaxed">{lesson.description}</p>}
              }

              {/* Video placeholder */}
              {lesson.video_url && (
                <div className="aspect-video bg-gray-900 rounded-xl overflow-hidden mb-8 flex items-center justify-center">
                  <div className="text-center text-white">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-300 text-sm">Video: {lesson.title}</p>
                  </div>
                </div>
              )}

              {/* Mark complete */}
              {!isCompleted ? (
                <button
                  onClick={handleMarkComplete}
                  disabled={marking}
                  className="w-full py-3.5 mb-8 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {marking ? (
                    <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Saving...</>
                  ) : (
                    <><CheckCircle className="w-5 h-5" /> Mark as Complete</>
                  )}
                </button>
              ) : (
                <div className="w-full py-3.5 mb-8 bg-emerald-50 text-emerald-700 font-semibold rounded-xl flex items-center justify-center gap-2 border border-emerald-200">
                  <CheckCircle className="w-5 h-5" /> Lesson Completed
                </div>
              )}

              {/* Content */}
              {lesson.content && (
                <div className="prose prose-emerald max-w-none mb-8 prose-headings:font-bold prose-p:text-gray-700 prose-p:leading-relaxed">
                  <ReactMarkdown>{lesson.content}</ReactMarkdown>
                </div>
              )}

              {/* Arabic content */}
              {lesson.content_ar && (
                <div className="p-6 bg-emerald-50 rounded-xl border border-emerald-200 mb-8" dir="rtl">
                  <div className="prose prose-emerald max-w-none text-right">
                    <ReactMarkdown>{lesson.content_ar}</ReactMarkdown>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex gap-3 pt-6 border-t border-gray-100">
                <button
                  onClick={() => goTo(-1)}
                  disabled={currentIndex === 0}
                  className={`flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                    currentIndex === 0
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white border border-gray-200 text-gray-700 hover:border-emerald-400 hover:text-emerald-600"
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>
                <button
                  onClick={() => goTo(1)}
                  disabled={currentIndex === allLessons.length - 1}
                  className={`flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                    currentIndex === allLessons.length - 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-emerald-600 text-white hover:bg-emerald-700"
                  }`}
                >
                  Next Lesson <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LessonPage;
