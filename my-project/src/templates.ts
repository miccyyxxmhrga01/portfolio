// Builds the HTML for each part of the page from the content in data.ts.
// The layout follows bryllim.com (sidebar menu, photo next to your name, numbered sections);
// the colors, fonts and effects are this site's own.
import { profile, facts, stats, skills, projects, services, steps, budgets, testimonials } from './data.ts'
import type { Project } from './data.ts'
import { icon, socialIcon, type IconName } from './icons.ts'

// Makes text safe to put inside HTML (so characters like < or & can't break the page).
const esc = (value: string) => value.replace(/[&<>"']/g, (ch) => `&#${ch.charCodeAt(0)};`)

const initials = profile.name
  .split(/\s+/)
  .filter(Boolean)
  .slice(0, 2)
  .map((word) => word[0])
  .join('')
  .toUpperCase()

const firstName = profile.name.split(/\s+/)[0] ?? profile.name

// Links in the sidebar. Each one scrolls to the section with the same id.
const navLinks: { id: string; label: string; icon: IconName }[] = [
  { id: 'work', label: 'Projects', icon: 'folder' },
  { id: 'services', label: 'Services', icon: 'briefcase' },
  { id: 'process', label: 'Process', icon: 'list' },
  { id: 'about', label: 'About', icon: 'user' },
  { id: 'contact', label: 'Contact', icon: 'mail' },
]

// Second group in the sidebar: your live projects and social profiles (they open in a new tab).
const outsideLinks = [
  ...projects.filter((p) => p.liveUrl).map((p) => ({ label: p.title.split(':')[0], url: p.liveUrl ?? '' })),
  ...profile.socials,
]

const themes: { value: string; label: string; icon: IconName }[] = [
  { value: 'system', label: 'Match my device', icon: 'monitor' },
  { value: 'light', label: 'Light theme', icon: 'sun' },
  { value: 'dark', label: 'Dark theme', icon: 'moon' },
]

// Keyboard shortcuts shown in the sidebar (the keys are handled in interactions.ts).
const shortcuts: { action: string; label: string; key: string; icon: IconName }[] = [
  { action: 'chat', label: 'Ask anything', key: 'K', icon: 'sparkles' },
  { action: 'copy', label: 'Copy email', key: 'C', icon: 'copy' },
  { action: 'message', label: 'Message me', key: 'M', icon: 'send' },
]

// Small "01 — projects" label, then the section's big title and an optional intro line.
function sectionHead(num: string, label: string, title: string, lead = '', aside = '') {
  return `
    <div class="sec-head reveal">
      <p class="eyebrow"><span>${num} — ${label}</span>${aside ? `<span class="eyebrow-aside">${aside}</span>` : ''}</p>
      <h2>${title}</h2>
      ${lead ? `<p class="lead">${lead}</p>` : ''}
    </div>`
}

function socialLinks() {
  return `
    <ul class="socials">
      ${profile.socials
        .map(
          (s) => `
        <li><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(s.label)}">${socialIcon(s.label)}</a></li>`,
        )
        .join('')}
    </ul>`
}

function logo() {
  return `<a href="#top" class="logo" aria-label="${esc(profile.name)}, back to top">${esc(profile.name)}</a>`
}

function themeSwitch() {
  return `
    <div class="theme-switch" role="group" aria-label="Color theme">
      ${themes
        .map(
          (t) =>
            `<button type="button" data-theme-choice="${t.value}" aria-pressed="false" aria-label="${t.label}" title="${t.label}">${icon(t.icon)}</button>`,
        )
        .join('')}
    </div>`
}

function statusBadge(p: Project) {
  return p.status ? `<span class="status"><span class="status-dot"></span>${esc(p.status)}</span>` : ''
}

function projectMeta(p: Project) {
  return esc(p.category) + (p.year ? ` · ${esc(p.year)}` : '')
}

function projectMedia(p: Project, index: number) {
  // Preview color: the project's own hue, or one picked from its position in the list.
  const hue = p.hue ?? (index * 67 + 255) % 360
  const screenshot = p.image
    ? `<img src="${esc(p.image)}" alt="Screenshot of ${esc(p.title)}" loading="lazy">`
    : ''
  const miniLogo = p.logo ? `<img class="mini-logo" src="${esc(p.logo)}" alt="">` : ''

  if (p.device === 'phone') {
    // Mobile app: the screenshot (or a drawn app screen) inside a phone, with the app icon beside it.
    const name = esc(p.title.split(':')[0])
    return `
    <div class="placeholder is-phone" style="--hue:${hue}">
      ${p.logo ? `<img class="app-icon" src="${esc(p.logo)}" alt="${name} logo">` : ''}
      <div class="phone">
        ${
          screenshot ||
          `<div class="phone-ui" aria-hidden="true">
          <span class="phone-notch"></span>
          <p class="phone-title">${miniLogo}${name}</p>
          <div class="phone-stories"><i></i><i></i><i></i><i></i></div>
          <span class="phone-post"></span>
          <span class="mock-line" style="width:80%"></span>
          <span class="mock-line" style="width:55%"></span>
        </div>`
        }
      </div>
    </div>`
  }

  if (screenshot) return screenshot
  // No screenshot yet: draw a small browser window.
  return `
    <div class="placeholder" style="--hue:${hue}" aria-hidden="true">
      <div class="mock">
        <div class="mock-bar"><i></i><i></i><i></i></div>
        <p class="mock-title">${miniLogo}${esc(p.title)}</p>
        <span class="mock-line" style="width:70%"></span>
        <span class="mock-line" style="width:45%"></span>
        <div class="mock-grid"><i></i><i></i><i></i></div>
      </div>
    </div>`
}

// Interactive dots + glow behind everything (drawn by initBackground in interactions.ts).
function background() {
  return `
    <div class="bg" aria-hidden="true">
      <canvas class="bg-canvas"></canvas>
      <div class="bg-glow"></div>
    </div>
    <div class="progress" aria-hidden="true"><span></span></div>`
}

// Only shown on phones and small tablets, where the sidebar becomes a drop-down menu.
function topbar() {
  return `
    <header class="topbar">
      ${logo()}
      <button class="menu-btn" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="sidebar">
        ${icon('menu', 'icon-menu')}${icon('close', 'icon-close')}
      </button>
    </header>`
}

// Same layout as the sidebar on bryllim.com: name, menu, links, shortcuts, status, theme and email.
function sidebar() {
  return `
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-logo">${logo()}</div>
      <nav class="sidebar-scroll" aria-label="Main">
        <div class="nav-group">
          ${navLinks
            .map(
              (l) =>
                `<a href="#${l.id}" data-nav="${l.id}"><span class="nav-arrow" aria-hidden="true">→</span>${icon(l.icon)}${l.label}</a>`,
            )
            .join('')}
        </div>
        <div class="nav-group nav-plain">
          ${outsideLinks
            .map(
              (l) =>
                `<a href="${esc(l.url)}" target="_blank" rel="noopener noreferrer">${esc(l.label)}<span aria-hidden="true">↗</span></a>`,
            )
            .join('')}
        </div>
      </nav>
      <div class="sidebar-bottom">
        <div class="shortcuts">
          ${shortcuts
            .map(
              (s) =>
                `<button type="button" class="shortcut" data-shortcut="${s.action}" aria-keyshortcuts="Alt+${s.key}">${icon(s.icon)}<span class="shortcut-text">${s.label}</span><span class="keys" aria-hidden="true"><kbd>Alt</kbd>+<kbd>${s.key}</kbd></span></button>`,
            )
            .join('')}
        </div>
        ${
          profile.available
            ? `<p class="sidebar-status"><span class="pulse"></span>Available for new projects</p>`
            : ''
        }
        ${themeSwitch()}
        <div class="sidebar-contact">
          <p>For projects, questions or just to say hi, reach me at</p>
          <a href="mailto:${esc(profile.email)}">${icon('mail')}<span>${esc(profile.email).replace('@', '<wbr>@')}</span></a>
        </div>
      </div>
    </aside>`
}

function hero() {
  const photo = profile.photo
    ? `<img src="${esc(profile.photo)}" alt="Photo of ${esc(profile.name)}" width="320" height="320">`
    : `<div class="avatar" aria-hidden="true">${esc(initials)}</div>`

  return `
    <section class="hero" id="top">
      <div class="portrait reveal">${photo}</div>
      <div class="hero-text">
        ${profile.available ? `<p class="badge reveal"><span class="pulse"></span>Available for new projects</p>` : ''}
        <h1 class="reveal" style="--d:1">
          <span class="h1-hi">Hi, I’m</span>
          <span class="grad">${esc(profile.name)}</span>
        </h1>
        <p class="typed-line reveal" style="--d:2">I build <span class="typed" aria-hidden="true">${esc(profile.typing[0] ?? '')}</span><span class="caret" aria-hidden="true"></span><span class="sr-only">${esc(profile.typing.join(' '))}</span></p>
        <p class="hero-intro reveal" style="--d:2">${esc(profile.intro)}</p>
        <div class="hero-actions reveal" style="--d:3">
          <a href="#work" class="btn btn-primary">See my work ${icon('arrowRight')}</a>
          <a href="#contact" class="btn btn-ghost">Get in touch</a>
        </div>
        <div class="reveal" style="--d:3">${socialLinks()}</div>
      </div>
    </section>
    ${factsRow()}`
}

// The strip under the hero: short facts, then the numbers in `stats` (if you add any).
function factsRow() {
  if (!facts.length && !stats.length) return ''
  const factCells = facts.map(
    (f) => `
      <li class="fact">
        <span class="fact-icon">${icon(f.icon)}</span>
        <div><strong>${esc(f.value)}</strong><span>${esc(f.label)}</span></div>
      </li>`,
  )
  const statCells = stats.map(
    (s) => `
      <li class="fact stat">
        <div><strong>${s.value}${esc(s.suffix ?? '')}</strong><span>${esc(s.label)}</span></div>
      </li>`,
  )
  return `<ul class="facts reveal" style="--d:3">${[...factCells, ...statCells].join('')}</ul>`
}

// One project card. The first three projects are fanned out like a hand of cards.
function projectCard(p: Project, index: number) {
  const logo = p.logo ? `<img src="${esc(p.logo)}" alt="" loading="lazy">` : esc(p.title[0] ?? '')

  return `
    <article class="card spot" data-pos="${index}">
      <div class="card-top">
        ${statusBadge(p)}
        <p class="project-meta">${projectMeta(p)}</p>
      </div>
      <div class="card-title">
        <div class="card-logo" aria-hidden="true">${logo}</div>
        <h3>${esc(p.title)}</h3>
      </div>
      <p class="card-text">${esc(p.summary)}</p>
      <ul class="tags">${p.tech.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
      <div class="card-actions">
        ${
          p.liveUrl
            ? `<a class="btn btn-primary btn-sm" href="${esc(p.liveUrl)}" target="_blank" rel="noopener noreferrer">${esc(p.liveLabel ?? 'View live site')} ${icon('arrowUpRight')}</a>`
            : ''
        }
        <button type="button" class="btn btn-ghost btn-sm" data-project="${index}">Details<span class="sr-only">: ${esc(p.title)}</span></button>
      </div>
    </article>`
}

function work(num: string) {
  const fanned = projects.slice(0, 3)
  const rest = projects.slice(3)
  const count = `${projects.length} ${projects.length === 1 ? 'project' : 'projects'}`

  return `
    <section class="section" id="work">
      ${sectionHead(num, 'projects', 'My projects', 'Open a project to see what it does and the tech behind it.', count)}
      <div class="stack reveal">${fanned.map((p, i) => projectCard(p, i)).join('')}</div>
      ${
        rest.length
          ? `<ul class="rows more-projects">
          ${rest
            .map(
              (p, i) => `
            <li class="row reveal">
              <span class="row-num">${esc(p.year ?? '')}</span>
              <div>
                <h3><button type="button" class="row-link" data-project="${i + 3}">${esc(p.title)}</button></h3>
                <p>${esc(p.summary)}</p>
              </div>
            </li>`,
            )
            .join('')}
        </ul>`
          : ''
      }
    </section>`
}

function servicesSection(num: string) {
  return `
    <section class="section" id="services">
      ${sectionHead(num, 'services', 'How I can help your business', 'From a simple website to a full web or mobile app, here’s what I can build for you.')}
      <ul class="services">
        ${services
          .map(
            (s, i) => `
          <li class="service spot reveal" style="--d:${i % 2}">
            <div class="service-icon">${icon(s.icon)}</div>
            <h3>${esc(s.title)}</h3>
            <p>${esc(s.text)}</p>
          </li>`,
          )
          .join('')}
      </ul>
    </section>`
}

function processSection(num: string) {
  return `
    <section class="section" id="process">
      ${sectionHead(num, 'process', 'Simple process, no surprises', 'You always know what’s happening, what’s next and what it costs.')}
      <ol class="rows">
        ${steps
          .map(
            (s, i) => `
          <li class="row reveal">
            <span class="row-num">${String(i + 1).padStart(2, '0')}</span>
            <div>
              <h3>${esc(s.title)}</h3>
              <p>${esc(s.text)}</p>
            </div>
          </li>`,
          )
          .join('')}
      </ol>
    </section>`
}

function about(num: string) {
  return `
    <section class="section" id="about">
      ${sectionHead(num, 'about', `Nice to meet you, I’m ${esc(firstName)}`)}
      <div class="prose">
        ${profile.about.map((p) => `<p class="reveal">${esc(p)}</p>`).join('')}
      </div>
      <h3 class="small-head reveal">Tools I work with</h3>
      <ul class="chips reveal">${skills.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
      <div class="about-actions reveal">
        <a href="#contact" class="btn btn-primary">Let’s work together ${icon('arrowRight')}</a>
        ${profile.cvUrl ? `<a href="${esc(profile.cvUrl)}" class="btn btn-ghost" download>${icon('download')} Download CV</a>` : ''}
      </div>
    </section>`
}

function testimonialsSection(num: string) {
  return `
    <section class="section" id="testimonials">
      ${sectionHead(num, 'kind words', 'What clients say')}
      <div class="quotes">
        ${testimonials
          .map(
            (t, i) => `
          <figure class="quote reveal" style="--d:${i % 3}">
            <blockquote>“${esc(t.quote)}”</blockquote>
            <figcaption><strong>${esc(t.name)}</strong><span>${esc(t.role)}</span></figcaption>
          </figure>`,
          )
          .join('')}
      </div>
    </section>`
}

// One labelled form field. Required fields get a red * next to the label.
function field(id: string, label: string, control: string, required = false, full = false) {
  return `
    <div class="field${full ? ' field-full' : ''}">
      <label for="${id}">${label}${required ? '<span class="req" aria-hidden="true">*</span>' : ''}</label>
      ${control}
    </div>`
}

// Contact form laid out like the "consulting inquiry" card on bryllim.com:
// a header band, labelled fields in two columns, and a footer with the email and send button.
function contact(num: string) {
  return `
    <section class="section" id="contact">
      ${sectionHead(num, 'contact', 'Let’s work together')}
      <form class="contact-form inquiry reveal">
        <div class="inquiry-head">
          <div>
            <p class="inquiry-label">Project inquiry</p>
            <h3>Tell me about your project</h3>
            <p>Share the basics and I’ll reply with ideas, a price and next steps. The more you tell me, the more useful my first reply will be.</p>
          </div>
          <span class="inquiry-icon" aria-hidden="true">${icon('messageSquare')}</span>
        </div>

        <div class="inquiry-body">
          <div class="field-grid">
            ${field('f-name', 'Name', '<input id="f-name" name="name" type="text" autocomplete="name" placeholder="Your name" required>', true)}
            ${field('f-email', 'Email', '<input id="f-email" name="email" type="email" autocomplete="email" placeholder="you@example.com" required>', true)}
            ${field('f-company', 'Company / business', '<input id="f-company" name="company" type="text" autocomplete="organization" placeholder="Optional">')}
            ${field('f-need', 'What do you need?', '<input id="f-need" name="need" type="text" placeholder="e.g. business website, mobile app" required>', true)}
            ${field(
              'f-budget',
              'Budget range',
              `<select id="f-budget" name="budget">
                <option value="">Select one (optional)</option>
                ${budgets.map((b) => `<option>${esc(b)}</option>`).join('')}
              </select>`,
            )}
            ${field('f-timeline', 'Ideal timeline', '<input id="f-timeline" name="timeline" type="text" placeholder="e.g. next month, before December, flexible">')}
            ${field(
              'f-message',
              'Project details',
              '<textarea id="f-message" name="message" rows="6" required placeholder="What do you want to build, who is it for, and what would a great result look like?"></textarea>',
              true,
              true,
            )}
          </div>
          <p class="field-note">Please don’t include passwords or other private information.</p>
        </div>

        <div class="inquiry-foot">
          <p>
            Prefer email? <a href="mailto:${esc(profile.email)}">${esc(profile.email)}</a>
            <button type="button" class="copy-btn" data-copy="${esc(profile.email)}">
              ${icon('copy', 'icon-copy')}${icon('check', 'icon-check')}<span>Copy</span>
            </button>
          </p>
          <button type="submit" class="btn btn-primary">Send inquiry ${icon('arrowRight')}</button>
        </div>
        <p class="form-status" role="status" aria-live="polite"></p>

        <input type="hidden" name="_subject" value="New project inquiry from your portfolio">
        <input class="hp" type="text" name="_gotcha" tabindex="-1" autocomplete="off" aria-hidden="true">
      </form>
    </section>`
}

// "Ask me anything" button (bottom right) and the chat window it opens (see chat.ts).
function chatWidget() {
  return `
    <button class="chat-fab" type="button" aria-controls="chat" aria-expanded="false">
      ${icon('sparkles')}<span>Ask me anything</span>
    </button>
    <section class="chat" id="chat" role="dialog" aria-labelledby="chat-title" hidden>
      <header class="chat-head">
        <img class="chat-avatar" src="/favicon.png" alt="" width="40" height="40">
        <div>
          <h2 id="chat-title">Ask about ${esc(firstName)}</h2>
          <p>${profile.chatUrl ? 'AI assistant · answers can be wrong' : 'Quick answers from this portfolio'}</p>
        </div>
        <button type="button" class="chat-close" aria-label="Close chat">${icon('close')}</button>
      </header>
      <div class="chat-log" role="log" aria-live="polite"></div>
      <div class="chat-chips" aria-label="Suggested questions"></div>
      <form class="chat-form">
        <label for="chat-input" class="sr-only">Your question</label>
        <input id="chat-input" type="text" maxlength="500" autocomplete="off" placeholder="Ask about projects, skills, prices…">
        <button type="submit" aria-label="Send">${icon('send')}</button>
      </form>
    </section>`
}

function footer() {
  return `
    <footer class="footer wrap">
      <p>© ${new Date().getFullYear()} ${esc(profile.name)}. All rights reserved.</p>
      <a href="#top" class="to-top">Back to top ${icon('arrowUp')}</a>
    </footer>`
}

export function projectModal(p: Project, index: number) {
  const links = [
    p.liveUrl
      ? `<a class="btn btn-primary" href="${esc(p.liveUrl)}" target="_blank" rel="noopener noreferrer">${esc(p.liveLabel ?? 'View live site')} ${icon('arrowUpRight')}</a>`
      : '',
    p.codeUrl
      ? `<a class="btn btn-ghost" href="${esc(p.codeUrl)}" target="_blank" rel="noopener noreferrer">${icon('github')} Source code</a>`
      : '',
  ].join('')

  return `
    <button class="modal-close" type="button" data-close aria-label="Close">${icon('close')}</button>
    <div class="modal-media">${projectMedia(p, index)}</div>
    <div class="modal-content">
      ${statusBadge(p)}
      <p class="project-meta">${projectMeta(p)}</p>
      <h2 id="modal-title">${esc(p.title)}</h2>
      <p>${esc(p.description)}</p>
      ${
        p.highlights?.length
          ? `<ul class="highlights">${p.highlights.map((h) => `<li>${icon('check')}<span>${esc(h)}</span></li>`).join('')}</ul>`
          : ''
      }
      <ul class="tags">${p.tech.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
      ${links ? `<div class="modal-links">${links}</div>` : ''}
    </div>`
}

export function renderPage() {
  // Sections are numbered in the order they appear; empty ones (like testimonials) are skipped.
  const sections = [
    work,
    servicesSection,
    processSection,
    about,
    testimonials.length ? testimonialsSection : null,
    contact,
  ].filter((section) => section !== null)

  return [
    background(),
    topbar(),
    sidebar(),
    '<div class="page"><main class="wrap">',
    hero(),
    ...sections.map((section, i) => section(String(i + 1).padStart(2, '0'))),
    '</main>',
    footer(),
    '</div>',
    chatWidget(),
    '<dialog class="modal" id="project-modal" aria-labelledby="modal-title" tabindex="-1"><div class="modal-body"></div></dialog>',
  ].join('')
}
