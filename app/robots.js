export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/sub-admin/", "/agent/", "/api/"],
      },
    ],
    sitemap: "https://mitupay.tech/sitemap.xml",
  };
}
