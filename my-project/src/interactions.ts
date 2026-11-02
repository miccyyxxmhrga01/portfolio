// Everything that moves or reacts on the page: menu, interactive background, animations, project cards, popup and contact form.
import { profile, projects } from './data.ts'
import { projectModal } from './templates.ts'
import { initChat, openChat } from './chat.ts'

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches

// Set by initMenu; lets other parts of the page close the phone menu.
let closeMenu = () => {}

export function initInteractions() {
  initMenu()
  initTheme()
  initChat()
  initShortcuts()
  initBackground()
  initProgress()
  initTyping()
  initReveal()
  initActiveNav()
  initSpotlight()
  initCardStack()
  initModal()
  initCopyEmail()
  initContactForm()
}

// On phones the sidebar opens as a full-screen menu from the button in the top bar.
function initMenu() {
  const button = document.querySelector<HTMLButtonElement>('.menu-btn')
  if (!button) return

  const setOpen = (open: boolean) => {
    document.body.classList.toggle('menu-open', open)
    button.setAttribute('aria-expanded', String(open))
    button.setAttribute('aria-label', open ? 'Close menu' : 'Open menu')
  }
  button.addEventListener('click', () => setOpen(button.getAttribute('aria-expanded') !== 'true'))
  document.querySelectorAll('.sidebar a').forEach((link) => link.addEventListener('click', () => setOpen(false)))
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setOpen(false)
  })
  // Close it if the window gets wide enough to show the normal sidebar.
  window.matchMedia('(min-width: 1024px)').addEventListener('change', () => setOpen(false))
  closeMenu = () => setOpen(false)
}

// The system / light / dark buttons in the sidebar. The choice is remembered for the next visit;
// a small script in index.html applies it before the page appears, so it never flashes the wrong theme.
function initTheme() {
  const buttons = document.querySelectorAll<HTMLButtonElement>('[data-theme-choice]')
  const root = document.documentElement

  const apply = (choice: string) => {
    if (choice === 'light' || choice === 'dark') root.dataset.theme = choice
    else delete root.dataset.theme
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.themeChoice === choice)))
  }

  let saved = 'system'
  try {
    saved = localStorage.getItem('theme') ?? 'system'
  } catch {
    // Storage blocked (private window): just follow the device setting.
  }
  apply(saved)

  buttons.forEach((button) =>
    button.addEventListener('click', () => {
      const choice = button.dataset.themeChoice ?? 'system'
      apply(choice)
      try {
        if (choice === 'system') localStorage.removeItem('theme')
        else localStorage.setItem('theme', choice)
      } catch {
        // Not saved, but the theme still changes for this visit.
      }
    }),
  )
}

