// The "Ask me anything" chat.
// The suggestion buttons are answered right here from data.ts (instant and free).
// Typed questions go to the AI function (supabase/functions/chat) when chatUrl is set in data.ts;
// without it, or when the AI is busy, the chat picks the closest built-in answer instead.
import { profile, facts, skills, projects, services, steps, budgets } from './data.ts'

type Turn = { role: 'user' | 'bot'; text: string }
type Answer = { question: string; keywords: string[]; answer: () => string }

const firstName = profile.name.split(/\s+/)[0] ?? profile.name
const shortTitle = (title: string) => title.split(':')[0].trim()

// Built-in answers. The first four are shown as suggestion buttons.
const answers: Answer[] = [
  {
    question: 'What do you build?',
    keywords: ['build', 'service', 'offer', 'make', 'do you do', 'help', 'website', 'web app', 'mobile', 'landing', 'seo'],
    answer: () => `${firstName} can help with:\n${services.map((s) => `• ${s.title}: ${s.text}`).join('\n')}`,
  },
  ...(projects.length
    ? [
        {
          question: `Tell me about ${shortTitle(projects[0].title)}`,
          keywords: ['project', 'portfolio', 'made', 'built', ...projects.map((p) => shortTitle(p.title).toLowerCase())],
          answer: () =>
            projects
              .map(
                (p) =>
                  `${p.title}${p.status ? ` (${p.status.toLowerCase()})` : ''}: ${p.summary} Built with ${p.tech.join(', ')}.${p.liveUrl ? ` Try it: ${p.liveUrl}` : ''}`,
              )
              .join('\n\n'),
        },
      ]
    : []),
  {
    question: 'How much does a website cost?',
    keywords: ['price', 'cost', 'budget', 'how much', 'rate', 'charge', 'pay', 'fee', 'quote'],
    answer: () =>
      `It depends on the project. The inquiry form has these budget ranges: ${budgets.filter((b) => !/not sure/i.test(b)).join(', ')}. Describe what you need there and ${firstName} will reply with a clear price.`,
  },
  {
    question: 'How can I contact you?',
    keywords: ['contact', 'email', 'reach', 'hire', 'message', 'talk', 'call', 'touch'],
    answer: () =>
      `Email ${firstName} at ${profile.email}, or use the inquiry form in the Contact section of this page.${profile.socials.length ? ` ${firstName} is also on ${profile.socials.map((s) => s.label).join(' and ')}.` : ''}`,
  },
  {
    question: 'What tools do you use?',
    keywords: ['tool', 'stack', 'skill', 'tech', 'language', 'framework', ...skills.map((s) => s.toLowerCase())],
    answer: () => `${firstName} works with ${skills.join(', ')}.`,
  },
  {
    question: 'Are you available?',
    keywords: ['available', 'availability', 'free', 'busy', 'open', 'taking'],
    answer: () =>
      profile.available
        ? `Yes, ${firstName} is available for new projects. Share your idea in the inquiry form to get started.`
        : `${firstName} is fully booked right now, but you can still send a message at ${profile.email}.`,
  },
  {
    question: 'Who are you?',
    keywords: ['who', 'about', 'yourself', 'student', 'study', 'school', 'where', 'location', 'from', 'experience', 'background'],
    answer: () => `In ${firstName}'s own words: "${profile.about[0]}"`,
  },
  {
    question: 'How do you work?',
    keywords: ['process', 'steps', 'how do you work', 'work with', 'timeline', 'plan'],
    answer: () => `Working with ${firstName} goes like this:\n${steps.map((s, i) => `${i + 1}. ${s.title}: ${s.text}`).join('\n')}`,
  },
]

const fallback = () =>
  `I'm not sure about that one. You can ask ${firstName} directly at ${profile.email} or through the inquiry form on this page.`

// The built-in answer whose keywords match the question best, if any.
function matchAnswer(question: string) {
  const text = question.toLowerCase()
  let best: Answer | null = null
  let bestScore = 0
  for (const a of answers) {
    const score = a.keywords.filter((k) => text.includes(k)).length
    if (score > bestScore) {
      best = a
      bestScore = score
    }
  }
  return best?.answer() ?? null
}

// Everything the AI may use, written out from data.ts, so the site and the chat never disagree.
function portfolioFacts() {
  return [
    `Name: ${profile.name} (first name: ${firstName})`,
    `Role: ${profile.role}`,
    `Location: ${profile.location}`,
    `Available for new projects: ${profile.available ? 'yes' : 'no'}`,
    `Email: ${profile.email}`,
    `Links: ${profile.socials.map((s) => `${s.label} ${s.url}`).join(', ')}`,
    `Facts: ${facts.map((f) => `${f.value} (${f.label})`).join('; ')}`,
    `Intro: ${profile.intro}`,
    `About, in their own words: ${profile.about.join(' ')}`,
    `Skills and tools: ${skills.join(', ')}`,
    'Projects:',
    ...projects.map(
      (p) =>
        `- ${p.title} [${[p.category, p.year, p.status].filter(Boolean).join(', ')}]: ${p.description} Highlights: ${(p.highlights ?? []).join('; ')}. Tech: ${p.tech.join(', ')}.${p.liveUrl ? ` Link: ${p.liveUrl}` : ''}`,
    ),
    'Services:',
    ...services.map((s) => `- ${s.title}: ${s.text}`),
    'How working together goes:',
    ...steps.map((s, i) => `${i + 1}. ${s.title}: ${s.text}`),
    `Budget ranges offered in the inquiry form: ${budgets.join(', ')}. There are no fixed prices; a price is given after hearing about the project.`,
    'The page has a Contact section with an inquiry form.',
  ].join('\n')
}

