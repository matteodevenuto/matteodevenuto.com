// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

interface SocialLink {
  href: string;
  label: string;
}

interface Site {
  website: string;
  author: string;
  profile: string;
  desc: string;
  title: string;
  ogImage: string;
  lightAndDarkMode: boolean;
  postPerIndex: number;
  postPerPage: number;
  scheduledPostMargin: number;
  showArchives: boolean;
  showBackButton: boolean;
  editPost: {
    enabled: boolean;
    text: string;
    url: string;
  };
  dynamicOgImage: boolean;
  lang: string;
  timezone: string;
}

// Site configuration
export const SITE: Site = {
  website: "https://matteodevenuto.com/",
  author: "Matteo De Venuto",
  profile: "https://matteodevenuto.com/about",
  desc: "Trader and Ambassador at Falcon FX | Passionate about markets, programming, technology and much more.",
  title: "Matteo De Venuto",
  ogImage: "/avatar.png",
  lightAndDarkMode: true,
  postPerIndex: 10,
  postPerPage: 10,
  scheduledPostMargin: 15 * 60 * 1000,
  showArchives: false,
  showBackButton: true,
  editPost: {
    enabled: false,
    text: "Edit on GitHub",
    url: "https://github.com/matteodevenuto/matteodevenuto.com/edit/main/",
  },
  dynamicOgImage: true,
  lang: "en",
  timezone: "Europe/Rome",
};

export const SITE_TITLE = SITE.title;
export const SITE_DESCRIPTION = SITE.desc;

// Navigation links
export const NAV_LINKS: SocialLink[] = [
  {
    href: "/blog",
    label: "Blog",
  },
  {
    href: "/about",
    label: "About",
  },
  {
    href: "/projects",
    label: "Projects",
  },
];

// Social media links
export const SOCIAL_LINKS: SocialLink[] = [
  {
    href: "https://github.com/matteodevenuto",
    label: "GitHub",
  },
  {
    href: "https://x.com/matteodevenuto",
    label: "X",
  },
  {
    href: "https://youtube.com/@matteodevenuto",
    label: "YouTube",
  },
  {
    href: "/rss.xml",
    label: "RSS",
  },
];

// Icon map for social media
export const ICON_MAP: Record<string, string> = {
  GitHub: "github",
  X: "x",
  YouTube: "youtube",
  RSS: "rss",
  Email: "mail",
};
