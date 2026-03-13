import type { MetadataRoute } from "next";

const getBaseUrl = () =>
  (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(
    /\/$/,
    ""
  );

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/papers", "/about"],
        disallow: [
          "/auth",
          "/dashboard",
          "/bookmarks",
          "/settings",
          "/admin-dashboard",
          "/admin-pdf-settings",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
