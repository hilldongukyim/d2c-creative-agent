import anitaImg from '@/assets/Anita_profile.jpeg';
import benImg from '@/assets/Ben-profile.jpeg';
import claraImg from '@/assets/Clara-profile.png';
import lunaImg from '@/assets/Luna-profile.png';
import miloImg from '@/assets/Milo-profile.png';
import noaImg from '@/assets/Noa-profile.png';
import rexImg from '@/assets/Rex-profile.png';
import veraImg from '@/assets/Vera-profile.png';
import yumiImg from '@/assets/Yumi-profile.png';

export interface FlowStep {
  step: number;
  title: string;
  desc: string;
}

export interface CrewData {
  role: string;
  image: string;
  description: string;
  personality?: string;
  flowSteps?: FlowStep[];
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
    role: "Promotional Banner Design",
    image: yumiImg,
    description: "Yumi designs on-brand promotional banners for LG Electronics — web, email, and social formats — fully compliant with LG EI guidelines.",
    personality: "Executes requests immediately, interested in fast and efficient design.",
    flowSteps: [
      { step: 1, title: "Input Campaign Brief", desc: "Enter the campaign name, key message, product info, and any mandatory brand copy or disclaimers." },
      { step: 2, title: "Select Format", desc: "Choose banner size and channel (web banner, email header, social card) and preferred layout style." },
      { step: 3, title: "Generate Design", desc: "Yumi produces brand-compliant banner designs following LG EI typography, color, and spacing rules." },
      { step: 4, title: "Review & Download", desc: "Preview all size variants, request tweaks, and download print-ready or web-optimized files." },
    ],
    isComingSoon: false,
    ctaLabel: "Work with Yumi",
    ctaUrl: "https://yumi-twincrew.web.app/",
  },
  ben: {
    role: "PTO Product Thumbnail Image Generate",
    image: benImg,
    description: "Ben generates high-quality PTO (Product Thumbnail Only) images for LG's dotcom gallery. Accurate product data + consistent visual quality — no photo shoot required.",
    personality: "Very interested in dotcom gallery image domain and continuously learning.",
    flowSteps: [
      { step: 1, title: "Enter Model Info", desc: "Input the model number, category, and color variant. Ben automatically retrieves the relevant product spec." },
      { step: 2, title: "Select Shot Type", desc: "Choose from hero shot, angle views, or all-in-one pack to match your dotcom page requirements." },
      { step: 3, title: "Generate Image", desc: "Ben processes the request and returns high-resolution PTO thumbnail images within seconds." },
      { step: 4, title: "Download", desc: "Review the output, request adjustments if needed, and download directly to your workspace." },
    ],
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
    role: "Lifestyle Product Imagery Generate",
    image: anitaImg,
    description: "Anita creates photorealistic lifestyle imagery that showcases LG products in natural, aspirational settings — no photographer or studio required.",
    personality: "Creative and artistic, excels at capturing lifestyle moments.",
    flowSteps: [
      { step: 1, title: "Describe the Scene", desc: "Input product name and lifestyle context — room type, mood, target consumer, and usage scenario." },
      { step: 2, title: "Set Visual Style", desc: "Select tone (bright / warm / minimal) and composition preference to match your campaign direction." },
      { step: 3, title: "Generate", desc: "Anita creates photorealistic lifestyle imagery with the product naturally integrated into the scene." },
      { step: 4, title: "Refine & Export", desc: "Request variations or scene adjustments, then export in your preferred resolution and format." },
    ],
    isComingSoon: false,
    ctaLabel: "Work with Anita",
    ctaUrl: "https://anita-twincrew.vercel.app/",
  },
  milo: {
    role: "CRM & Newsletter Content Generate",
    image: miloImg,
    description: "Milo generates production-ready CRM email and newsletter content — structured in modular blocks, brand-compliant, and ready to send.",
    personality: "Detail-oriented and creative, excels at crafting email content.",
    flowSteps: [
      { step: 1, title: "Define Campaign", desc: "Input the campaign goal, product highlights, target audience segment, and key message to communicate." },
      { step: 2, title: "Choose Template", desc: "Select a modular email layout that fits your content structure — hero, feature list, promo, or mixed." },
      { step: 3, title: "Generate Content", desc: "Milo fills each module with optimized copy, visual placement, and CTA suggestions per brand guidelines." },
      { step: 4, title: "Export HTML", desc: "Review the complete email in preview, make final edits, and export production-ready HTML for deployment." },
    ],
    isComingSoon: false,
    ctaLabel: "Work with Milo",
    ctaUrl: "https://milo-twincrew.web.app/",
  },
  luna: {
    role: "Personalized Marketing",
    image: lunaImg,
    description: "Luna will support personalized marketing workflows with tailored on-site experiences and audience-aware activation.",
    isComingSoon: true,
  },
  clara: {
    role: "CRM Operations",
    image: claraImg,
    description: "Clara will support CRM operations with lifecycle execution and customer communications coordination.",
    isComingSoon: true,
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
