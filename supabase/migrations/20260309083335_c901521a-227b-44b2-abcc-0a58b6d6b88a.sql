
-- Create storage bucket for MMS media
INSERT INTO storage.buckets (id, name, public) VALUES ('mms-media', 'mms-media', true);

-- Allow anyone to upload to mms-media bucket (no auth required since app uses PIN access)
CREATE POLICY "Allow public uploads to mms-media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'mms-media');

-- Allow public read access
CREATE POLICY "Allow public read of mms-media" ON storage.objects FOR SELECT USING (bucket_id = 'mms-media');

-- Allow public delete
CREATE POLICY "Allow public delete of mms-media" ON storage.objects FOR DELETE USING (bucket_id = 'mms-media');