// Shortcuts listed in the sidebar: Alt + K opens the chat, Alt + C copies your email,
// Alt + M jumps to the contact form. The rows in the sidebar are buttons too, so they also work with a click or tap.
function initShortcuts() {
  const run = (action: string) => {
    const button = document.querySelector<HTMLElement>(`[data-shortcut="${action}"]`)
    if (action === 'chat') {
      closeMenu()
      openChat()
    }
    if (action === 'copy') copyEmail(button?.querySelector('.shortcut-text') ?? null)
    if (action === 'message') {
      closeMenu()
      // Focus first: focusing after the smooth scroll starts would stop the scroll in Chrome.
      document.querySelector<HTMLInputElement>('#f-name')?.focus({ preventScroll: true })
      document.getElementById('contact')?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' })
    }
  }

  document.querySelectorAll<HTMLButtonElement>('[data-shortcut]').forEach((button) =>
    button.addEventListener('click', () => run(button.dataset.shortcut ?? '')),
  )
  window.addEventListener('keydown', (e) => {
    if (!e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return
    // e.code is the physical key, so it also works on Mac (where Alt + C types "ç").
    const keys: Record<string, string> = { KeyK: 'chat', KeyC: 'copy', KeyM: 'message' }
    const action = keys[e.code] ?? ''
    if (!action) return
    e.preventDefault()
    run(action)
  })
}

// Copies your email and briefly shows "Copied!" in the given label.
async function copyEmail(label: Element | null) {
  try {
    await navigator.clipboard.writeText(profile.email)
  } catch {
    // Clipboard blocked (old browser or no permission): open the email app instead.
    window.location.href = `mailto:${profile.email}`
    return
  }
  if (!label) return
  const original = label.textContent
  label.textContent = 'Copied!'
  setTimeout(() => (label.textContent = original), 2000)
}

// The interactive background: a grid of dots that glow and move out of the way around the
// mouse (or a finger), shimmer slowly on their own, and send out a ripple wherever you click.
function initBackground() {
  const canvas = document.querySelector<HTMLCanvasElement>('.bg-canvas')
  const ctx = canvas?.getContext('2d')
  if (!canvas || !ctx) return

  const gap = 30 // space between dots
  const reach = 170 // how far around the mouse the dots react
  const rippleLife = 1600 // how long a click ripple lasts (ms)
  const rippleSize = 700 // how far a ripple spreads (px)

  type Dot = { x: number; y: number; ox: number; oy: number; glow: number }
  let dots: Dot[] = []
  let width = 0
  let height = 0
  const pointer = { x: -9999, y: -9999 }
  const ripples: { x: number; y: number; start: number }[] = []

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    width = window.innerWidth
    height = window.innerHeight
    canvas.width = Math.round(width * dpr)
    canvas.height = Math.round(height * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    dots = []
    for (let y = gap / 2; y < height; y += gap) {
      for (let x = gap / 2; x < width; x += gap) dots.push({ x, y, ox: 0, oy: 0, glow: 0 })
    }
  }

  const draw = (time: number) => {
    ctx.clearRect(0, 0, width, height)
    while (ripples.length && time - ripples[0].start > rippleLife) ripples.shift()
    // Plain dot color comes from the theme (light dots on dark, dark dots on light).
    const dotColor = getComputedStyle(document.documentElement).getPropertyValue('--dot-rgb').trim() || '255, 255, 255'

    for (const d of dots) {
      // Where the dot wants to move to, and how bright it wants to be.
      let tx = 0
      let ty = 0
      let target = 0

      const dx = d.x - pointer.x
      const dy = d.y - pointer.y
      const dist = Math.hypot(dx, dy)
      if (dist < reach && dist > 0) {
        const f = 1 - dist / reach
        tx += (dx / dist) * f * 18
        ty += (dy / dist) * f * 18
        target = f
      }

      for (const r of ripples) {
        const age = (time - r.start) / rippleLife // 0 → 1
        const rx = d.x - r.x
        const ry = d.y - r.y
        const rd = Math.hypot(rx, ry) || 1
        const band = 1 - Math.abs(rd - age * rippleSize) / 50 // 1 on the ring, 0 away from it
        if (band > 0) {
          const f = band * (1 - age)
          tx += (rx / rd) * f * 12
          ty += (ry / rd) * f * 12
          target = Math.max(target, f)
        }
      }

      // Ease toward the target so the movement looks smooth.
      d.ox += (tx - d.ox) * 0.12
      d.oy += (ty - d.oy) * 0.12
      d.glow += (target - d.glow) * 0.12

      // A slow diagonal shimmer, so the background is alive even when nothing happens.
      const wave = reduceMotion ? 0.5 : (Math.sin(time * 0.0012 - (d.x + d.y) * 0.008) + 1) / 2
      const alpha = 0.06 + wave * 0.06 + d.glow * 0.8

      if (d.glow > 0.03) {
        // Glowing dots go from purple on the left to cyan on the right.
        const t = d.x / width
        const r = Math.round(167 + (34 - 167) * t)
        const g = Math.round(139 + (211 - 139) * t)
        const b = Math.round(250 + (238 - 250) * t)
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`
      } else {
        ctx.fillStyle = `rgba(${dotColor}, ${alpha})`
      }
      ctx.beginPath()
      ctx.arc(d.x + d.ox, d.y + d.oy, 1.2 + d.glow * 1.8, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  resize()

  // Visitors who turn off animations get still dots that don't react.
  if (reduceMotion) {
    draw(0)
    window.addEventListener('resize', () => {
      resize()
      draw(0)
    })
    return
  }

  window.addEventListener('resize', resize)
  window.addEventListener(
    'pointermove',
    (e) => {
      pointer.x = e.clientX
      pointer.y = e.clientY
    },
    { passive: true },
  )
  const forgetPointer = () => {
    pointer.x = -9999
    pointer.y = -9999
  }
  document.documentElement.addEventListener('pointerleave', forgetPointer)
  window.addEventListener('pointercancel', forgetPointer) // a finger started scrolling
  window.addEventListener(
    'pointerdown',
    (e) => {
      ripples.push({ x: e.clientX, y: e.clientY, start: performance.now() })
      if (ripples.length > 5) ripples.shift()
    },
    { passive: true },
  )

  const loop = (time: number) => {
    draw(time)
    requestAnimationFrame(loop)
  }
  requestAnimationFrame(loop)
}

// The thin bar at the very top shows how far down the page you are.
function initProgress() {
  const bar = document.querySelector<HTMLElement>('.progress span')
  if (!bar) return

  let queued = false
  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight
    bar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`
    queued = false
  }
  window.addEventListener(
    'scroll',
    () => {
      if (!queued) {
        queued = true
        requestAnimationFrame(update)
      }
    },
    { passive: true },
  )
  update()
}

// "I build web apps. / mobile apps. / ..." typing effect under your name.
function initTyping() {
  const el = document.querySelector<HTMLElement>('.typed')
  const words = profile.typing
  const line = el?.parentElement
  if (!el || !line || words.length < 2 || reduceMotion) return

  // Reserve the height of the longest word, so the text below doesn't jump up and down.
  const reserveHeight = () => {
    const shown = el.textContent
    line.style.minHeight = ''
    let tallest = 0
    for (const w of words) {
      el.textContent = w
      tallest = Math.max(tallest, line.offsetHeight)
    }
    el.textContent = shown
    line.style.minHeight = `${tallest}px`
  }
  reserveHeight()
  document.fonts.ready.then(reserveHeight)
  window.addEventListener('resize', reserveHeight)

  let word = 0
  let chars = words[0].length
  let deleting = false

  const tick = () => {
    const current = words[word]
    if (!deleting && chars === current.length) {
      deleting = true
      setTimeout(tick, 1800)
      return
    }
    if (deleting && chars === 0) {
      deleting = false
      word = (word + 1) % words.length
      setTimeout(tick, 250)
      return
    }
    chars += deleting ? -1 : 1
    el.textContent = words[word].slice(0, chars)
    setTimeout(tick, deleting ? 35 : 75)
  }
  tick()
}

// Fade elements in as they scroll into view.
function initReveal() {
  const elements = document.querySelectorAll('.reveal')
  if (reduceMotion || !('IntersectionObserver' in window)) {
    elements.forEach((el) => el.classList.add('is-visible'))
    return
  }
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        entry.target.classList.add('is-visible')
        observer.unobserve(entry.target)
      }
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
  )
  elements.forEach((el) => observer.observe(el))
}

// Highlight the sidebar link of the section you're looking at.
function initActiveNav() {
  const links = document.querySelectorAll<HTMLElement>('[data-nav]')
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        links.forEach((link) => link.classList.toggle('is-active', link.dataset.nav === entry.target.id))
      }
    },
    { rootMargin: '-45% 0px -50% 0px' },
  )
  document.querySelectorAll('main section[id]').forEach((section) => observer.observe(section))
}