const esc = (value: string) => value.replace(/[&<>"']/g, (ch) => `&#${ch.charCodeAt(0)};`)

// Safe HTML for a message: plain text, with links, emails and line breaks made clickable.
function format(text: string) {
  return esc(text.replace(/\*\*(.+?)\*\*/g, '$1').replace(/^\s*[*-]\s+/gm, '• '))
    .replace(/https?:\/\/[^\s<]+[^\s<.,;:!?)]/g, (url) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`)
    .replace(/(^|[\s(])([\w.+-]+@[\w-]+(?:\.[\w-]+)+)/g, '$1<a href="mailto:$2">$2</a>')
    .replace(/\n/g, '<br>')
}

let openChatPanel = () => {}

// Used by the Alt + K shortcut and the sidebar row.
export function openChat() {
  openChatPanel()
}

export function initChat() {
  const fab = document.querySelector<HTMLButtonElement>('.chat-fab')
  const panel = document.querySelector<HTMLElement>('#chat')
  const log = panel?.querySelector<HTMLElement>('.chat-log')
  const chips = panel?.querySelector<HTMLElement>('.chat-chips')
  const form = panel?.querySelector<HTMLFormElement>('.chat-form')
  const input = form?.querySelector<HTMLInputElement>('input')
  const send = form?.querySelector<HTMLButtonElement>('button')
  if (!fab || !panel || !log || !chips || !form || !input || !send) return

  const turns: Turn[] = []
  let busy = false
  let greeted = false
  let returnFocus: HTMLElement | null = null

  const addMessage = (role: Turn['role'], text: string) => {
    const el = document.createElement('div')
    el.className = `msg ${role}`
    el.innerHTML = format(text)
    log.append(el)
    log.scrollTop = log.scrollHeight
    turns.push({ role, text })
  }

  const setBusy = (on: boolean) => {
    busy = on
    send.disabled = on
    log.querySelector('.typing')?.remove()
    if (on) {
      log.insertAdjacentHTML('beforeend', '<div class="msg bot typing" aria-label="Typing"><span></span><span></span><span></span></div>')
      log.scrollTop = log.scrollHeight
    }
  }

  const askAI = async (question: string) => {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 20000)
    try {
      const response = await fetch(profile.chatUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, history: turns.slice(-7, -1), context: portfolioFacts() }),
        signal: controller.signal,
      })
      const data = await response.json()
      if (!response.ok || typeof data.answer !== 'string') throw new Error(data.error ?? `HTTP ${response.status}`)
      return data.answer
    } finally {
      clearTimeout(timer)
    }
  }

  // A short pause before built-in answers, so they don't feel jumpy.
  const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

  const ask = async (question: string, builtIn?: Answer) => {
    if (busy || !question.trim()) return
    addMessage('user', question)
    setBusy(true)
    let answer: string
    if (builtIn) {
      await wait(450)
      answer = builtIn.answer()
    } else if (profile.chatUrl) {
      try {
        answer = await askAI(question)
      } catch {
        answer = matchAnswer(question) ?? fallback()
      }
    } else {
      await wait(450)
      answer = matchAnswer(question) ?? fallback()
    }
    setBusy(false)
    addMessage('bot', answer)
  }

  chips.innerHTML = answers
    .slice(0, 4)
    .map((a, i) => `<button type="button" data-answer="${i}">${esc(a.question)}</button>`)
    .join('')
  chips.addEventListener('click', (e) => {
    const button = (e.target as Element).closest<HTMLButtonElement>('[data-answer]')
    const answer = answers[Number(button?.dataset.answer)]
    if (answer) ask(answer.question, answer)
  })

  form.addEventListener('submit', (e) => {
    e.preventDefault()
    const question = input.value.trim()
    if (!question || busy) return
    input.value = ''
    ask(question)
  })

  const setOpen = (open: boolean) => {
    panel.hidden = !open
    fab.setAttribute('aria-expanded', String(open))
    document.documentElement.classList.toggle('chat-open', open)
    if (open) {
      returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : fab
      if (!greeted) {
        greeted = true
        addMessage(
          'bot',
          `Hi! I'm ${firstName}'s assistant. Ask me about ${firstName}'s projects, skills or services, or pick a question below.`,
        )
      }
      input.focus()
    } else {
      returnFocus?.focus()
    }
  }

  openChatPanel = () => setOpen(true)
  fab.addEventListener('click', () => setOpen(true))
  panel.querySelector('.chat-close')?.addEventListener('click', () => setOpen(false))
  panel.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setOpen(false)
  })
}
