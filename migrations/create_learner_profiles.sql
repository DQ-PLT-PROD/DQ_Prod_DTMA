-- Create learner_profiles table for tracking learning progress
CREATE TABLE IF NOT EXISTS learner_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  current_stage INTEGER DEFAULT 0,
  completed_stages INTEGER[] DEFAULT '{}',
  total_score INTEGER DEFAULT 0,
  badges TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE learner_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON learner_profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON learner_profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON learner_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_learner_profiles_email ON learner_profiles(email);
CREATE INDEX IF NOT EXISTS idx_learner_profiles_current_stage ON learner_profiles(current_stage);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_learner_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function
CREATE TRIGGER update_learner_profiles_updated_at
  BEFORE UPDATE ON learner_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_learner_profiles_updated_at();

-- Grant permissions
GRANT ALL ON learner_profiles TO authenticated;
GRANT SELECT ON learner_profiles TO anon;
