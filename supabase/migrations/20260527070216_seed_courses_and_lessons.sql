/*
  # Seed initial courses and lessons for Arabic & Quran learning platform

  1. Purpose
    - Insert sample courses for Arabic language learning
    - Insert sample courses for Quran studies
    - Insert sample courses for Tajweed rules
    - Add corresponding lessons for each course
  
  2. Content
    - Arabic Alphabet & Reading Fundamentals (beginner)
    - Quranic Arabic Grammar (intermediate)
    - Quran Memorization: Juz Amma (beginner)
    - Introduction to Tajweed (beginner)
    - Quran Tafsir: Surah Al-Fatiha to Al-Baqarah (intermediate)
*/

-- Insert Arabic courses
INSERT INTO courses (title, title_ar, description, description_ar, category, level, image_url, instructor, duration_hours, lessons_count, is_featured) VALUES
('Arabic Alphabet & Reading Fundamentals', 'أساسيات القراءة والحروف العربية', 
 'Master the Arabic alphabet and develop essential reading skills. Learn letter recognition, pronunciation, and basic reading patterns.', 
 'أتقن الأبجدية العربية وطوّر مهارات القراءة الأساسية',
 'arabic', 'beginner', 
 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=800', 
 'Shaykh Ahmad Hassan', 12, 8, true),

('Quranic Arabic Grammar', 'النحو العربي القرآني',
 'Understanding the grammatical structure of Quranic Arabic. Learn noun forms, verb conjugations, and sentence construction.',
 'فهم البنية النحوية للغة العربية القرآنية',
 'arabic', 'intermediate', 
 'https://images.unsplash.com/photo-1585036156165-8a3bf38b03e1?w=800', 
 'Dr. Fatima Al-Rashid', 20, 12, true);

-- Insert Quran courses
INSERT INTO courses (title, title_ar, description, description_ar, category, level, image_url, instructor, duration_hours, lessons_count, is_featured) VALUES
('Quran Memorization: Juz Amma', 'تحفيظ الجزء عمّ',
 'Begin your Quran memorization journey with the 30th Juz (Amma). Learn effective memorization techniques and review strategies.',
 'ابدأ رحلة حفظ القرآن مع الجزء الثلاثين',
 'quran', 'beginner', 
 'https://images.unsplash.com/photo-1609599006353-e629aa99fe9c?w=800', 
 'Hafiz Yusuf Abdullah', 30, 15, true),

('Quran Tafsir: Surah Al-Fatiha to Al-Baqarah', 'تفسير القرآن: سورة الفاتحة والبقرة',
 'Deep dive into the meanings and context of the opening chapters of the Quran. Understand historical context and practical applications.',
 'تعمق في معاني سياق السور الافتتاحية للقرآن',
 'quran', 'intermediate', 
 'https://images.unsplash.com/photo-1585036156165-8a3bf38b03e1?w=800', 
 'Dr. Aisha Mahmoud', 25, 10, true);

-- Insert Tajweed course
INSERT INTO courses (title, title_ar, description, description_ar, category, level, image_url, instructor, duration_hours, lessons_count, is_featured) VALUES
('Introduction to Tajweed', 'مقدمة في علم التجويد',
 'Learn the rules of Quranic recitation. Master proper pronunciation, articulation points, and beautification of Quran reading.',
 'تعلم قواعد تلاوة القرآن',
 'tajweed', 'beginner', 
 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=800', 
 'Qari Muhammad Ibrahim', 15, 11, false);

