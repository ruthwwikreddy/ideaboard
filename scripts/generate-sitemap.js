import fs from "fs";

const routes = [
  "",
  "/auth",
  "/pricing",
  "/contact-us",
  "/terms-and-conditions",
  "/cancellations-and-refunds",
  "/privacy-policy",
];

const generateSitemap = () => {
  const baseUrl = "https://www.ideaboard.ai";
  const sitemap = `
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${routes
    .map((route) => {
      return `
    <url>
      <loc>${baseUrl}${route}</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>0.8</priority>
    </url>
    `;
    })
    .join("")}
</urlset>
  `;

  fs.writeFileSync("sitemap.xml", sitemap);
};

generateSitemap();
