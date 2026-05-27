import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, CircleCheck as CheckCircle, Clock } from "lucide-react";
import { supabase } from "../lib/supabase";
import ReactMarkdown from 'react-markdown';

const LessonPage = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [course, setCourse] = useState(null);
  const [allLessons, setAllLessons] = useState([]);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
    fetchLessonData();
  }, [lessonId]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchLessonData = async () => {
    try {
      const { data: lessonData, error: lessonError } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonId)
        .single();

      if (lessonError) throw lessonError;

      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', lessonData.course_id)
        .single();

      if (courseError) throw courseError;

      const { data: allLessonsData, error: allLessonsError } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', lessonData.course_id)
        .order('order', { ascending: true });

      if (allLessonsError) throw allLessonsError;

      setLesson(lessonData);
      setCourse(courseData);
      setAllLessons(allLessonsData || []);
      setCurrentLessonIndex(allLessonsData.findIndex(l => l.id === lessonId));

      // Check if user has completed this lesson
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: progress } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('lesson_id', lessonId)
          .single();

        setIsCompleted(progress?.completed || false);
      }
    } catch (error) {
      console.error('Error fetching lesson data:', error);
      navigate('/courses');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const { error } = await supabase
        .from('user_progress')
        .upsert(
          {
            user_id: user.id,
            lesson_id: lessonId,
            completed: true,
            completed_at: new Date().toISOString()
          },
          { on_conflict: ['user_id,lesson_id'] }
        );

      if (error) throw error;
      setIsCompleted(true);
    } catch (error) {
      console.error('Error marking lesson complete:', error);
    }
  };

  const goToNextLesson = () => {
    if (currentLessonIndex < allLessons.length - 1) {
      navigate(`/lessons/${allLessons[currentLessonIndex + 1].id}`);
    }
  };

  const goToPreviousLesson = () => {
    if (currentLessonIndex > 0) {
      navigate(`/lessons/${allLessons[currentLessonIndex - 1].id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!lesson || !course) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 flex justify-center items-center">
        <p className="text-gray-500">Lesson not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Breadcrumb */}
            <div className="mb-6 flex items-center gap-2 text-sm text-gray-600">
              <button
                onClick={() => navigate('/courses')}
                className="hover:text-emerald-600 transition-colors"
              >
                Courses
              </button>
              <ChevronRight className="w-4 h-4" />
              <button
                onClick={() => navigate(`/courses/${course.id}`)}
                className="hover:text-emerald-600 transition-colors"
              >
                {course.title}
              </button>
              <ChevronRight className="w-4 h-4" />
              <span className="text-gray-900 font-medium">{lesson.title}</span>
            </div>

            {/* Lesson Header */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
              {lesson.video_url && (
                <div className="aspect-video bg-gray-900 flex items-center justify-center">
                  <div className="text-white text-center p-8">
                    <p className="text-sm uppercase tracking-wider mb-2">Video Content</p>
                    <p className="text-lg">Video: {lesson.title}</p>
                  </div>
                </div>
              )}

              <div className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-medium rounded-full">
                        Lesson {lesson.order}
                      </span>
                      {lesson.duration_minutes && (
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          <span>{lesson.duration_minutes} minutes</span>
                        </div>
                      )}
                      {isCompleted && (
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-medium rounded-full flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          Completed
                        </span>
                      )}
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{lesson.title}</h1>
                    {lesson.title_ar && (
                      <p className="text-xl text-gray-600 mb-2">{lesson.title_ar}</p>
                    )}
                    {lesson.description && (
                      <p className="text-gray-600">{lesson.description}</p>
                    )}
                  </div>
                </div>

                {/* Mark Complete Button */}
                <div className="mb-8">
                  <button
                    onClick={handleMarkComplete}
                    disabled={isCompleted}
                    className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 ${
                      isCompleted
                        ? 'bg-emerald-100 text-emerald-700 cursor-not-allowed'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700'
                    }`}
                  >
                    {isCompleted ? (
                      <span className="flex items-center justify-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        Lesson Completed
                      </span>
                    ) : (
                      'Mark as Complete'
                    )}
                  </button>
                </div>

                {/* Lesson Content */}
                {lesson.content && (
                  <div className="prose prose-emerald max-w-none">
                    <ReactMarkdown>{lesson.content}</ReactMarkdown>
                  </div>
                )}

                {/* Arabic Content */}
                {lesson.content_ar && (
                  <div className="mt-8 p-6 bg-emerald-50 rounded-lg border border-emerald-200" dir="rtl">
                    <div className="prose prose-emerald max-w-none text-right">
                      <ReactMarkdown>{lesson.content_ar}</ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex gap-4">
              <button
                onClick={goToPreviousLesson}
                disabled={currentLessonIndex === 0}
                className={`flex-1 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  currentLessonIndex === 0
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white border border-gray-300 text-gray-700 hover:border-emerald-600 hover:text-emerald-600'
                }`}
              >
                <ChevronLeft className="w-5 h-5 inline mr-2" />
                Previous Lesson
              </button>

              <button
                onClick={goToNextLesson}
                disabled={currentLessonIndex === allLessons.length - 1}
                className={`flex-1 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  currentLessonIndex === allLessons.length - 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}
              >
                Next Lesson
                <ChevronRight className="w-5 h-5 inline ml-2" />
              </button>
            </div>
          </div>

          {/* Sidebar - Lesson List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Course Content</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {allLessons.map((l, idx) => {
                  const isActive = l.id === lessonId;

                  return (
                    <button
                      key={l.id}
                      onClick={() => navigate(`/lessons/${l.id}`)}
                      className={`w-full text-left p-3 rounded-lg transition-all duration-200 flex items-start gap-3 ${
                        isActive
                          ? 'bg-emerald-100 border-l-4 border-emerald-600 text-emerald-900'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div className="flex-shrink-0 mt-1">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          isActive ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'
                        }`}>
                          {l.order}
                        </div>
                      </div>
                      <div className="flex-grow min-w-0">
                        <p className={`text-sm font-medium truncate ${
                          isActive ? 'text-emerald-900' : 'text-gray-700'
                        }`}>
                          {l.title}
                        </p>
                        {l.duration_minutes && (
                          <p className="text-xs text-gray-500 mt-1">
                            {l.duration_minutes} min
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonPage;