-- Get course IDs using subqueries for lessons
-- Arabic Alphabet & Reading Fundamentals lessons
INSERT INTO lessons (course_id, title, title_ar, description, description_ar, "order", duration_minutes, content) VALUES
((SELECT id FROM courses WHERE title = 'Arabic Alphabet & Reading Fundamentals'), 
 'Introduction to Arabic Letters', 'مقدمة في الحروف العربية',
 'Overview of the 28 Arabic letters and their unique characteristics', 
 'نظرة عامة على الحروف العربية الثمانية والعشرين', 
 1, 45, 
 '# Introduction to Arabic Letters\n\nThe Arabic alphabet consists of **28 letters**, all of which are consonants. Arabic is written from **right to left**, and letters change shape depending on their position in a word.\n\n## Key Features\n- Each letter has four forms: isolated, initial, medial, and final\n- Six letters cannot connect to the left\n- Letters are pronounced from different parts of the throat and mouth\n\nIn this lesson, you will learn:\n- The names and basic sounds of all 28 letters\n- How to recognize letters in different positions\n- The concept of moon and sun letters'),

((SELECT id FROM courses WHERE title = 'Arabic Alphabet & Reading Fundamentals'),
 'Letters Alif to Jeem', 'الحروف من الألف إلى الجيم',
 'Learning the first three letters and their various forms', 
 'تعلم الحروف الثلاثة الأولى وأشكالها المختلفة', 
 2, 60,
 '# Letters Alif to Jeem\n\n## Alif (ا)\n- The first letter of the Arabic alphabet\n- Represents a glottal stop or long "aa" sound\n- Has no dots and does not connect to the left\n\n## Ba (ب)\n- Second letter\n- Has one dot below\n- Connects to both sides\n- Example: باب (baab) - door\n\n## Ta (ت)\n- Third letter\n- Has two dots above\n- Connects to both sides\n- Example: تمر (tamr) - dates\n\n## Tha (ث)\n- Fourth letter\n- Has three dots above\n- Connects to both sides\n- Example: ثمر (thamar) - fruit\n\n## Jeem (ج)\n- Fifth letter\n- Has one dot below, placed inside the curve\n- Connects to both sides\n- Example: جمل (jamal) - camel'),

((SELECT id FROM courses WHERE title = 'Arabic Alphabet & Reading Fundamentals'),
 'Letters Haa to Zay', 'الحروف من الحاء إلى الزاي',
 'Continuing with the next set of letters', 
 'متابعة الحروف التالية', 
 3, 60, NULL),

((SELECT id FROM courses WHERE title = 'Arabic Alphabet & Reading Fundamentals'),
 'Vowel Signs: Fatha, Kasra, Damma', 'علامات التشكيل: الفتحة والكسرة والضمة',
 'Understanding short vowels and how they modify letter sounds', 
 'فهم الحركات القصيرة وكيفية تغيير نطق الحروف', 
 4, 50, NULL),

((SELECT id FROM courses WHERE title = 'Arabic Alphabet & Reading Fundamentals'),
 'Sukoon and Shadda', 'السكون والشدة',
 'Learning consonant markers and doubling', 
 'تعلم علامات السكون والتشديد', 
 5, 50, NULL),

((SELECT id FROM courses WHERE title = 'Arabic Alphabet & Reading Fundamentals'),
 'Long Vowels and Diphthongs', 'حروف المد والمدغمات',
 'Mastering long vowel sounds and combinations', 
 'إتقان حروف المد والتوابع', 
 6, 55, NULL),

((SELECT id FROM courses WHERE title = 'Arabic Alphabet & Reading Fundamentals'),
 'Reading Practice: Simple Words', 'تدريب على القراءة: كلمات بسيطة',
 'Applying your knowledge to read basic Arabic words', 
 'تطبيق معرفتك لقراءة كلمات عربية أساسية', 
 7, 70, NULL),

((SELECT id FROM courses WHERE title = 'Arabic Alphabet & Reading Fundamentals'),
 'Reading Practice: Sentences', 'تدريب على القراءة: جمل',
 'Progressing to simple Arabic sentences and phrases', 
 'الانتقال إلى جمل وعبارات عربية بسيطة', 
 8, 75, NULL);

