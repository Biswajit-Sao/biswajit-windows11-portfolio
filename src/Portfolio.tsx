import { useState } from 'react'
import { Braces, BriefcaseBusiness, Check, ChevronLeft, ChevronRight, CodeXml, Copy, ExternalLink, Folder, GitFork, Images, Link2, Mail, MapPin, Terminal, UserRound } from 'lucide-react'
import { email, github, linkedin, photos, projects, skills } from './data'
import type { AppId } from './desktop'

export type Tab = 'Overview' | 'Projects' | 'Experience' | 'Skills'
export const tabs = ['Overview', 'Projects', 'Experience', 'Skills'] as const
const tabIcons = [UserRound, Folder, BriefcaseBusiness, CodeXml]
type OpenApp = (id: AppId) => void

export function Portfolio({ tab, changeTab, open }: { tab: Tab; changeTab: (tab: Tab) => void; open: OpenApp }) {
  const [filter, setFilter] = useState('All')
  return <>
    <nav className="tabs" aria-label="Portfolio sections">{tabs.map((name, i) => {
      const Icon = tabIcons[i]
      return <button key={name} className={tab === name ? 'selected' : ''} aria-current={tab === name ? 'page' : undefined} onClick={() => changeTab(name)}><Icon size={15} />{name}</button>
    })}</nav>
    <div className="window-scroll" key={tab}>
      {tab === 'Overview' && <div className="overview">
        <div className="intro">
          <div className="bio">
            <div className="greeting"><span /> HELLO, WORLD!</div>
            <h1>Biswajit Sao<span>.</span></h1>
            <p className="role"><CodeXml size={20} /> Full Stack Developer</p>
            <p className="about-text">I build web and desktop apps for the people who run businesses, from travel planners to restaurant teams.</p>
            <div className="location"><MapPin size={14} /> Bankura, West Bengal, India</div>
            <div className="actions"><button className="primary" onClick={() => changeTab('Projects')}><Folder size={16} /> View projects</button><button className="secondary" onClick={() => open('contact')}><Mail size={16} /> Get in touch</button></div>
          </div>
          <button className="hero-photo" onClick={() => open('photos')} aria-label="Open photo gallery">
            <img src="/photos/studio.webp" alt={photos[0].alt} />
            <span className="photo-caption"><Images size={13} /> portrait_01.webp</span>
          </button>
        </div>
        <div className="quick-heading"><h2>Quick access</h2><span /></div>
        <div className="quick-links">
          <button onClick={() => open('docs')}><img src="/icons/resume.png" alt="" /><span><strong>My résumé</strong><small>PDF documents</small></span></button>
          <button onClick={() => open('photos')}><img src="/icons/photos.png" alt="" /><span><strong>Photo gallery</strong><small>4 pictures</small></span></button>
          <a href={github} target="_blank" rel="noreferrer"><GitFork className="git-icon" size={27} /><span><strong>GitHub</strong><small>Code repositories</small></span><ExternalLink className="external" size={12} /></a>
        </div>
      </div>}
      {tab === 'Projects' && <div className="page-content"><h2>My projects</h2><div className="filters">{['All', 'Professional', 'Freelance', 'Personal'].map(type => <button aria-pressed={filter === type} className={filter === type ? 'active' : ''} key={type} onClick={() => setFilter(type)}>{type}</button>)}</div><div className="project-list">{projects.filter(p => filter === 'All' || p.category === filter).map(p => <details key={p.name}><summary><img src="/icons/projects.png" alt="" /><span><strong>{p.name}</strong><small>{p.description}</small></span><ChevronRight size={16} /></summary><div className="project-detail"><span className="mono text-sky-300">{p.category}</span><p>{p.details}</p>{p.stack && <small>{p.stack}</small>}<div className="flex gap-3">{p.live && <a href={p.live} target="_blank" rel="noreferrer">Visit project <ExternalLink size={13} /></a>}{p.code && <a href={p.code} target="_blank" rel="noreferrer">Source code <CodeXml size={14} /></a>}</div></div></details>)}</div></div>}
      {tab === 'Experience' && <div className="page-content"><h2>Experience & education</h2><div className="timeline"><article><small>2025 — Present</small><h3>Full Stack Developer</h3><b>Encoders Unlimited · Siliguri</b><p>I develop custom CRMs, desktop apps and e-commerce stores, from requirements and database design through deployment. My work covers role-based access, reporting, PDF exports and workflow automation.</p><button className="text-link" onClick={() => changeTab('Projects')}>Explore my projects</button></article><article><small>2021 — 2025</small><h3>B.Tech in Computer Science and Engineering</h3><b>Bankura Unnayani Institute of Engineering</b><p>Completed my degree with 71%. I also completed the GeeksforGeeks 160 Days of Problem Solving course and earned a three-star coding rating.</p></article></div></div>}
      {tab === 'Skills' && <div className="page-content"><h2>Technical skills</h2><div className="skills-grid">{skills.map(([group, ...items]) => <section key={group}><h3><Braces size={15} />{group}</h3><div className="flex flex-wrap gap-2">{items.map(item => <span key={item}>{item}</span>)}</div></section>)}</div></div>}
    </div>
  </>
}

export function Gallery() {
  const [selected, setSelected] = useState<number | null>(null)
  return <div className="page-content">{selected === null ? <><h2>Photo gallery</h2><div className="gallery">{photos.map((p, i) => <button key={p.file} onClick={() => setSelected(i)}><img src={'/photos/' + p.file + '.webp'} alt={p.alt} /><span>{p.title}</span></button>)}</div></> : <div className="viewer"><div className="viewer-tools"><button onClick={() => setSelected(null)}><Images size={16} /> All photos</button><span>{selected + 1} / {photos.length}</span></div><img src={'/photos/' + photos[selected].file + '.webp'} alt={photos[selected].alt} /><div className="viewer-tools"><button aria-label="Previous photo" onClick={() => setSelected((selected + photos.length - 1) % photos.length)}><ChevronLeft /></button><strong>{photos[selected].title}</strong><button aria-label="Next photo" onClick={() => setSelected((selected + 1) % photos.length)}><ChevronRight /></button></div></div>}</div>
}
export function Contact() {
  const [copy, setCopy] = useState('')
  async function copyEmail() {
    try { await navigator.clipboard.writeText(email); setCopy('Email copied') } catch { setCopy('Select the email address above to copy it.') }
  }
  return <div className="page-content"><h2>Get in touch</h2><p className="muted mb-5">For project enquiries or opportunities, reach me by email.</p><div className="contact-row"><Mail /><div><small>Email</small><a href={'mailto:' + email}>{email}</a></div><button className="icon-link" aria-label="Copy email address" onClick={copyEmail}>{copy === 'Email copied' ? <Check size={18} /> : <Copy size={18} />}</button></div><span role="status" className="muted">{copy}</span>{[[linkedin, 'LinkedIn', 'Professional profile', Link2], [github, 'GitHub', 'Code repositories', Terminal]].map(([url, title, subtitle, Icon]) => { const Mark = Icon as typeof Terminal; return <a className="contact-row" key={String(title)} href={String(url)} target="_blank" rel="noreferrer"><Mark /><div><small>{String(subtitle)}</small><strong>{String(title)}</strong></div><ExternalLink size={16} /></a> })}</div>
}
