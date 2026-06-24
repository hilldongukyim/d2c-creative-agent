export interface CrewData {
  role: string;
  image: string;
  detailImage?: string;
  description: string;
  personality?: string;
  isComingSoon: boolean;
  isUpgraded?: boolean;
  ctaLabel?: string;
  ctaUrl?: string;
  ctaRoute?: string;
}

export const CREW_DATA: Record<string, CrewData> = {
  vee: {
    role: "Super Agent",
    image: "/lovable-uploads/vee-profile.png",
    description: "Vee serves as the central command center for all AI agents, coordinating complex workflows and optimizing collaboration between teams.",
    isComingSoon: true,
  },
  fiona: {
    role: "Account Manager",
    image: "/lovable-uploads/fiona-profile.png",
    description: "Fiona is dedicated to account deletion and cleanup tasks, ensuring safe account management through compliance with data security and privacy regulations.",
    isComingSoon: true,
  },
  boris: {
    role: "Promotion Coordinator",
    image: "",
    description: "Boris serves as the promotion team coordinator, assisting in marketing campaign planning and connecting specialized departments.",
    isComingSoon: true,
  },
  yumi: {
    role: "El-Form Designer",
    image: "/lovable-uploads/d004c9d6-0491-459c-8639-7730374641aa.png",
    detailImage: "/lovable-uploads/yumi-detail-image.png",
    description: "Yumi is an EI-Form designer for LG Electronics brand templates, creating clean and intuitive designs that comply with brand guidelines.",
    personality: "Executes requests immediately, interested in fast and efficient design.",
    isComingSoon: false,
    ctaLabel: "Work with Yumi",
    ctaUrl: "https://yumi-twincrew.web.app/",
  },
  ben: {
    role: "PTO Image Creator",
    image: "/lovable-uploads/ben-profile-v2.png",
    detailImage: "/lovable-uploads/ben-detail-image.png",
    description: "Ben creates dotcom PTO model gallery images. Generates images reflecting accurate information with consistent and stable quality.",
    personality: "Very interested in dotcom gallery image domain and continuously learning.",
    isComingSoon: false,
    isUpgraded: true,
    ctaLabel: "Work with Ben",
    ctaUrl: "https://ben-twincrew.web.app",
  },
  pip: {
    role: "Content QA",
    image: "/lovable-uploads/76efa2dd-a233-469b-8c78-0957e563f8a4.png",
    description: "Pip is a Content QA specialist who reviews whether content is created according to Content Creation Guidelines and Brand Guidelines.",
    isComingSoon: true,
  },
  mateo: {
    role: "Crawler",
    image: "/lovable-uploads/mateo-profile.png",
    description: "Mateo avoids repetitive manual tasks. Upload an Excel template to perform crawling based on models and retailers.",
    personality: "Competitor Crawling, Product Crawling, Data DB, Trend Analysis.",
    isComingSoon: false,
    ctaLabel: "Work with Mateo",
    ctaRoute: "/crawling",
  },
  theo: {
    role: "NPI Operation Manager",
    image: "/lovable-uploads/theo-profile.png",
    description: "Theo is the Content Operation manager who supports subsidiary/BU representatives with NPI product registration requests.",
    isComingSoon: true,
  },
  maple: {
    role: "Content Crawler",
    image: "/lovable-uploads/maple-profile.png",
    detailImage: "/lovable-uploads/maple-detail-image.png",
    description: "Maple crawls live content from LG.COM. Currently, only homepage hero banners can be viewed.",
    personality: "Meticulous and patient, excels at systematic data collection.",
    isComingSoon: false,
    ctaLabel: "Work with Maple",
    ctaRoute: "/maple-pdp",
  },
  noa: {
    role: "Product Information Manager",
    image: "/lovable-uploads/noa-profile.png",
    detailImage: "/lovable-uploads/noa-detail-image.png",
    description: "Noa helps with practical work based on product information from PIM (Product Information Management).",
    personality: "Organized and detail-oriented, excels at managing complex product data.",
    isComingSoon: false,
    ctaLabel: "Work with Noa",
    ctaUrl: "https://aiagent.pimds.aws.lge.com/",
  },
  anita: {
    role: "Lifestyle Photographer",
    image: "/lovable-uploads/anita-profile.png",
    detailImage: "/lovable-uploads/anita-detail-image.png",
    description: "Anita is a Lifestyle Photographer who creates compelling lifestyle content and visual storytelling for marketing campaigns.",
    personality: "Creative and artistic, excels at capturing lifestyle moments.",
    isComingSoon: false,
    ctaLabel: "Work with Anita",
    ctaUrl: "https://anita-twincrew.vercel.app/",
  },
  milo: {
    role: "eCRM Designer",
    image: "/lovable-uploads/milo-profile.png",
    detailImage: "/lovable-uploads/milo-detail-image.png",
    description: "Milo is an eCRM Designer who creates email content based on pre-designed layouts. He helps produce modular email components by customizing text, visuals, and formatting to match brand guidelines for customer communications.",
    personality: "Detail-oriented and creative, excels at crafting email content.",
    isComingSoon: false,
    ctaLabel: "Work with Milo",
    ctaUrl: "https://milo-twincrew.web.app/",
  },
  haruto: {
    role: "Data Analyst",
    image: "/lovable-uploads/haruto-profile.png",
    description: "Haruto specializes in data analysis and insights generation.",
    isComingSoon: true,
  },
  harvey: {
    role: "Content Publisher",
    image: "/lovable-uploads/harvey-profile.png",
    description: "Harvey manages content distribution and publication workflows.",
    isComingSoon: true,
  },
  carmen: {
    role: "Marketing Coordinator",
    image: "/lovable-uploads/carmen-profile.png",
    description: "Carmen coordinates cross-functional marketing initiatives.",
    isComingSoon: true,
  },
  dan: {
    role: "Integration Specialist",
    image: "/lovable-uploads/dan-profile.png",
    description: "Dan handles technical integration and API management.",
    isComingSoon: true,
  },
  juno: {
    role: "CX Manager",
    image: "/lovable-uploads/juno-profile.png",
    description: "Juno manages customer experience and feedback collection.",
    isComingSoon: true,
  },
  kofi: {
    role: "Performance Analyst",
    image: "/lovable-uploads/kofi-profile.png",
    description: "Kofi specializes in performance optimization and analytics.",
    isComingSoon: true,
  },
  rosa: {
    role: "Creative Director",
    image: "/lovable-uploads/rosa-profile.png",
    description: "Rosa handles creative direction and brand consistency.",
    isComingSoon: true,
  },
  tango: {
    role: "Automation Expert",
    image: "/lovable-uploads/tango-profile.png",
    description: "Tango manages automation workflows and process optimization.",
    isComingSoon: true,
  },
  mochi: {
    role: "Development Request Manager",
    image: "/lovable-uploads/mochi-profile.png",
    description: "Mochi receives and manages development requests from the team. Submit your feature requests and track their progress.",
    isComingSoon: false,
    ctaLabel: "Submit Request",
  },
  mell: {
    role: "Newsletter Manager",
    image: "/lovable-uploads/mell-profile.png",
    description: "Mell manages newsletter subscriptions and communication preferences for the team.",
    isComingSoon: false,
    ctaLabel: "Subscribe",
  },
  "fiona-admin": {
    role: "Admin Dashboard",
    image: "/lovable-uploads/fiona-admin-profile.png",
    description: "Fiona is the admin dashboard manager. Access crew requests, development requests, and crew popularity analytics.",
    isComingSoon: false,
    ctaLabel: "Access Dashboard",
  },
  rex: {
    role: "AI Commerce & Marketing Intelligence Reporter",
    image: "/lovable-uploads/crew-image-28.png",
    detailImage: "/lovable-uploads/rex-detail-image.jpeg",
    description: "Automatically collects the latest global AI commerce & marketing news and generates Daily/Weekly/Monthly reports.\n\nKey capabilities: AI Trend · Daily Feed · Auto Report",
    personality: "AI Trend, Daily Feed, Auto Report",
    isComingSoon: false,
    ctaLabel: "Open Report",
    ctaUrl: "https://suno7608.github.io/ai-trend-hub/",
  },
  vera: {
    role: "Global D2C Market Intelligence Analyst",
    image: "/lovable-uploads/crew-image-29.png",
    detailImage: "/lovable-uploads/vera-detail-image.jpeg",
    description: "Monitors VOC, promotions, and Chinese brand trends across 16 countries, delivering key market insights.\n\nKey capabilities: 16-Country · VOC Sensing · China Watch",
    personality: "16-Country, VOC Sensing, China Watch",
    isComingSoon: false,
    ctaLabel: "Open Intel",
    ctaUrl: "https://suno7608.github.io/d2c-intel/",
  },
};
