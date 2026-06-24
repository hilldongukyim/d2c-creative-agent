import anitaImg from '@/assets/Anita_profile.jpeg';
import benImg from '@/assets/Ben-profile.jpeg';
import miloImg from '@/assets/Milo-profile.png';
import noaImg from '@/assets/Noa-profile.png';
import rexImg from '@/assets/Rex-profile.png';
import veraImg from '@/assets/Vera-profile.png';
import yumiImg from '@/assets/Yumi-profile.png';

export interface CrewData {
  role: string;
  image: string;
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
    image: "",
    description: "Vee serves as the central command center for all AI agents, coordinating complex workflows and optimizing collaboration between teams.",
    isComingSoon: true,
  },
  fiona: {
    role: "Account Manager",
    image: "",
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
    image: yumiImg,
    description: "Yumi is an EI-Form designer for LG Electronics brand templates, creating clean and intuitive designs that comply with brand guidelines.",
    personality: "Executes requests immediately, interested in fast and efficient design.",
    isComingSoon: false,
    ctaLabel: "Work with Yumi",
    ctaUrl: "https://yumi-twincrew.web.app/",
  },
  ben: {
    role: "PTO Image Creator",
    image: benImg,
    description: "Ben creates dotcom PTO model gallery images. Generates images reflecting accurate information with consistent and stable quality.",
    personality: "Very interested in dotcom gallery image domain and continuously learning.",
    isComingSoon: false,
    isUpgraded: true,
    ctaLabel: "Work with Ben",
    ctaUrl: "https://ben-twincrew.web.app",
  },
  pip: {
    role: "Content QA",
    image: "",
    description: "Pip is a Content QA specialist who reviews whether content is created according to Content Creation Guidelines and Brand Guidelines.",
    isComingSoon: true,
  },
  mateo: {
    role: "Crawler",
    image: "",
    description: "Mateo avoids repetitive manual tasks. Upload an Excel template to perform crawling based on models and retailers.",
    personality: "Competitor Crawling, Product Crawling, Data DB, Trend Analysis.",
    isComingSoon: false,
    ctaLabel: "Work with Mateo",
    ctaRoute: "/crawling",
  },
  theo: {
    role: "NPI Operation Manager",
    image: "",
    description: "Theo is the Content Operation manager who supports subsidiary/BU representatives with NPI product registration requests.",
    isComingSoon: true,
  },
  maple: {
    role: "Content Crawler",
    image: "",
    description: "Maple crawls live content from LG.COM. Currently, only homepage hero banners can be viewed.",
    personality: "Meticulous and patient, excels at systematic data collection.",
    isComingSoon: false,
    ctaLabel: "Work with Maple",
    ctaRoute: "/maple-pdp",
  },
  noa: {
    role: "Product Information Manager",
    image: noaImg,
    description: "Noa helps with practical work based on product information from PIM (Product Information Management).",
    personality: "Organized and detail-oriented, excels at managing complex product data.",
    isComingSoon: false,
    ctaLabel: "Work with Noa",
    ctaUrl: "https://aiagent.pimds.aws.lge.com/",
  },
  anita: {
    role: "Lifestyle Photographer",
    image: anitaImg,
    description: "Anita is a Lifestyle Photographer who creates compelling lifestyle content and visual storytelling for marketing campaigns.",
    personality: "Creative and artistic, excels at capturing lifestyle moments.",
    isComingSoon: false,
    ctaLabel: "Work with Anita",
    ctaUrl: "https://anita-twincrew.vercel.app/",
  },
  milo: {
    role: "eCRM Designer",
    image: miloImg,
    description: "Milo is an eCRM Designer who creates email content based on pre-designed layouts. He helps produce modular email components by customizing text, visuals, and formatting to match brand guidelines for customer communications.",
    personality: "Detail-oriented and creative, excels at crafting email content.",
    isComingSoon: false,
    ctaLabel: "Work with Milo",
    ctaUrl: "https://milo-twincrew.web.app/",
  },
  haruto: {
    role: "Data Analyst",
    image: "",
    description: "Haruto specializes in data analysis and insights generation.",
    isComingSoon: true,
  },
  harvey: {
    role: "Content Publisher",
    image: "",
    description: "Harvey manages content distribution and publication workflows.",
    isComingSoon: true,
  },
  carmen: {
    role: "Marketing Coordinator",
    image: "",
    description: "Carmen coordinates cross-functional marketing initiatives.",
    isComingSoon: true,
  },
  dan: {
    role: "Integration Specialist",
    image: "",
    description: "Dan handles technical integration and API management.",
    isComingSoon: true,
  },
  juno: {
    role: "CX Manager",
    image: "",
    description: "Juno manages customer experience and feedback collection.",
    isComingSoon: true,
  },
  kofi: {
    role: "Performance Analyst",
    image: "",
    description: "Kofi specializes in performance optimization and analytics.",
    isComingSoon: true,
  },
  rosa: {
    role: "Creative Director",
    image: "",
    description: "Rosa handles creative direction and brand consistency.",
    isComingSoon: true,
  },
  tango: {
    role: "Automation Expert",
    image: "",
    description: "Tango manages automation workflows and process optimization.",
    isComingSoon: true,
  },
  mochi: {
    role: "Development Request Manager",
    image: "",
    description: "Mochi receives and manages development requests from the team. Submit your feature requests and track their progress.",
    isComingSoon: false,
    ctaLabel: "Submit Request",
  },
  mell: {
    role: "Newsletter Manager",
    image: "",
    description: "Mell manages newsletter subscriptions and communication preferences for the team.",
    isComingSoon: false,
    ctaLabel: "Subscribe",
  },
  "fiona-admin": {
    role: "Admin Dashboard",
    image: "",
    description: "Fiona is the admin dashboard manager. Access crew requests, development requests, and crew popularity analytics.",
    isComingSoon: false,
    ctaLabel: "Access Dashboard",
  },
  rex: {
    role: "AI Commerce & Marketing Intelligence Reporter",
    image: rexImg,
    description: "Automatically collects the latest global AI commerce & marketing news and generates Daily/Weekly/Monthly reports.\n\nKey capabilities: AI Trend · Daily Feed · Auto Report",
    personality: "AI Trend, Daily Feed, Auto Report",
    isComingSoon: false,
    ctaLabel: "Open Report",
    ctaUrl: "https://suno7608.github.io/ai-trend-hub/",
  },
  vera: {
    role: "Global D2C Market Intelligence Analyst",
    image: veraImg,
    description: "Monitors VOC, promotions, and Chinese brand trends across 16 countries, delivering key market insights.\n\nKey capabilities: 16-Country · VOC Sensing · China Watch",
    personality: "16-Country, VOC Sensing, China Watch",
    isComingSoon: false,
    ctaLabel: "Open Intel",
    ctaUrl: "https://suno7608.github.io/d2c-intel/",
  },
};