-- Quran Memorization: Juz Amma lessons
INSERT INTO lessons (course_id, title, title_ar, description, description_ar, "order", duration_minutes) VALUES
((SELECT id FROM courses WHERE title = 'Quran Memorization: Juz Amma'),
 'Introduction to Memorization', 'مقدمة في الحفظ',
 'Techniques and mindset for effective Quran memorization', 
 'تقنيات وعقلية لحفظ القرآن بشكل فعال', 
 1, 40),

((SELECT id FROM courses WHERE title = 'Quran Memorization: Juz Amma'),
 'Surah An-Naba (Verses 1-20)', 'سورة النبأ (الآيات 1-20)',
 'First half of Surah An-Naba - The Great News', 
 'النصف الأول من سورة النبأ', 
 2, 50),

((SELECT id FROM courses WHERE title = 'Quran Memorization: Juz Amma'),
 'Surah An-Naba (Verses 21-40)', 'سورة النبأ (الآيات 21-40)',
 'Second half of Surah An-Naba', 
 'النصف الثاني من سورة النبأ', 
 3, 50),

((SELECT id FROM courses WHERE title = 'Quran Memorization: Juz Amma'),
 'Surah An-Nazi''at', 'سورة النازعات',
 'Memorizing Surah An-Nazi''at - Those Who Pull Out', 
 'حفظ سورة النازعات', 
 4, 55),

((SELECT id FROM courses WHERE title = 'Quran Memorization: Juz Amma'),
 'Surah ''Abasa', 'سورة عبس',
 'Memorizing Surah ''Abasa - He Frowned', 
 'حفظ سورة عبس', 
 5, 45),

((SELECT id FROM courses WHERE title = 'Quran Memorization: Juz Amma'),
 'Surah At-Takwir', 'سورة التكوير',
 'Memorizing Surah At-Takwir - The Overthrowing', 
 'حفظ سورة التكوير', 
 6, 50),

((SELECT id FROM courses WHERE title = 'Quran Memorization: Juz Amma'),
 'Surah Al-Infitar', 'سورة الانفطار',
 'Memorizing Surah Al-Infitar - The Cleaving', 
 'حفظ سورة الانفطار', 
 7, 45),

((SELECT id FROM courses WHERE title = 'Quran Memorization: Juz Amma'),
 'Review: Surahs 78-82', 'مراجعة: السور 78-82',
 'Comprehensive review of the first five surahs of Juz Amma', 
 'مراجعة شاملة للسور الخمس الأولى من الجزء عم', 
 8, 60),

((SELECT id FROM courses WHERE title = 'Quran Memorization: Juz Amma'),
 'Surah Al-Mutaffifin', 'سورة المطففين',
 'Memorizing Surah Al-Mutaffifin - The Defrauding', 
 'حفظ سورة المطففين', 
 9, 55),

((SELECT id FROM courses WHERE title = 'Quran Memorization: Juz Amma'),
 'Surah Al-Inshiqaq', 'سورة الانشقاق',
 'Memorizing Surah Al-Inshiqaq - The Sundering', 
 'حفظ سورة الانشقاق', 
 10, 45),

((SELECT id FROM courses WHERE title = 'Quran Memorization: Juz Amma'),
 'Review: Surahs 83-84', 'مراجعة: السور 83-84',
 'Review session for the most recent surahs', 
 'جلسة مراجعة للسور الأخيرة', 
 11, 40),

((SELECT id FROM courses WHERE title = 'Quran Memorization: Juz Amma'),
 'Surah Al-Buruj', 'سورة البروج',
 'Memorizing Surah Al-Buruj - The Mansions of the Stars', 
 'حفظ سورة البروج', 
 12, 50),

((SELECT id FROM courses WHERE title = 'Quran Memorization: Juz Amma'),
 'Surah At-Tariq', 'سورة الطارق',
 'Memorizing Surah At-Tariq - The Nightcomer', 
 'حفظ سورة الطارق', 
 13, 45),

