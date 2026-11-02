// Everything that moves or reacts on the page: menu, animations, project filter, popup and contact form.
import { profile, projects } from './data.ts'
import { projectModal } from './templates.ts'

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches

export function initInteractions() {
  initHeader()
  initMenu()
  initReveal()
  initActiveNav()
  initTyping()
  initCounters()
  initSpotlight()
  initTilt()
  initFilters()
  initModal()
  initCopyEmail()
  initContactForm()
}

// Header gets a background once you scroll, and the thin bar at the top shows scroll progress.
function initHeader() {
  const header = document.querySelector<HTMLElement>('.header')
  const bar = document.querySelector<HTMLElement>('.progress span')
  if (!header || !bar) return

  let queued = false
  const update = () => {
    const y = window.scrollY
    const max = document.documentElement.scrollHeight - window.innerHeight
    header.classList.toggle('is-scrolled', y > 10)
    bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`
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

// Mobile menu open/close.
function initMenu() {
  const header = document.querySelector<HTMLElement>('.header')
  const button = document.querySelector<HTMLButtonElement>('.menu-btn')
  if (!header || !button) return

  const setOpen = (open: boolean) => {
    header.classList.toggle('menu-open', open)
    button.setAttribute('aria-expanded', String(open))
    button.setAttribute('aria-label', open ? 'Close menu' : 'Open menu')
  }
  button.addEventListener('click', () => setOpen(button.getAttribute('aria-expanded') !== 'true'))
  document.querySelectorAll('.nav a').forEach((link) => link.addEventListener('click', () => setOpen(false)))
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setOpen(false)
  })
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

// Highlight the menu link of the section you're looking at.
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

// "I build fast websites. / web apps. / ..." typing effect in the big heading.
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

// Numbers in the stats row count up from 0 the first time they appear.
function initCounters() {
  if (reduceMotion) return
  const counters = document.querySelectorAll<HTMLElement>('[data-count]')
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        observer.unobserve(entry.target)
        countUp(entry.target as HTMLElement)
      }
    },
    { threshold: 0.6 },
  )
  counters.forEach((el) => {
    el.textContent = '0'
    observer.observe(el)
  })
}

function countUp(el: HTMLElement) {
  const target = Number(el.dataset.count)
  const duration = 1400
  const start = performance.now()
  const frame = (now: number) => {
    const t = Math.min((now - start) / duration, 1)
    const eased = 1 - Math.pow(1 - t, 3)
    el.textContent = String(Math.round(target * eased))
    if (t < 1) requestAnimationFrame(frame)
  }
  requestAnimationFrame(frame)
}

// A soft light follows the mouse over the background grid and over cards.
function initSpotlight() {
  if (!finePointer || reduceMotion) return
  const bg = document.querySelector<HTMLElement>('.bg')
  let frame = 0
  let x = 0
  let y = 0
  window.addEventListener(
    'pointermove',
    (e) => {
      x = e.clientX
      y = e.clientY
      if (frame || !bg) return
      frame = requestAnimationFrame(() => {
        bg.style.setProperty('--mx', `${x}px`)
        bg.style.setProperty('--my', `${y}px`)
        frame = 0
      })
    },
    { passive: true },
  )

  document.querySelectorAll<HTMLElement>('.spot').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const rect = card.getBoundingClientRect()
      card.style.setProperty('--x', `${e.clientX - rect.left}px`)
      card.style.setProperty('--y', `${e.clientY - rect.top}px`)
    })
  })
}

// Cards tilt slightly in 3D toward the mouse.
function initTilt() {
  if (!finePointer || reduceMotion) return
  document.querySelectorAll<HTMLElement>('.tilt').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const rect = el.getBoundingClientRect()
      // Wide cards tilt less, or their edges swing too far.
      const maxDeg = rect.width > 700 ? 2 : 5
      const perspective = Math.max(900, rect.width * 1.5)
      const px = (e.clientX - rect.left) / rect.width - 0.5
      const py = (e.clientY - rect.top) / rect.height - 0.5
      el.style.transform = `perspective(${perspective}px) rotateX(${(-py * maxDeg).toFixed(2)}deg) rotateY(${(px * maxDeg).toFixed(2)}deg)`
    })
    el.addEventListener('pointerleave', () => {
      el.style.transform = ''
    })
  })
}

// "All / Website / Web App / ..." buttons above the projects.
function initFilters() {
  const buttons = document.querySelectorAll<HTMLButtonElement>('[data-filter]')
  const items = document.querySelectorAll<HTMLElement>('.projects > li')

  buttons.forEach((button) =>
    button.addEventListener('click', () => {
      const filter = button.dataset.filter
      buttons.forEach((b) => {
        b.classList.toggle('is-active', b === button)
        b.setAttribute('aria-pressed', String(b === button))
      })
      items.forEach((item) => {
        const show = filter === 'all' || item.dataset.category === filter
        if (show && item.hidden) {
          item.hidden = false
          if (!reduceMotion) {
            item.animate(
              [
                { opacity: 0, transform: 'scale(0.96)' },
                { opacity: 1, transform: 'none' },
              ],
              { duration: 350, easing: 'cubic-bezier(.2,.8,.2,1)' },
            )
          }
        } else if (!show) {
          item.hidden = true
        }
      })
    }),
  )
}

// Clicking a project opens a popup with the full details.
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

    const name = String(data.get('name') ?? '')
    const email = String(data.get('email') ?? '')
    const budget = String(data.get('budget') ?? '') || 'Not specified'
    const message = String(data.get('message') ?? '')

    if (!profile.formspreeId) {
      const subject = `New project enquiry from ${name}`
      const body = `Name: ${name}\nEmail: ${email}\nBudget: ${budget}\n\n${message}`
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
