import './style.css'
import { profile } from './data.ts'
import { renderPage } from './templates.ts'
import { initInteractions } from './interactions.ts'

document.title = `${profile.name} | ${profile.role}`
document.querySelector<HTMLDivElement>('#app')!.innerHTML = renderPage()
initInteractions()
