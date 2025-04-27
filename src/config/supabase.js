import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kyordgqvnrsqtpfkoebh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5b3JkZ3F2bnJzcXRwZmtvZWJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1ODI2NjcsImV4cCI6MjA2MTE1ODY2N30.57fsghbGQIvfp41fF_C30qvSnvZ_I8Xh2hZrb51Tqi4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 