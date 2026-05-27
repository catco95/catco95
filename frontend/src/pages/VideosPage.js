import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Play, Clock, BookOpen, Search } from "lucide-react";
import { supabase } from "../lib/supabase";
import Navbar from "../components/Navbar";

const CATEGORIES = ["All", "Arabic", "Quran", "Tajweed"];

const VideosPage = () => {
  const navigate = useNavigate();
  const [lessons, setLessons] = useState([]);
  const [courses, setCourses] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    const fetchData = async () => {
      const [{ data: lessonData }, { data: courseData }] = await Promise.all([
        supabase.from("lessons").select("*").not("video_url", "is", null).order("order", { ascending: true }),
        supabase.from("courses").select("*"),
      ]);

      const courseMap = {};
      (courseData || []).forEach((c) => { courseMap[c.id] = c; });
      setCourses(courseMap);
      setLessons(lessonData || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const filtered = lessons.filter((l) => {
    const course = courses[l.course_id];
    const matchesSearch =
      !search ||
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      (course?.title || "").toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      category === "All" || (course?.category || "").toLowerCase() === category.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      <div className="pt-16">
        {/* Header */}
        <div className="bg-gradient-to-b from-gray-900 to-gray-950 border-b border-white/5 px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-6xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Video Lessons</h1>
              <p className="text-white/50 text-base mb-8">Watch and learn at your own pace</p>

              {/* Search */}
              <div className="relative max-w-md mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="text"
                  placeholder="Search lessons or courses..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-white/30 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
              </div>

              {/* Category filters */}
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                      category === cat
                        ? "bg-emerald-600 text-white"
                        : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Grid */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-white/30">
              <BookOpen className="w-12 h-12 mx-auto mb-3" />
              <p>No videos found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((lesson, i) => {
                const course = courses[lesson.course_id];
                const thumb = getYoutubeThumbnail(lesson.video_url);
                return (
                  <motion.div
                    key={lesson.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => navigate(`/videos/${lesson.id}`)}
                    className="group cursor-pointer bg-gray-900 rounded-2xl overflow-hidden border border-white/5 hover:border-emerald-500/30 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-900/20"
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-video bg-gray-800 overflow-hidden">
                      {thumb ? (
                        <img src={thumb} alt={lesson.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                          <Play className="w-10 h-10 text-white/20" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-14 h-14 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center">
                          <Play className="w-6 h-6 text-white ml-0.5" />
                        </div>
                      </div>
                      {lesson.duration_minutes && (
                        <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                          {lesson.duration_minutes}m
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      {course && (
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-500/15 text-emerald-400 rounded-full border border-emerald-500/20">
                            {course.category}
                          </span>
                          <span className="text-xs text-white/30 truncate">{course.title}</span>
                        </div>
                      )}
                      <h3 className="text-sm font-semibold text-white leading-snug group-hover:text-emerald-400 transition-colors line-clamp-2">
                        {lesson.title}
                      </h3>
                      {lesson.title_ar && (
                        <p className="text-xs text-white/30 mt-1" dir="rtl">{lesson.title_ar}</p>
                      )}
                      {lesson.description && (
                        <p className="text-xs text-white/40 mt-2 line-clamp-2 leading-relaxed">{lesson.description}</p>
                      )}
                      <div className="flex items-center gap-1 mt-3 text-xs text-white/30">
                        <Clock className="w-3 h-3" />
                        <span>Lesson {lesson.order}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function getYoutubeThumbnail(url) {
  if (!url) return null;
  const regExp = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
  const match = url.match(regExp);
  return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : null;
}

export default VideosPage;
