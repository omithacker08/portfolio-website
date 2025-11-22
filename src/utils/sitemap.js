export const generateSitemap = (blogs, projects) => {
  const baseUrl = window.location.origin;
  const pages = [
    { url: '/', priority: '1.0', changefreq: 'weekly' },
    { url: '/about', priority: '0.8', changefreq: 'monthly' },
    { url: '/projects', priority: '0.8', changefreq: 'weekly' },
    { url: '/blog', priority: '0.9', changefreq: 'daily' },
    { url: '/contact', priority: '0.7', changefreq: 'monthly' },
    { url: '/resume', priority: '0.6', changefreq: 'monthly' }
  ];

  blogs.forEach(blog => {
    pages.push({
      url: `/blog/${blog.id}`,
      priority: '0.6',
      changefreq: 'monthly',
      lastmod: blog.created_at
    });
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <priority>${page.priority}</priority>
    <changefreq>${page.changefreq}</changefreq>
    ${page.lastmod ? `<lastmod>${new Date(page.lastmod).toISOString()}</lastmod>` : ''}
  </url>`).join('\n')}
</urlset>`;

  return xml;
};