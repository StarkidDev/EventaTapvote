-- Create storage buckets for event banners and contestant photos
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('event-banners', 'event-banners', true),
  ('contestant-photos', 'contestant-photos', true);

-- Set up storage policies for event banners
CREATE POLICY "Anyone can view event banners" ON storage.objects
  FOR SELECT USING (bucket_id = 'event-banners');

CREATE POLICY "Authenticated users can upload event banners" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'event-banners' AND
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Users can update their own event banners" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'event-banners' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own event banners" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'event-banners' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Set up storage policies for contestant photos
CREATE POLICY "Anyone can view contestant photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'contestant-photos');

CREATE POLICY "Authenticated users can upload contestant photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'contestant-photos' AND
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Users can update their own contestant photos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'contestant-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own contestant photos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'contestant-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );