import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Clock, Award, TrendingUp, ChevronRight, LogOut } from "lucide-react";
import { supabase } from "../lib/supabase";

const DashboardPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [recentProgress, setRecentProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/login');
      return;
    }
    setUser(user);
    await fetchUserData(user);
  };

  const fetchUserData = async (user) => {
    try {
      // Fetch user progress
      const { data: progress, error: progressError } = await supabase
        .from('user_progress')
        .select(`
          *,
          lessons (
            id,
            title,
            course_id,
            order,
            duration_minutes,
            courses (
              id,
              title,
              category
            )
          )
        `)
        .eq('user_id', user.id)
        .eq('completed', true)
        .order('completed_at', { ascending: false })
        .limit(10);

      if (progressError) throw progressError;

      setRecentProgress(progress || []);

      // Calculate unique courses
      const uniqueCourses = [...new Set(progress?.map(p => p.lessons?.courses?.id))].slice(0, 3);

      if (uniqueCourses.length > 0) {
        const { data: courses, error: coursesError } = await supabase
          .from('courses')
          .select('*')
          .in('id', uniqueCourses);

        if (coursesError) throw coursesError;
        setEnrolledCourses(courses || []);
      }

      // Fetch all course IDs for progress calculation
      const { data: allProgress } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('completed', true);

      // Calculate stats
      const totalLessonsCompleted = allProgress?.length || 0;
      const totalHours = Math.floor(totalLessonsCompleted * 30 / 60); // Assume avg 30 min per lesson

      setProfile({
        name: user.user_metadata?.full_name || user.email?.split('@')[0],
        email: user.email,
        lessonsCompleted: totalLessonsCompleted,
        hoursLearned: totalHours,
        coursesInProgress: uniqueCourses.length
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white pt-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back, {profile?.name}!</p>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Lessons Completed</p>
                <p className="text-2xl font-bold text-gray-900">{profile?.lessonsCompleted || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Hours Learned</p>
                <p className="text-2xl font-bold text-gray-900">{profile?.hoursLearned || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Courses In Progress</p>
                <p className="text-2xl font-bold text-gray-900">{profile?.coursesInProgress || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Courses Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">My Courses</h2>
            <button
              onClick={() => navigate('/courses')}
              className="text-emerald-600 font-semibold hover:underline flex items-center gap-1"
            >
              Browse All Courses
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {enrolledCourses.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Start Your Learning Journey</h3>
              <p className="text-gray-600 mb-6">You haven't started any courses yet. Explore our courses and begin learning!</p>
              <button
                onClick={() => navigate('/courses')}
                className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold"
              >
                Explore Courses
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {enrolledCourses.map((course) => (
                <div
                  key={course.id}
                  onClick={() => navigate(`/courses/${course.id}`)}
                  className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
                >
                  <div className="aspect-video relative">
                    <img
                      src={course.image_url}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{course.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{course.description}</p>
                    <button
                      className="mt-4 text-emerald-600 font-semibold text-sm flex items-center gap-1"
                    >
                      Continue Learning
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        {recentProgress.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
            <div className="bg-white rounded-xl shadow-md">
              <div className="divide-y divide-gray-100">
                {recentProgress.map((progress) => (
                  <div
                    key={progress.id}
                    onClick={() => navigate(`/lessons/${progress.lesson_id}`)}
                    className="p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Award className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div className="flex-grow">
                      <p className="font-semibold text-gray-900">{progress.lessons?.title}</p>
                      <p className="text-sm text-gray-600">{progress.lessons?.courses?.title}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Completed</p>
                      <p className="text-sm text-gray-600">
                        {new Date(progress.completed_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
