/*
  # Create courses and lessons tables for Arabic & Quran learning platform

  1. New Tables
    - `courses`
      - `id` (uuid, primary key)
      - `title` (text)
      - `title_ar` (text, Arabic title)
      - `description` (text)
      - `description_ar` (text, Arabic description)
      - `category` (text: 'arabic' | 'quran' | 'tajweed')
      - `level` (text: 'beginner' | 'intermediate' | 'advanced')
      - `image_url` (text)
      - `instructor` (text)
      - `duration_hours` (integer)
      - `lessons_count` (integer)
      - `is_featured` (boolean)
      - `created_at` (timestamp)
    
    - `lessons`
      - `id` (uuid, primary key)
      - `course_id` (uuid, foreign key to courses)
      - `title` (text)
      - `title_ar` (text, Arabic title)
      - `description` (text)
      - `description_ar` (text, Arabic description)
      - `video_url` (text)
      - `content` (text, markdown content)
      - `content_ar` (text, Arabic markdown content)
      - `order` (integer, lesson order in course)
      - `duration_minutes` (integer)
      - `created_at` (timestamp)
    
    - `user_progress`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `lesson_id` (uuid, foreign key to lessons)
      - `completed` (boolean)
      - `completed_at` (timestamp)
      - `created_at` (timestamp)
  
  2. Security
    - Enable RLS on all tables
    - Courses: public read access
    - Lessons: public read access
    - User progress: authenticated users can only read/write their own progress
*/

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  title_ar text,
  description text,
  description_ar text,
  category text NOT NULL CHECK (category IN ('arabic', 'quran', 'tajweed')),
  level text NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  image_url text,
  instructor text,
  duration_hours integer DEFAULT 0,
  lessons_count integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create lessons table
CREATE TABLE IF NOT EXISTS lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  title_ar text,
  description text,
  description_ar text,
  video_url text,
  content text,
  content_ar text,
  "order" integer NOT NULL DEFAULT 0,
  duration_minutes integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create user_progress table
CREATE TABLE IF NOT EXISTS user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- Enable RLS on all tables
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Courses: Public read access
CREATE POLICY "Courses are publicly readable"
  ON courses FOR SELECT
  TO authenticated, anon
  USING (true);

-- Lessons: Public read access
CREATE POLICY "Lessons are publicly readable"
  ON lessons FOR SELECT
  TO authenticated, anon
  USING (true);

-- User progress: Users can read only their own progress
CREATE POLICY "Users can read own progress"
  ON user_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- User progress: Users can insert only their own progress
CREATE POLICY "Users can insert own progress"
  ON user_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- User progress: Users can update only their own progress
CREATE POLICY "Users can update own progress"
  ON user_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_order ON lessons(course_id, "order");
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_lesson_id ON user_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);
CREATE INDEX IF NOT EXISTS idx_courses_level ON courses(level);