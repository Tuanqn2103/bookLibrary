-- Drop existing table if it exists
DROP TABLE IF EXISTS users;

-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY,
  username TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Allow inserting new users without requiring authentication
CREATE POLICY "Allow inserting new users" ON users
  FOR INSERT WITH CHECK (true);

-- Allow selecting users for login
CREATE POLICY "Allow selecting users for login" ON users
  FOR SELECT USING (true);

-- Create indexes
CREATE INDEX users_email_idx ON users (email);
CREATE INDEX users_username_idx ON users (username); 