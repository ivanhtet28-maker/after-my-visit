
-- Storage RLS policies for visit-recordings bucket
CREATE POLICY "Users can upload recordings"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'visit-recordings'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can read own recordings"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'visit-recordings'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
