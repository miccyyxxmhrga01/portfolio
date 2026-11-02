// Builds the HTML for each part of the page from the content in data.ts.
import { profile, stats, skills, projects, services, steps, budgets, testimonials } from './data.ts'
import type { Project } from './data.ts'
import { icon, socialIcon } from './icons.ts'

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

const navLinks = [
  { id: 'work', label: 'Work' },
  { id: 'services', label: 'Services' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' },
]

function sectionHead(eyebrow: string, title: string, lead = '') {
  return `
    <div class="section-head reveal">
      <p class="eyebrow">// ${eyebrow}</p>
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

function background() {
  return `
    <div class="bg" aria-hidden="true">
      <div class="bg-grid"></div>
      <div class="bg-grid bg-grid-spot"></div>
      <div class="bg-glow"></div>
    </div>
    <div class="progress" aria-hidden="true"><span></span></div>`
}

function header() {
  return `
    <header class="header">
      <div class="container header-inner">
        <a href="#top" class="logo" aria-label="${esc(profile.name)}, back to top">
          <span class="logo-mark">${esc(initials)}</span>
          <span class="logo-name">${esc(profile.name)}</span>
        </a>
        <nav class="nav" id="nav" aria-label="Main">
          ${navLinks.map((l) => `<a href="#${l.id}" data-nav="${l.id}">${l.label}</a>`).join('')}
          <a href="#contact" class="btn btn-primary btn-sm nav-cta">Hire me</a>
        </nav>
        <button class="menu-btn" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="nav">
          ${icon('menu', 'icon-menu')}${icon('close', 'icon-close')}
        </button>
      </div>
    </header>`
}

function codeCard() {
  const stack = skills
    .slice(0, 3)
    .map((s) => `<span class="t-str">'${esc(s)}'</span>`)
    .join(', ')
  // The <pre> content is kept unindented on purpose: spaces here show up on the page.
  return `
    <div class="hero-visual reveal" style="--d:3">
      <div class="code-card tilt">
        <div class="code-top"><span></span><span></span><span></span><em>developer.ts</em></div>
<pre><code><span class="t-key">const</span> <span class="t-var">developer</span> = {
  <span class="t-prop">name</span>: <span class="t-str">'${esc(profile.name)}'</span>,
  <span class="t-prop">role</span>: <span class="t-str">'${esc(profile.role)}'</span>,
  <span class="t-prop">stack</span>: [${stack}],
  <span class="t-prop">available</span>: <span class="t-bool">${profile.available}</span>,
  <span class="t-fn">hire</span>() {
    <span class="t-key">return</span> <span class="t-str">"Let's build something great"</span>
  },
}</code></pre>
      </div>
    </div>`
}

function hero() {
  const statsRow = stats.length
    ? `
      <div class="stats">
        ${stats
          .map(
            (s, i) => `
          <div class="stat reveal" style="--d:${i + 4}">
            <strong aria-hidden="true"><span data-count="${s.value}">${s.value}</span>${esc(s.suffix ?? '')}</strong>
            <span class="stat-label"><span class="sr-only">${s.value}${esc(s.suffix ?? '')} </span>${esc(s.label)}</span>
          </div>`,
          )
          .join('')}
      </div>`
    : ''

  return `
    <section class="hero" id="top">
      <div class="container">
        <div class="hero-grid">
          <div class="hero-text">
            ${
              profile.available
                ? `<p class="badge reveal"><span class="pulse"></span>Available for new projects</p>`
                : ''
            }
            <h1 class="reveal" style="--d:1">
              <span class="h1-line">Hi, I'm <span class="grad">${esc(profile.name)}</span></span>
              <span class="h1-typed">I build <span class="typed" aria-hidden="true">${esc(profile.typing[0] ?? '')}</span><span class="caret" aria-hidden="true"></span><span class="sr-only">${esc(profile.typing.join(' '))}</span></span>
            </h1>
            <p class="hero-intro reveal" style="--d:2">${esc(profile.intro)}</p>
            <div class="hero-actions reveal" style="--d:2">
              <a href="#work" class="btn btn-primary">See my work ${icon('arrowRight')}</a>
              <a href="#contact" class="btn btn-ghost">Get in touch</a>
            </div>
            <div class="hero-meta reveal" style="--d:3">
              <span class="location">${icon('mapPin')} ${esc(profile.location)}</span>
              ${socialLinks()}
            </div>
          </div>
          ${codeCard()}
        </div>
        ${statsRow}
      </div>
    </section>`
}

function marquee() {
  if (!skills.length) return ''
  // Repeat the list enough times that the strip never shows a gap while it scrolls.
  const copies = Math.max(2, Math.ceil(10 / skills.length) + 1)
  const list = skills.map((s) => `<li>${esc(s)}</li>`).join('')
  return `
    <div class="marquee" style="--copies:${copies}">
      <div class="marquee-track">
        ${Array.from({ length: copies }, (_, i) =>
          i === 0 ? `<ul aria-label="Tools I use">${list}</ul>` : `<ul aria-hidden="true">${list}</ul>`,
        ).join('')}
      </div>
    </div>`
}

function work() {
  const categories = [...new Set(projects.map((p) => p.category))]
  const filters = categories.length > 1
    ? `
      <div class="filters reveal" role="group" aria-label="Filter projects">
        <button type="button" class="chip-btn is-active" data-filter="all" aria-pressed="true">All <span>${projects.length}</span></button>
        ${categories
          .map(
            (c) =>
              `<button type="button" class="chip-btn" data-filter="${esc(c)}" aria-pressed="false">${esc(c)} <span>${projects.filter((p) => p.category === c).length}</span></button>`,
          )
          .join('')}
      </div>`
    : ''

  return `
    <section class="section" id="work">
      <div class="container">
        ${sectionHead('my work', 'My projects', 'Open a project to see what it does and the tech behind it.')}
        ${filters}
        <ul class="projects">
          ${projects
            .map(
              (p, i) => `
            <li class="reveal" data-category="${esc(p.category)}" style="--d:${i % 3}">
              <article class="project tilt spot">
                <div class="project-media">${projectMedia(p, i)}</div>
                ${statusBadge(p)}
                <div class="project-body">
                  <p class="project-meta">${projectMeta(p)}</p>
                  <h3>${esc(p.title)}</h3>
                  <p>${esc(p.summary)}</p>
                  <ul class="tags">${p.tech.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
                </div>
                <button type="button" class="project-open" data-project="${i}"><span class="sr-only">View details: ${esc(p.title)}</span></button>
                <span class="project-more" aria-hidden="true">Details ${icon('arrowUpRight')}</span>
              </article>
            </li>`,
            )
            .join('')}
        </ul>
      </div>
    </section>`
}

function servicesSection() {
  return `
    <section class="section" id="services">
      <div class="container">
        ${sectionHead('services', 'How I can help your business', 'From a simple website to a full web or mobile app, here’s what I can build for you.')}
        <div class="services">
          ${services
            .map(
              (s, i) => `
            <article class="service spot reveal" style="--d:${i % 3}">
              <div class="service-icon">${icon(s.icon)}</div>
              <h3>${esc(s.title)}</h3>
              <p>${esc(s.text)}</p>
            </article>`,
            )
            .join('')}
        </div>
      </div>
    </section>`
}

function processSection() {
  return `
    <section class="section" id="process">
      <div class="container">
        ${sectionHead('how it works', 'Simple process, no surprises', 'You always know what’s happening, what’s next and what it costs.')}
        <ol class="steps">
          ${steps
            .map(
              (s, i) => `
            <li class="step reveal" style="--d:${i}">
              <span class="step-num">${String(i + 1).padStart(2, '0')}</span>
              <h3>${esc(s.title)}</h3>
              <p>${esc(s.text)}</p>
            </li>`,
            )
            .join('')}
        </ol>
      </div>
    </section>`
}

function about() {
  const photo = profile.photo
    ? `<img src="${esc(profile.photo)}" alt="Photo of ${esc(profile.name)}" loading="lazy">`
    : `<div class="avatar" aria-hidden="true">${esc(initials)}</div>`

  return `
    <section class="section" id="about">
      <div class="container about-grid">
        <div class="about-photo reveal">${photo}</div>
        <div class="about-text">
          ${sectionHead('about me', `Nice to meet you, I’m ${esc(firstName)}`)}
          ${profile.about.map((p, i) => `<p class="reveal" style="--d:${i + 1}">${esc(p)}</p>`).join('')}
          <h3 class="small-head reveal">Tools I work with</h3>
          <ul class="chips reveal">${skills.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
          <div class="about-actions reveal">
            <a href="#contact" class="btn btn-primary">Let’s work together ${icon('arrowRight')}</a>
            ${profile.cvUrl ? `<a href="${esc(profile.cvUrl)}" class="btn btn-ghost" download>${icon('download')} Download CV</a>` : ''}
          </div>
        </div>
      </div>
    </section>`
}

function testimonialsSection() {
  if (!testimonials.length) return ''
  return `
    <section class="section" id="testimonials">
      <div class="container">
        ${sectionHead('kind words', 'What clients say')}
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
      </div>
    </section>`
}

function contact() {
  return `
    <section class="section" id="contact">
      <div class="container contact-grid">
        <div class="contact-info">
          ${sectionHead('contact', 'Let’s work together', 'Have a project in mind? Tell me a little about it and I’ll get back to you with ideas and a price.')}
          <div class="email-box reveal">
            <a class="email-link" href="mailto:${esc(profile.email)}">${icon('mail')}<span>${esc(profile.email)}</span></a>
            <button type="button" class="copy-btn" data-copy="${esc(profile.email)}">
              ${icon('copy', 'icon-copy')}${icon('check', 'icon-check')}<span>Copy</span>
            </button>
          </div>
          <div class="reveal">${socialLinks()}</div>
        </div>

        <form class="contact-form reveal" style="--d:1">
          <div class="field-row">
            <div class="field">
              <label for="f-name">Your name</label>
              <input id="f-name" name="name" type="text" autocomplete="name" required>
            </div>
            <div class="field">
              <label for="f-email">Email</label>
              <input id="f-email" name="email" type="email" autocomplete="email" required>
            </div>
          </div>
          <div class="field">
            <label for="f-budget">Budget</label>
            <select id="f-budget" name="budget">
              <option value="">Choose a range (optional)</option>
              ${budgets.map((b) => `<option>${esc(b)}</option>`).join('')}
            </select>
          </div>
          <div class="field">
            <label for="f-message">About your project</label>
            <textarea id="f-message" name="message" rows="5" required placeholder="What do you need, and when do you need it?"></textarea>
          </div>
          <input type="hidden" name="_subject" value="New project enquiry from your portfolio">
          <input class="hp" type="text" name="_gotcha" tabindex="-1" autocomplete="off" aria-hidden="true">
          <button type="submit" class="btn btn-primary">Send message ${icon('send')}</button>
          <p class="form-status" role="status" aria-live="polite"></p>
        </form>
      </div>
    </section>`
}

function footer() {
  return `
    <footer class="footer">
      <div class="container footer-inner">
        <p>© ${new Date().getFullYear()} ${esc(profile.name)}. All rights reserved.</p>
        <a href="#top" class="to-top">Back to top ${icon('arrowUp')}</a>
      </div>
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
  return [
    background(),
    header(),
    '<main>',
    hero(),
    marquee(),
    work(),
    servicesSection(),
    processSection(),
    about(),
    testimonialsSection(),
    contact(),
    '</main>',
    footer(),
    '<dialog class="modal" id="project-modal" aria-labelledby="modal-title" tabindex="-1"><div class="modal-body"></div></dialog>',
  ].join('')
}
