/*
  # NoteHub - Notes and Categories

  1. New Tables
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text, unique, max 100 chars)
      - `created_at` (timestamp)
    - `notes`
      - `id` (uuid, primary key)
      - `title` (text, required, max 200 chars)
      - `content` (text, optional)
      - `category_id` (uuid, FK → categories)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Allow public read/write for single-user local app (anon key only)

  3. Notes
    - Single-user app; RLS policies allow full access via anon role
*/

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT categories_name_length CHECK (char_length(name) <= 100)
);

CREATE TABLE IF NOT EXISTS notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT notes_title_length CHECK (char_length(title) <= 200)
);

CREATE INDEX IF NOT EXISTS notes_category_id_idx ON notes(category_id);
CREATE INDEX IF NOT EXISTS notes_created_at_idx ON notes(created_at DESC);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read categories"
  ON categories FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Public can insert categories"
  ON categories FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Public can delete categories"
  ON categories FOR DELETE
  TO anon
  USING (true);

CREATE POLICY "Public can read notes"
  ON notes FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Public can insert notes"
  ON notes FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Public can update notes"
  ON notes FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can delete notes"
  ON notes FOR DELETE
  TO anon
  USING (true);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
