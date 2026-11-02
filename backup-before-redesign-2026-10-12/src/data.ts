import type { IconName } from './icons.ts'

// ─────────────────────────────────────────────────────────────────────
//  ✏️  EDIT THIS FILE to put your own info on the website.
//  Every piece of text, every project and every link on the page
//  comes from here. Save the file and the browser updates by itself.
// ─────────────────────────────────────────────────────────────────────

export const profile = {
  name: 'Mic Dahryl Caybin',
  role: 'Web & Mobile Developer',
  location: 'Tagbilaran City, Philippines',

  // Shows the green "Available for new projects" badge. Set to false when you're fully booked.
  available: true,

  // The words that type out after "I build ..." in the big heading.
  typing: ['web apps.', 'mobile apps.', 'fast websites.', 'landing pages.'],

  intro:
    'I turn ideas into web and mobile apps that work well, run fast, and are accessible and easy for everyone to use.',

  about: [
    'I’m Mic Dahryl, a 3rd-year Computer Science student from Tagbilaran City, Philippines. I’ve been coding since my first year in college, and I’m still learning something new with every project.',
    'I enjoy building web apps. What I like most is taking an idea and making it real: functional, efficient, accessible and easy to use.',
    'Right now I’m building SPOT, a campus talent app for Bohol Island State University. If you have an idea you want to bring to life, I’d love to hear about it.',
  ],

  // Put your photo in the public/ folder (for example public/me.jpg) and write '/me.jpg'.
  // Leave it empty to show your initials instead.
  photo: 'my-photo.png',

  // Put your CV in the public/ folder (for example public/cv.pdf) and write '/cv.pdf'.
  // Leave it empty to hide the "Download CV" button.
  cvUrl: '',

  email: 'caybinmicdahryl01@gmail.com',

  // Contact form: create a free form at https://formspree.io and paste its ID here
  // (the part after /f/ in the form URL, for example 'xyzabcde').
  // Leave it empty and the form will open the visitor's email app instead.
  formspreeId: 'xaeqjanl',

  // Supported icons: GitHub, LinkedIn, X / Twitter, Instagram. Anything else gets a link icon.
  socials: [
    { label: 'GitHub', url: 'https://github.com/miccyyxxmhrga01' },
    { label: 'LinkedIn', url: 'https://www.linkedin.com/in/mic-dahryl-caybin-6a995a403/' },
  ],
}

// The numbers under the big heading. The row stays hidden while this list is empty.
// Add real numbers when you have them, for example:
//   { value: 2, suffix: '+', label: 'Years coding' },
//   { value: 5, label: 'Projects delivered' },
export const stats: Stat[] = []

// Shown in the scrolling strip and in the About section. The first 3 also appear in the code window.
export const skills: string[] = [
  'Kotlin',
  'Supabase',
  'Firebase',
  'Jetpack Compose',
  'Android',
  'Figma',
  'HTML',
  'CSS',
  'JavaScript',
  'Cloudinary',
  'Python',
  'TensorFlow',
]

// Your projects. Add new ones to this list as you finish them (copy SPOT's block as a starting point).
// To show a screenshot: put the image in public/projects/ and set image: '/projects/your-image.png'.
// Projects without an image get a generated preview. Optional extras:
//   device: 'phone'  → shows the preview/screenshot inside a phone (for mobile apps)
//   hue: 45          → color of the generated preview (0–360: 0 red, 45 gold, 120 green, 210 blue, 270 purple)
//   liveLabel: '...' → text on the live link button (default: 'View live site')
//   logo: '/projects/your-logo.png' → small round app icon shown on the generated preview
//   status: 'In progress' → small badge on the project; remove it when the project is finished
//   codeUrl: '...'   → link to the source code (for example on GitHub)
export const projects: Project[] = [
  {
    title: 'SPOT: Campus Talent App',
    category: 'Mobile App',
    year: '2026',
    summary:
      'An Android app where students at Bohol Island State University show their talents, join events and connect with each other.',
    description:
      'SPOT is a social app made for the BISU campus. Students share photos, videos and stories of their talents, find events and communities, and message each other. I’m building it with Kotlin and Jetpack Compose, using Supabase for accounts, the database and real-time chat, and Cloudinary for photos and videos.',
    highlights: [
      'Posts, reels and stories with photo and video editing',
      'Real-time messaging and push notifications',
      'Events with applications, communities and collaborations',
      'AI that suggests captions and recognizes talents in photos',
      'Share links that open straight in the app',
    ],
    tech: ['Kotlin', 'Jetpack Compose', 'Supabase', 'Firebase', 'Cloudinary', 'TensorFlow'],
    liveUrl: 'https://spot-bisu.web.app',
    liveLabel: 'Get the app',
    device: 'phone',
    hue: 45,
    logo: '/projects/spot-logo.png',
    status: 'In progress',
  },
]

// What you offer clients. Icons: monitor, phone, rocket, cart, code, gauge, wrench.
export const services: Service[] = [
  {
    icon: 'code',
    title: 'Web apps',
    text: 'Custom tools for your business, like dashboards, booking systems and member areas.',
  },
  {
    icon: 'phone',
    title: 'Mobile apps',
    text: 'Android apps with accounts, real-time chat and notifications, built with Kotlin and Jetpack Compose.',
  },
  {
    icon: 'monitor',
    title: 'Business websites',
    text: 'A professional website that shows who you are, what you offer and how to reach you.',
  },
  {
    icon: 'rocket',
    title: 'Landing pages',
    text: 'One focused page for a product, event or launch, designed to get sign-ups and sales.',
  },
  {
    icon: 'gauge',
    title: 'Speed & SEO',
    text: 'Make your current site faster, mobile-friendly and easier to find on Google.',
  },
  {
    icon: 'wrench',
    title: 'Care & updates',
    text: 'Updates, backups and small changes so your website keeps running smoothly.',
  },
]

// How working with you goes, step by step.
export const steps: Step[] = [
  { title: 'Talk', text: 'We talk about your business, your goals and your budget. Free and no pressure.' },
  { title: 'Plan & design', text: 'You get a clear plan, price and timeline, then a design to approve.' },
  { title: 'Build', text: 'I build your site and share progress, so you can give feedback along the way.' },
  { title: 'Launch & support', text: 'Your site goes live, I show you how to use it, and I stay available for help.' },
]

// Options in the "Budget" dropdown of the contact form. Change the prices to fit your rates.
export const budgets: string[] = [
  'Under ₱10,000',
  '₱10,000 – ₱30,000',
  '₱30,000 – ₱80,000',
  '₱80,000+',
  'Not sure yet',
]

// Reviews from real clients. The section stays hidden while this list is empty.
// Example:
//   { quote: 'Our new website brought in more customers in the first month.', name: 'Maria Santos', role: 'Owner, Sunrise Bakery' },
export const testimonials: Testimonial[] = []

// ─── Types (you don't need to change these) ──────────────────────────

export type Stat = { value: number; suffix?: string; label: string }

export type Project = {
  title: string
  category: string
  year?: string
  summary: string
  description: string
  highlights?: string[]
  tech: string[]
  image?: string
  liveUrl?: string
  liveLabel?: string
  codeUrl?: string
  device?: 'phone'
  hue?: number
  logo?: string
  status?: string
}

export type Service = { icon: IconName; title: string; text: string }

export type Step = { title: string; text: string }

export type Testimonial = { quote: string; name: string; role: string }
