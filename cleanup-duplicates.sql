-- PostgreSQL cleanup script to remove duplicate data
-- Run this manually in your PostgreSQL database

-- Keep only the latest 3 unique projects (by name)
DELETE FROM projects 
WHERE id NOT IN (
  SELECT DISTINCT ON (name) id 
  FROM projects 
  ORDER BY name, created_at DESC
);

-- Keep only the latest unique AI project (by use_case)
DELETE FROM ai_projects 
WHERE id NOT IN (
  SELECT DISTINCT ON (use_case) id 
  FROM ai_projects 
  ORDER BY use_case, created_at DESC
);

-- Keep only the latest unique blog (by title)
DELETE FROM blogs 
WHERE id NOT IN (
  SELECT DISTINCT ON (title) id 
  FROM blogs 
  ORDER BY title, created_at DESC
);

-- Check the results
SELECT 'Projects count:' as table_name, COUNT(*) as count FROM projects
UNION ALL
SELECT 'AI Projects count:', COUNT(*) FROM ai_projects
UNION ALL
SELECT 'Blogs count:', COUNT(*) FROM blogs;