((SELECT id FROM courses WHERE title = 'Quran Memorization: Juz Amma'),
 'Review: Surahs 85-86', 'مراجعة: السور 85-86',
 'Review session', 
 'جلسة مراجعة', 
 14, 40),

((SELECT id FROM courses WHERE title = 'Quran Memorization: Juz Amma'),
 'Final Review: Juz Amma Part 1', 'المراجعة النهائية: الجزء الأول',
 'Comprehensive review of all memorized surahs', 
 'مراجعة شاملة لجميع السور المحفوظة', 
 15, 90);

-- Introduction to Tajweed lessons
INSERT INTO lessons (course_id, title, title_ar, description, description_ar, "order", duration_minutes) VALUES
((SELECT id FROM courses WHERE title = 'Introduction to Tajweed'),
 'What is Tajweed?', 'ما هو التجويد؟',
 'Understanding the importance and purpose of Tajweed rules', 
 'فهم أهمية وهدف قواعد التجويد', 
 1, 40),

((SELECT id FROM courses WHERE title = 'Introduction to Tajweed'),
 'Makharij: Articulation Points', 'المخارج: مواضع النطق',
 'Learning the 17 specific points of letter articulation', 
 'تعلم النقاط السبع عشرة المحددة لمخرج الحروف', 
 2, 60),

((SELECT id FROM courses WHERE title = 'Introduction to Tajweed'),
 'Letters from the Deep Throat', 'الحروف الحلقية',
 'Mastering throat letters (أ، ه، ع، ح، غ، خ)', 
 'إتقان الحروف الحلقية', 
 3, 55),

((SELECT id FROM courses WHERE title = 'Introduction to Tajweed'),
 'Letters from the Middle Throat', 'الحروف الوسطية',
 'Understanding letters pronounced from the middle throat', 
 'فهم الحروف المنطوقة من منتصف الحلق', 
 4, 50),

((SELECT id FROM courses WHERE title = 'Introduction to Tajweed'),
 'Letters from the Lips', 'حروف الشفة',
 'Correct pronunciation of labial letters', 
 'النطق الصحيح للحروف الشفوية', 
 5, 45),

((SELECT id FROM courses WHERE title = 'Introduction to Tajweed'),
 'Noon Sakinah Rules: Idhar', 'أحكام النون الساكنة: الإظهار',
 'First rule of Noon Sakinah - Clear pronunciation', 
 'القاعدة الأولى للنون الساكنة', 
 6, 55),

((SELECT id FROM courses WHERE title = 'Introduction to Tajweed'),
 'Noon Sakinah Rules: Idgham', 'أحكام النون الساكنة: الإدغام',
 'Understanding merging rules', 
 'فهم قواعد الإدغام', 
 7, 60),

((SELECT id FROM courses WHERE title = 'Introduction to Tajweed'),
 'Noon Sakinah Rules: Iqlab', 'أحكام النون الساكنة: الإقلاب',
 'The flipping rule with Ba', 
 'قاعدة الإقلاب مع حرف الباء', 
 8, 45),

((SELECT id FROM courses WHERE title = 'Introduction to Tajweed'),
 'Noon Sakinah Rules: Ikhfa', 'أحكام النون الساكنة: الإخفاء',
 'The hiding rule - achieving hidden pronunciation', 
 'قاعدة الإخفاء - تحقيق النطق المخفي', 
 9, 55),

((SELECT id FROM courses WHERE title = 'Introduction to Tajweed'),
 'Meem Sakinah Rules', 'أحكام الميم الساكنة',
 'Three rules for Meem Sakinah', 
 'القواعد الثلاث للميم الساكنة', 
 10, 60),

((SELECT id FROM courses WHERE title = 'Introduction to Tajweed'),
 'Madd: Prolongation Rules', 'المد: قواعد التطويل',
 'Understanding elongation in Quranic recitation', 
 'فهم المد في التلاوة القرآنية', 
 11, 65);