-- Create function to increment view count atomically
CREATE OR REPLACE FUNCTION increment_view_count(note_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE notes 
  SET view_count = COALESCE(view_count, 0) + 1 
  WHERE id = note_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to increment download count atomically
CREATE OR REPLACE FUNCTION increment_download_count(note_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE notes 
  SET download_count = COALESCE(download_count, 0) + 1 
  WHERE id = note_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to get note statistics
CREATE OR REPLACE FUNCTION get_note_stats(note_id UUID)
RETURNS TABLE(views INTEGER, downloads INTEGER) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(view_count, 0) as views,
    COALESCE(download_count, 0) as downloads
  FROM notes 
  WHERE id = note_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to get user statistics
CREATE OR REPLACE FUNCTION get_user_stats(user_id UUID)
RETURNS TABLE(total_notes INTEGER, total_views INTEGER, total_downloads INTEGER) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as total_notes,
    COALESCE(SUM(view_count), 0)::INTEGER as total_views,
    COALESCE(SUM(download_count), 0)::INTEGER as total_downloads
  FROM notes 
  WHERE uploader_id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to get platform statistics
CREATE OR REPLACE FUNCTION get_platform_stats()
RETURNS TABLE(total_notes INTEGER, total_users INTEGER, total_views INTEGER, total_downloads INTEGER) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*)::INTEGER FROM notes) as total_notes,
    (SELECT COUNT(*)::INTEGER FROM profiles) as total_users,
    (SELECT COALESCE(SUM(view_count), 0)::INTEGER FROM notes) as total_views,
    (SELECT COALESCE(SUM(download_count), 0)::INTEGER FROM notes) as total_downloads;
END;
$$ LANGUAGE plpgsql;

-- Create function for full-text search
CREATE OR REPLACE FUNCTION search_notes(search_query TEXT)
RETURNS TABLE(
  id UUID,
  title TEXT,
  course TEXT,
  lecturer TEXT,
  description TEXT,
  file_path TEXT,
  file_type TEXT,
  tags TEXT[],
  uploader_id UUID,
  uploader_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  download_count INTEGER,
  view_count INTEGER,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    n.id,
    n.title,
    n.course,
    n.lecturer,
    n.description,
    n.file_path,
    n.file_type,
    n.tags,
    n.uploader_id,
    n.uploader_name,
    n.created_at,
    COALESCE(n.download_count, 0) as download_count,
    COALESCE(n.view_count, 0) as view_count,
    ts_rank(
      to_tsvector('english', n.title || ' ' || n.course || ' ' || n.lecturer || ' ' || COALESCE(n.description, '') || ' ' || array_to_string(n.tags, ' ')),
      plainto_tsquery('english', search_query)
    ) as rank
  FROM notes n
  WHERE to_tsvector('english', n.title || ' ' || n.course || ' ' || n.lecturer || ' ' || COALESCE(n.description, '') || ' ' || array_to_string(n.tags, ' '))
        @@ plainto_tsquery('english', search_query)
  ORDER BY rank DESC, n.created_at DESC;
END;
$$ LANGUAGE plpgsql;
