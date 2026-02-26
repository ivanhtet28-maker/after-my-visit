
-- Create profiles table
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  first_name text,
  state text,
  age_range text,
  has_regular_gp boolean DEFAULT false,
  ongoing_conditions text,
  current_medications text,
  onboarding_complete boolean DEFAULT false,
  subscription_tier text DEFAULT 'free',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create visits table
CREATE TABLE public.visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  doctor_name text,
  clinic_name text,
  visit_type text,
  visit_date date DEFAULT current_date,
  recording_url text,
  recording_duration integer,
  transcript text,
  summary jsonb,
  status text DEFAULT 'draft',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create action_items table
CREATE TABLE public.action_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  visit_id uuid REFERENCES public.visits(id) ON DELETE SET NULL,
  description text NOT NULL,
  due_date date,
  status text DEFAULT 'pending',
  category text,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Create medications table
CREATE TABLE public.medications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  visit_id uuid REFERENCES public.visits(id) ON DELETE SET NULL,
  name text NOT NULL,
  dosage text,
  frequency text,
  prescribing_doctor text,
  date_prescribed date,
  is_pbs boolean DEFAULT false,
  plain_explanation text,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

-- Create chat_messages table
CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  visit_id uuid REFERENCES public.visits(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Helper function: is_owner_of_visit
CREATE OR REPLACE FUNCTION public.is_owner_of_visit(_visit_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.visits
    WHERE id = _visit_id AND user_id = auth.uid()
  )
$$;

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_visits_updated_at BEFORE UPDATE ON public.visits FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for visits
CREATE POLICY "Users can view own visits" ON public.visits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own visits" ON public.visits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own visits" ON public.visits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own visits" ON public.visits FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for action_items
CREATE POLICY "Users can view own actions" ON public.action_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own actions" ON public.action_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own actions" ON public.action_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own actions" ON public.action_items FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for medications
CREATE POLICY "Users can view own medications" ON public.medications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own medications" ON public.medications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own medications" ON public.medications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own medications" ON public.medications FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for chat_messages
CREATE POLICY "Users can view own chats" ON public.chat_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own chats" ON public.chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Storage bucket for visit recordings
INSERT INTO storage.buckets (id, name, public) VALUES ('visit-recordings', 'visit-recordings', false);

-- Storage policies
CREATE POLICY "Users can upload own recordings" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'visit-recordings' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Users can view own recordings" ON storage.objects FOR SELECT USING (
  bucket_id = 'visit-recordings' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Users can delete own recordings" ON storage.objects FOR DELETE USING (
  bucket_id = 'visit-recordings' AND auth.uid()::text = (storage.foldername(name))[1]
);