// A soft light follows the mouse inside cards.
function initSpotlight() {
  if (!finePointer || reduceMotion) return
  document.querySelectorAll<HTMLElement>('.spot').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const rect = card.getBoundingClientRect()
      card.style.setProperty('--x', `${e.clientX - rect.left}px`)
      card.style.setProperty('--y', `${e.clientY - rect.top}px`)
    })
  })
}

// Project cards are fanned out like a hand of cards (data-pos 0 is the front one).
// Clicking a card at the back, or tabbing into it, swaps it to the front.
function initCardStack() {
  const cards = [...document.querySelectorAll<HTMLElement>('.stack .card')]
  if (cards.length < 2) return

  const bringToFront = (card: HTMLElement) => {
    const pos = card.dataset.pos
    if (!pos || pos === '0') return
    const front = cards.find((c) => c.dataset.pos === '0')
    if (front) front.dataset.pos = pos
    card.dataset.pos = '0'
  }
  cards.forEach((card) => {
    card.addEventListener('click', () => bringToFront(card))
    card.addEventListener('focusin', () => bringToFront(card))
  })
}

// "Details" opens a popup with everything about the project.
function initModal() {
  const dialog = document.querySelector<HTMLDialogElement>('#project-modal')
  const body = dialog?.querySelector<HTMLElement>('.modal-body')
  if (!dialog || !body) return

  document.querySelectorAll<HTMLButtonElement>('[data-project]').forEach((button) =>
    button.addEventListener('click', () => {
      const index = Number(button.dataset.project)
      const project = projects[index]
      if (!project) return
      body.innerHTML = projectModal(project, index)
      dialog.showModal()
      // The browser focuses the sticky close button, which can scroll the popup down.
      // Focus the popup itself instead and start at the top (Tab still reaches the close button first).
      dialog.focus({ preventScroll: true })
      dialog.scrollTop = 0
    }),
  )

  // Close when clicking the dark area outside the popup, or the X button.
  dialog.addEventListener('click', (e) => {
    const target = e.target as Element
    if (target === dialog || target.closest('[data-close]')) dialog.close()
  })
}

