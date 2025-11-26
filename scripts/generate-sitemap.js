import fs from "fs";

const routes = [
  { path: "", priority: "1.0", changefreq: "daily" },
  { path: "/auth", priority: "0.7", changefreq: "weekly" },
  { path: "/pricing", priority: "0.9", changefreq: "weekly" },
  { path: "/about-us", priority: "0.6", changefreq: "monthly" },
  { path: "/faq", priority: "0.7", changefreq: "monthly" },
  { path: "/contact-us", priority: "0.6", changefreq: "monthly" },
  { path: "/terms-and-conditions", priority: "0.3", changefreq: "yearly" },
  { path: "/cancellations-and-refunds", priority: "0.3", changefreq: "yearly" },
  { path: "/privacy-policy", priority: "0.3", changefreq: "yearly" },
];

const generateSitemap = () => {
  const baseUrl = "https://www.ideaboard.ai";
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${routes
      .map((route) => {
        return `
    <url>
      <loc>${baseUrl}${route.path}</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
      <changefreq>${route.changefreq}</changefreq>
      <priority>${route.priority}</priority>
    </url>
    `;
      })
      .join("")}
</urlset>
  `;

  fs.writeFileSync("public/sitemap.xml", sitemap);
  console.log("✅ Sitemap generated successfully at public/sitemap.xml");
};

generateSitemap();
