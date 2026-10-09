/*
# Create flashcards and review logs tables (single-tenant, no auth)

1. New Tables
- `flashcards`: Stores professional vocabulary cards for Spanish, Mandarin, and Hindi.
  - `id` (uuid, primary key)
  - `language` (text, not null) — 'spanish', 'mandarin', or 'hindi'
  - `category` (text, not null) — profession/field e.g. 'healthcare', 'business', 'finance', 'technology'
  - `front` (text, not null) — the English term or prompt
  - `back` (text, not null) — the translation in the target language
  - `romanization` (text) — phonetic spelling for Mandarin/Hindi
  - `example` (text) — example sentence using the term
  - `example_translation` (text) — English translation of the example
  - `difficulty` (int, default 0) — ease factor for spaced repetition (0=new)
  - `created_at` (timestamptz)

- `review_logs`: Tracks each review session for progress analytics.
  - `id` (uuid, primary key)
  - `flashcard_id` (uuid, FK to flashcards)
  - `rating` (text, not null) — 'again', 'hard', 'good', 'easy'
  - `reviewed_at` (timestamptz, default now())

- `card_progress`: Tracks per-card spaced repetition state (next review, interval, streak).
  - `id` (uuid, primary key)
  - `flashcard_id` (uuid, FK to flashcards, unique)
  - `interval_days` (int, default 0)
  - `ease_factor` (float, default 2.5)
  - `repetitions` (int, default 0)
  - `next_review` (date, default today)
  - `last_reviewed` (date)

2. Security
- Enable RLS on all tables.
- Allow anon + authenticated CRUD because the data is intentionally shared/public (no sign-in).
*/

CREATE TABLE IF NOT EXISTS flashcards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  language text NOT NULL CHECK (language IN ('spanish', 'mandarin', 'hindi')),
  category text NOT NULL,
  front text NOT NULL,
  back text NOT NULL,
  romanization text,
  example text,
  example_translation text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS review_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  flashcard_id uuid NOT NULL REFERENCES flashcards(id) ON DELETE CASCADE,
  rating text NOT NULL CHECK (rating IN ('again', 'hard', 'good', 'easy')),
  reviewed_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS card_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  flashcard_id uuid NOT NULL UNIQUE REFERENCES flashcards(id) ON DELETE CASCADE,
  interval_days int NOT NULL DEFAULT 0,
  ease_factor float NOT NULL DEFAULT 2.5,
  repetitions int NOT NULL DEFAULT 0,
  next_review date NOT NULL DEFAULT CURRENT_DATE,
  last_reviewed date
);

ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_flashcards" ON flashcards;
CREATE POLICY "anon_select_flashcards" ON flashcards FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_flashcards" ON flashcards;
CREATE POLICY "anon_insert_flashcards" ON flashcards FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_flashcards" ON flashcards;
CREATE POLICY "anon_update_flashcards" ON flashcards FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_flashcards" ON flashcards;
CREATE POLICY "anon_delete_flashcards" ON flashcards FOR DELETE
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_review_logs" ON review_logs;
CREATE POLICY "anon_select_review_logs" ON review_logs FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_review_logs" ON review_logs;
CREATE POLICY "anon_insert_review_logs" ON review_logs FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_review_logs" ON review_logs;
CREATE POLICY "anon_delete_review_logs" ON review_logs FOR DELETE
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_card_progress" ON card_progress;
CREATE POLICY "anon_select_card_progress" ON card_progress FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_card_progress" ON card_progress;
CREATE POLICY "anon_insert_card_progress" ON card_progress FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_card_progress" ON card_progress;
CREATE POLICY "anon_update_card_progress" ON card_progress FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_card_progress" ON card_progress;
CREATE POLICY "anon_delete_card_progress" ON card_progress FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_flashcards_language_category ON flashcards(language, category);
CREATE INDEX IF NOT EXISTS idx_review_logs_flashcard ON review_logs(flashcard_id);
CREATE INDEX IF NOT EXISTS idx_review_logs_reviewed_at ON review_logs(reviewed_at);
CREATE INDEX IF NOT EXISTS idx_card_progress_next_review ON card_progress(next_review);