// "Copy" button next to the email address.
function initCopyEmail() {
  document.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach((button) => {
    const label = button.querySelector('span')
    let timer = 0
    button.addEventListener('click', async () => {
      const text = button.dataset.copy ?? ''
      try {
        await navigator.clipboard.writeText(text)
      } catch {
        // Clipboard blocked (old browser or no permission): open the email app instead.
        window.location.href = `mailto:${text}`
        return
      }
      button.classList.add('is-copied')
      if (label) label.textContent = 'Copied!'
      clearTimeout(timer)
      timer = window.setTimeout(() => {
        button.classList.remove('is-copied')
        if (label) label.textContent = 'Copy'
      }, 2000)
    })
  })
}

// Contact form: sends through Formspree if you set formspreeId in data.ts,
// otherwise opens the visitor's email app with the message filled in.
function initContactForm() {
  const form = document.querySelector<HTMLFormElement>('.contact-form')
  const status = form?.querySelector<HTMLElement>('.form-status')
  const submit = form?.querySelector<HTMLButtonElement>('button[type="submit"]')
  if (!form || !status || !submit) return

  const setStatus = (text: string, type: 'info' | 'ok' | 'error') => {
    status.textContent = text
    status.dataset.type = type
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    const data = new FormData(form)
    if (data.get('_gotcha')) return // a spam bot filled the hidden field

    const value = (key: string) => String(data.get(key) ?? '').trim() || 'Not specified'

    if (!profile.formspreeId) {
      const subject = `New project inquiry from ${value('name')}`
      const body = [
        `Name: ${value('name')}`,
        `Email: ${value('email')}`,
        `Company: ${value('company')}`,
        `Needs: ${value('need')}`,
        `Budget: ${value('budget')}`,
        `Timeline: ${value('timeline')}`,
        '',
        value('message'),
      ].join('\n')
      window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
      setStatus('Opening your email app…', 'info')
      return
    }

    submit.disabled = true
    setStatus('Sending…', 'info')
    try {
      const response = await fetch(`https://formspree.io/f/${encodeURIComponent(profile.formspreeId)}`, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      })
      if (!response.ok) throw new Error(`Formspree responded ${response.status}`)
      form.reset()
      setStatus('Thanks! Your message was sent. I’ll get back to you soon.', 'ok')
    } catch {
      setStatus(`Sorry, the message could not be sent. Please email me at ${profile.email}.`, 'error')
    } finally {
      submit.disabled = false
    }
  })
}
