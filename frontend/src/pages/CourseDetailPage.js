import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { Clock, BookOpen, CirclePlay as PlayCircle, CircleCheck as CheckCircle2, Circle } from "lucide-react";
import { supabase } from "../lib/supabase";

const CourseDetailPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [userProgress, setUserProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkUser();
    fetchCourseData();
  }, [courseId]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (user) {
      fetchUserProgress(user.id);
    }
  };

  const fetchCourseData = async () => {
    try {
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (courseError) throw courseError;

      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseId)
        .order('order', { ascending: true });

      if (lessonsError) throw lessonsError;

      setCourse(courseData);
      setLessons(lessonsData || []);
    } catch (error) {
      console.error('Error fetching course data:', error);
      navigate('/courses');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProgress = async (userId) => {
    if (!lessons.length) return;

    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .in('lesson_id', lessons.map(l => l.id));

      if (error) throw error;
      setUserProgress(data || []);
    } catch (error) {
      console.error('Error fetching user progress:', error);
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

  const isLessonCompleted = (lessonId) => {
    return userProgress.some(p => p.lesson_id === lessonId && p.completed);
  };

  const handleStartCourse = () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (lessons.length > 0) {
      navigate(`/lessons/${lessons[0].id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-24 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-white pt-24 flex justify-center items-center">
        <p className="text-gray-500">Course not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-24">
      {/* Course Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="px-3 py-1 bg-emerald-500 text-white text-sm font-semibold rounded-full mb-4 inline-block">
                  {getCategoryLabel(course.category)}
                </span>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">{course.title}</h1>
                {course.title_ar && (
                  <p className="text-2xl text-emerald-100 mb-4">{course.title_ar}</p>
                )}
                <p className="text-lg text-emerald-50 mb-6">{course.description}</p>

                <div className="flex flex-wrap gap-6 mb-8">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    <span>{course.duration_hours} hours</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    <span>{course.lessons_count} lessons</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-white/20 rounded">{getLevelLabel(course.level)}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-emerald-100">Instructor</p>
                  <p className="text-lg font-semibold">{course.instructor}</p>
                </div>

                <button
                  onClick={handleStartCourse}
                  className="px-8 py-4 bg-white text-emerald-600 rounded-lg hover:bg-emerald-50 transition-all duration-300 font-bold text-lg shadow-lg"
                >
                  {user ? 'Start Learning' : 'Sign In to Start'}
                </button>
              </motion.div>
            </div>

            <div className="hidden lg:block">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6"
              >
                <img
                  src={course.image_url}
                  alt={course.title}
                  className="w-full h-auto rounded-lg mb-4"
                />
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-emerald-100">Duration</span>
                    <span className="font-semibold">{course.duration_hours}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-emerald-100">Lessons</span>
                    <span className="font-semibold">{course.lessons_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-emerald-100">Level</span>
                    <span className="font-semibold">{getLevelLabel(course.level)}</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Course Content</h2>

          <div className="space-y-3">
            {lessons.map((lesson, idx) => {
              const isCompleted = isLessonCompleted(lesson.id);

              return (
                <div
                  key={lesson.id}
                  onClick={() => user && navigate(`/lessons/${lesson.id}`)}
                  className={`bg-white border rounded-lg p-6 cursor-pointer transition-all duration-300 ${
                    isCompleted
                      ? 'border-emerald-300 bg-emerald-50'
                      : 'border-gray-200 hover:border-emerald-300 hover:shadow-md'
                  } ${!user && 'opacity-60'}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {isCompleted ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                      ) : (
                        <Circle className="w-6 h-6 text-gray-300" />
                      )}
                    </div>

                    <div className="flex-grow">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-gray-500">
                              Lesson {lesson.order}
                            </span>
                            {lesson.duration_minutes && (
                              <>
                                <span className="text-gray-300">•</span>
                                <div className="flex items-center gap-1 text-sm text-gray-500">
                                  <Clock className="w-4 h-4" />
                                  <span>{lesson.duration_minutes} min</span>
                                </div>
                              </>
                            )}
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {lesson.title}
                          </h3>
                          {lesson.title_ar && (
                            <p className="text-sm text-gray-600 mt-1">{lesson.title_ar}</p>
                          )}
                          {lesson.description && (
                            <p className="text-sm text-gray-500 mt-2">{lesson.description}</p>
                          )}
                        </div>

                        <PlayCircle className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CourseDetailPage;
