export const siteConfig = {
  name: "DevLog",
  description: "개발 블로그",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  author: {
    name: "Cho",
  },
  links: {
    github: "https://github.com",
  },
} as const;
