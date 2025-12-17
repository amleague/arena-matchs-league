import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ogfdabsfxqhkgyvyruoe.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9nZmRhYnNmeHFoa2d5dnlydW9lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5Nzg2NTIsImV4cCI6MjA4MTU1NDY1Mn0.a3FCc9R9Xh7_DRTvXC6HexZnw1-lNlF0GaZjP4wK6fw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
