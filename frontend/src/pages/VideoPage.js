import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Play, Pause, Volume2, VolumeX, Maximize, ArrowLeft,
  CircleCheck as CheckCircle, Clock, ChevronLeft, ChevronRight, SkipBack, SkipForward
} from "lucide-react";
import { supabase } from "../lib/supabase";
import Navbar from "../components/Navbar";

const VideoPage = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);

  const [lesson, setLesson] = useState(null);
  const [course, setCourse] = useState(null);
  const [allLessons, setAllLessons] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completedIds, setCompletedIds] = useState(new Set());
  const [isCompleted, setIsCompleted] = useState(false);
  const [marking, setMarking] = useState(false);

  // Video player state
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const controlsTimer = useRef(null);

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
        const { data: progressData } = await supabase
          .from("user_progress").select("*")
          .eq("user_id", currentUser.id)
          .in("lesson_id", (siblingsData || []).map((l) => l.id));
        const doneIds = new Set((progressData || []).filter((p) => p.completed).map((p) => p.lesson_id));
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
    if (next) navigate(`/videos/${next.id}`);
  };

  // Video controls
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (playing) { videoRef.current.pause(); } else { videoRef.current.play(); }
    setPlaying(!playing);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !muted;
    setMuted(!muted);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const t = videoRef.current.currentTime;
    const d = videoRef.current.duration || 1;
    setCurrentTime(t);
    setProgress((t / d) * 100);
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) setDuration(videoRef.current.duration);
  };

  const handleSeek = (e) => {
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = ratio * (videoRef.current.duration || 0);
  };

  const handleSkip = (secs) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, Math.min(videoRef.current.currentTime + secs, videoRef.current.duration));
  };

  const handleFullscreen = () => {
    if (videoRef.current) videoRef.current.requestFullscreen?.();
  };

  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(controlsTimer.current);
    if (playing) {
      controlsTimer.current = setTimeout(() => setShowControls(false), 3000);
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const completedCount = allLessons.filter((l) => completedIds.has(l.id)).length;
  const progressPct = allLessons.length ? Math.round((completedCount / allLessons.length) * 100) : 0;
  const videoLessons = allLessons.filter((l) => l.video_url);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Navbar />
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500" />
        </div>
      </div>
    );
  }

  if (!lesson || !course) return null;

  const embedUrl = lesson.video_url
    ? lesson.video_url.includes("youtube.com") || lesson.video_url.includes("youtu.be")
      ? `https://www.youtube.com/embed/${extractYoutubeId(lesson.video_url)}?autoplay=0&rel=0`
      : null
    : null;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />

      <div className="pt-16 flex flex-col lg:flex-row min-h-screen">
        {/* Main video area */}
        <main className="flex-1 flex flex-col">
          {/* Video player */}
          <div
            className="relative bg-black w-full"
            style={{ aspectRatio: "16/9", maxHeight: "calc(100vh - 64px - 80px)" }}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => playing && setShowControls(false)}
          >
            {embedUrl ? (
              <iframe
                src={embedUrl}
                className="w-full h-full"
                allowFullScreen
                title={lesson.title}
              />
            ) : lesson.video_url ? (
              <>
                <video
                  ref={videoRef}
                  src={lesson.video_url}
                  className="w-full h-full object-contain"
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onEnded={() => setPlaying(false)}
                  onClick={togglePlay}
                />

                {/* Custom controls overlay */}
                <motion.div
                  animate={{ opacity: showControls ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent px-4 pt-10 pb-4"
                >
                  {/* Progress bar */}
                  <div
                    className="w-full h-1.5 bg-white/20 rounded-full mb-4 cursor-pointer group"
                    onClick={handleSeek}
                  >
                    <div
                      className="h-full bg-emerald-500 rounded-full relative transition-all"
                      style={{ width: `${progress}%` }}
                    >
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button onClick={() => handleSkip(-10)} className="text-white/80 hover:text-white transition-colors">
                      <SkipBack className="w-5 h-5" />
                    </button>
                    <button
                      onClick={togglePlay}
                      className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-900 hover:scale-105 transition-transform shadow-lg"
                    >
                      {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                    </button>
                    <button onClick={() => handleSkip(10)} className="text-white/80 hover:text-white transition-colors">
                      <SkipForward className="w-5 h-5" />
                    </button>
                    <button onClick={toggleMute} className="text-white/80 hover:text-white transition-colors">
                      {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                    <span className="text-xs text-white/70 flex-1">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                    <button onClick={handleFullscreen} className="text-white/80 hover:text-white transition-colors">
                      <Maximize className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>

                {/* Play button overlay when paused */}
                {!playing && (
                  <button
                    onClick={togglePlay}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div className="w-20 h-20 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center hover:bg-white/20 transition-all hover:scale-105">
                      <Play className="w-8 h-8 text-white ml-1" />
                    </div>
                  </button>
                )}
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-white/40 gap-4">
                <Play className="w-16 h-16" />
                <p className="text-sm">No video available for this lesson</p>
              </div>
            )}
          </div>

          {/* Lesson info bar */}
          <div className="bg-gray-900 border-t border-white/5 px-4 sm:px-6 py-4 flex flex-wrap items-center gap-4">
            <button
              onClick={() => navigate(`/courses/${course.id}`)}
              className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> {course.title}
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-base font-bold text-white truncate">{lesson.title}</h1>
              {lesson.title_ar && <p className="text-sm text-white/50">{lesson.title_ar}</p>}
              }
            </div>
            {lesson.duration_minutes && (
              <span className="text-xs text-white/50 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {lesson.duration_minutes}m
              </span>
            )}
            {isCompleted ? (
              <div className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-lg flex items-center gap-1.5 border border-emerald-500/30">
                <CheckCircle className="w-3.5 h-3.5" /> Completed
              </div>
            ) : (
              <button
                onClick={handleMarkComplete}
                disabled={marking}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {marking ? (
                  <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <CheckCircle className="w-3.5 h-3.5" />
                )}
                Mark Complete
              </button>
            )}
          </div>

          {/* Description */}
          {lesson.description && (
            <div className="bg-gray-900 border-t border-white/5 px-4 sm:px-6 py-4">
              <p className="text-sm text-white/60 leading-relaxed">{lesson.description}</p>
            </div>
          )}

          {/* Prev / Next navigation */}
          <div className="bg-gray-900 border-t border-white/5 px-4 sm:px-6 py-4 flex gap-3 mt-auto">
            <button
              onClick={() => goTo(-1)}
              disabled={currentIndex === 0}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed border border-white/10 text-white/70 hover:border-white/30 hover:text-white"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <button
              onClick={() => goTo(1)}
              disabled={currentIndex === allLessons.length - 1}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </main>

        {/* Sidebar */}
        <aside className="lg:w-80 xl:w-96 bg-gray-900 border-l border-white/5 flex-shrink-0 lg:h-[calc(100vh-64px)] lg:sticky lg:top-16 overflow-y-auto order-first lg:order-last">
          <div className="p-5 border-b border-white/5">
            <h2 className="font-bold text-white text-base mb-1">{course.title}</h2>
            <p className="text-xs text-white/40 mb-3">{allLessons.length} lessons</p>
            <div className="flex justify-between text-xs text-white/40 mb-1.5">
              <span>{completedCount} of {allLessons.length} completed</span>
              <span>{progressPct}%</span>
            </div>
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          <div className="p-3">
            {allLessons.map((l) => {
              const active = l.id === lessonId;
              const done = completedIds.has(l.id);
              const hasVideo = !!l.video_url;
              return (
                <button
                  key={l.id}
                  onClick={() => navigate(`/videos/${l.id}`)}
                  className={`w-full text-left px-3 py-3 rounded-lg mb-1 flex items-center gap-3 transition-all ${
                    active
                      ? "bg-emerald-600/20 border border-emerald-500/30"
                      : "hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                    done ? "bg-emerald-500 text-white" : active ? "bg-emerald-500/20 text-emerald-400" : "bg-white/10 text-white/40"
                  }`}>
                    {done ? <CheckCircle className="w-4 h-4" /> : hasVideo ? <Play className="w-3.5 h-3.5 ml-0.5" /> : l.order}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-medium truncate ${active ? "text-white" : "text-white/70"}`}>
                      {l.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {l.duration_minutes && (
                        <span className="text-xs text-white/30 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {l.duration_minutes}m
                        </span>
                      )}
                      {!hasVideo && (
                        <span className="text-xs text-white/20">Text only</span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
};

function extractYoutubeId(url) {
  const regExp = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
  const match = url.match(regExp);
  return match ? match[1] : "";
}

export default VideoPage;
