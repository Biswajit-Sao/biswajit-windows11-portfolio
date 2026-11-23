import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import type { PointerEvent, ReactNode } from 'react'
import { Check, ChevronLeft, ChevronRight, Copy, Keyboard, MessageSquare, Minus, PanelTop, Search, Square, Trash2, Wifi, X, FolderPlus, FilePlus2, FolderInput, Scissors, ClipboardPaste, Pencil, Terminal, LayoutGrid, ListOrdered, FileText, PanelsTopLeft, MapPin, Ellipsis, Volume2 } from 'lucide-react'
import { Contact, Gallery, Portfolio } from './Portfolio'
import type { Tab } from './Portfolio'
import { apps, dragType, initialItems, itemIcon, launchers, moveIssue, nameIssue, pathTo, root } from './desktop'
import type { AppId, Item, Target } from './desktop'
import { AppIcon, FileDialog, FileExplorer } from './Files'
import type { FileAction } from './Files'
import CommandPrompt from './CommandPrompt'
import Minesweeper from './Minesweeper'
import './App.css'
import './Windows11.css'

const PdfReader = lazy(() => import('./PdfReader'))
type WindowState = { id: AppId; minimized: boolean }
type Popup = 'start' | 'calendar' | 'tips' | null
type Context = { x: number; y: number; item?: Item; atPointer?: boolean }
const pinned: AppId[] = ['pc', 'portfolio', 'docs', 'cmd', 'game']
const storageKey = 'biswajit.desktop.files.v1'
function loadItems(): Item[] {
  try {
    const raw = localStorage.getItem(storageKey)
    if (raw) { const saved = JSON.parse(raw); if (Array.isArray(saved) && saved.every(n => n && typeof n.id === 'string' && typeof n.name === 'string' && typeof n.parent === 'string' && ['text', 'folder', 'pdf', 'shortcut'].includes(n.kind))) return saved }
  } catch {/* A session can run with storage disabled. */ }
  return initialItems
}
function WindowsMark() { return <span aria-hidden="true" className="windows-mark"><i /><i /><i /><i /></span> }

function DesktopWindow({ id, front, index, minimized, focus, minimize, close, footer, children }: {
  id: AppId; front: boolean; index: number; minimized: boolean; focus: () => void; minimize: () => void; close: () => void; footer: string; children: ReactNode
}) {
  const [max, setMax] = useState(false)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const frame = useRef<HTMLDivElement>(null)
  const drag = useRef<{ x: number; y: number; left: number; top: number; w: number; h: number; dx: number; dy: number } | null>(null)
  useEffect(() => {
    const reset = () => setOffset({ x: 0, y: 0 })
    window.addEventListener('resize', reset)
    return () => window.removeEventListener('resize', reset)
  }, [])
  function startDrag(e: PointerEvent<HTMLElement>) {
    if (max || e.button !== 0 || window.innerWidth <= 720 || (e.target as Element).closest('button')) return
    const rect = frame.current!.getBoundingClientRect()
    drag.current = { x: e.clientX, y: e.clientY, left: rect.left, top: rect.top, w: rect.width, h: rect.height, dx: offset.x, dy: offset.y }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  function move(e: PointerEvent<HTMLElement>) {
    const d = drag.current
    if (!d) return
    const dx = Math.max(-d.left, Math.min(window.innerWidth - d.left - d.w, e.clientX - d.x))
    const dy = Math.max(-d.top, Math.min(window.innerHeight - 48 - d.top - d.h, e.clientY - d.y))
    setOffset({ x: d.dx + dx, y: d.dy + dy })
  }
  return <section ref={frame} role="dialog" aria-label={apps[id].title} className={'desktop-window app-' + id + ' ' + (max ? 'maximized ' : '') + (front ? 'front ' : '') + (id === 'portfolio' ? 'main-window' : 'utility-window')} hidden={minimized} style={{ zIndex: 10 + index, translate: max ? undefined : offset.x + 'px ' + offset.y + 'px' }} onPointerDownCapture={focus} onFocusCapture={focus}>
    <header className="titlebar" onPointerDown={startDrag} onPointerMove={move} onLostPointerCapture={() => { drag.current = null }} onDoubleClick={e => { if (!(e.target as Element).closest('button')) setMax(!max) }}>
      <div className="window-title"><AppIcon name={apps[id].icon} /><span>{apps[id].title}</span></div>
      <div className="window-controls"><button aria-label={'Minimize ' + apps[id].title} onClick={minimize}><Minus /></button><button aria-label={(max ? 'Restore ' : 'Maximize ') + apps[id].title} onClick={() => setMax(!max)}>{max ? <Copy /> : <Square />}</button><button className="close" aria-label={'Close ' + apps[id].title} onClick={close}><X /></button></div>
    </header>
    <div className="window-body">{children}</div>
    <footer className="statusbar"><span><i />{id === 'pc' ? 'File Explorer' : 'Ready'}</span><span>{footer}</span></footer>
  </section>
}

function Calendar({ now }: { now: Date }) {
  const [month, setMonth] = useState(() => new Date(now.getFullYear(), now.getMonth(), 1))
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  function jump(by: number) { setMonth(new Date(month.getFullYear(), month.getMonth() + by, 1)) }
  return <div className="calendar"><div className="menu-heading"><strong>{month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</strong><div className="flex"><button aria-label="Previous month" onClick={() => jump(-1)}><ChevronLeft size={18} /></button><button aria-label="Next month" onClick={() => jump(1)}><ChevronRight size={18} /></button></div></div><div className="calendar-grid">{['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <b key={d}>{d}</b>)}{Array.from({ length: month.getDay() }, (_, i) => <span key={'e' + i} />)}{Array.from({ length: days }, (_, i) => <span key={i} className={new Date(month.getFullYear(), month.getMonth(), i + 1).toDateString() === now.toDateString() ? 'today' : ''}>{i + 1}</span>)}</div></div>
}

function App() {
  const [windows, setWindows] = useState<WindowState[]>([])
  const [tab, setTab] = useState<Tab>('Overview')
  const [menu, setMenu] = useState<Popup>(null)
  const [context, setContext] = useState<Context | null>(null)
  const [action, setAction] = useState<FileAction | null>(null)
  const [items, setItems] = useState<Item[]>(loadItems)
  const [current, setCurrent] = useState(root)
  const [cmdDir, setCmdDir] = useState(root)
  const [doc, setDoc] = useState(0)
  const [note, setNote] = useState('')
  const [cut, setCut] = useState('')
  const [compact, setCompact] = useState(false)
  const [query, setQuery] = useState('')
  const [recent, setRecent] = useState<Target[]>([])
  const [message, setMessage] = useState('')
  const [size, setSize] = useState({ w: window.innerWidth, h: window.innerHeight })
  const [now, setNow] = useState(() => new Date())
  const search = useRef<HTMLInputElement>(null)
  const space = useRef<HTMLDivElement>(null)
  const active = windows.filter(w => !w.minimized).at(-1)?.id
  const desktopItems = items.filter(n => n.parent === root)
  const matches = launchers.filter(s => (s.label + ' ' + (s.target === 'docs' ? 'resume résumé cv pdf' : '') + (s.target === 'cmd' ? ' terminal cmd' : '')).toLowerCase().includes(query.trim().toLowerCase()))
  const noteItem = items.find(n => n.id === note)
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 15000)
    const resize = () => setSize({ w: window.innerWidth, h: window.innerHeight })
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setMenu(null); setContext(null); setAction(null) }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setContext(null); setMenu('start') }
    }
    window.addEventListener('keydown', key); window.addEventListener('resize', resize)
    return () => { clearInterval(timer); window.removeEventListener('keydown', key); window.removeEventListener('resize', resize) }
  }, [])
  useEffect(() => { if (menu === 'start') search.current?.focus() }, [menu])
  useEffect(() => { try { localStorage.setItem(storageKey, JSON.stringify(items)) } catch { setMessage('Browser storage is full or unavailable. Changes last for this session.') } }, [items])
  useEffect(() => { if (message) { const timer = setTimeout(() => setMessage(''), 4500); return () => clearTimeout(timer) } }, [message])
  function dismiss() { setMenu(null); setContext(null) }
  function open(id: AppId) {
    dismiss(); setQuery('')
    setWindows(prev => [...prev.filter(w => w.id !== id), { id, minimized: false }])
    setRecent(prev => [id, ...prev.filter(x => x !== id)].slice(0, 4))
  }
  function launch(target: Target) {
    if (target === 'projects') { setTab('Projects'); open('portfolio'); return }
    if (target === 'portfolio') setTab('Overview')
    if (target === 'docs') setDoc(0)
    if (target === 'pc') setCurrent(root)
    if (target === 'cmd') setCmdDir(root)
    open(target)
  }
  function openItem(n: Item) {
    if (n.kind === 'folder') { setCurrent(n.id); open('pc') }
    else if (n.kind === 'pdf') { setDoc(n.doc ?? 0); open('docs') }
    else if (n.kind === 'text') { setNote(n.id); open('note') }
    else if (n.target) launch(n.target)
  }
  function focus(id: AppId) { dismiss(); setWindows(prev => prev.at(-1)?.id === id ? prev : [...prev.filter(w => w.id !== id), ...prev.filter(w => w.id === id)]) }
  function minimize(id: AppId) { setWindows(prev => prev.map(w => w.id === id ? { ...w, minimized: true } : w)) }
  function create(parent: string, name: string, kind: 'folder' | 'text', position?: Item['position']) {
    const issue = nameIssue(items, name, parent)
    if (issue) return issue
    const item: Item = { id: crypto.randomUUID(), parent, kind, name: name.trim(), position }
    setItems(prev => [...prev, item]); return ''
  }
  function move(id: string, parent: string, position?: Item['position']) {
    if (!id) return ''
    const issue = moveIssue(items, id, parent)
    if (issue) { setMessage(issue); return issue }
    setItems(prev => prev.map(n => n.id === id ? { ...n, parent, position } : n))
    if (id === cut) setCut('')
    return ''
  }
  function applyAction(value: string) {
    if (!action) return ''
    if (action.type === 'move') return move(action.item.id, value)
    if (action.type === 'rename') {
      const issue = nameIssue(items, value, action.item.parent, action.item.id)
      if (issue) return issue
      setItems(prev => prev.map(n => n.id === action.item.id ? { ...n, name: value.trim() } : n)); return ''
    }
    return create(action.parent, value, action.type, newPosition.current)
  }
  const newPosition = useRef<Item['position']>(undefined)
  function ask(a: FileAction, position?: Item['position']) { newPosition.current = position; dismiss(); setAction(a) }
  function contextAt(x: number, y: number, item?: Item, atPointer=false) { setMenu(null); setContext({ x, y, item, atPointer }) }
  function point(x: number, y: number) {
    const rect = space.current!.getBoundingClientRect()
    return { x: Math.min(1, Math.max(0, (x - 40) / Math.max(1, rect.width - 86))), y: Math.min(1, Math.max(0, (y - 25) / Math.max(1, rect.height - 78))) }
  }
  const rows = Math.max(1, Math.floor((size.h - 135) / (compact ? 64 : 79)))
  const hour = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  const date = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  const footers: Record<AppId, string> = { portfolio: tab, pc: pathTo(items, current).join(' / '), cmd: 'Portfolio shell', game: '8 × 8', docs: 'PDF document', photos: '4 pictures', contact: 'Biswajit Sao', bin: '0 items', note: noteItem?.name ?? 'Text file' }
  function contents(id: AppId) {
    switch (id) {
      case 'portfolio': return <Portfolio tab={tab} changeTab={setTab} open={launch} />
      case 'docs': return <Suspense fallback={<p className="p-5">Opening reader…</p>}><PdfReader key={doc} index={doc} select={setDoc} /></Suspense>
      case 'cmd': return <CommandPrompt key={cmdDir} initial={cmdDir} items={items} create={(dir, name) => create(dir, name, 'folder')} open={openItem} />
      case 'game': return <div className="window-scroll"><Minesweeper /></div>
      case 'note': return <textarea aria-label="File contents" className="notepad" value={noteItem?.body ?? ''} onChange={e => setItems(prev => prev.map(n => n.id === note ? { ...n, body: e.target.value } : n))} />
      case 'pc': return <FileExplorer items={items} current={current} navigate={setCurrent} open={openItem} action={ask} menu={contextAt} move={move} />
      case 'contact': return <div className="window-scroll"><Contact /></div>
      case 'photos': return <div className="window-scroll"><Gallery /></div>
      case 'bin': return <div className="empty-bin"><Trash2 size={40} /><h2>Recycle Bin is empty</h2></div>
    }
  }
  const targetFolder = context?.item?.kind === 'folder' ? context.item.id : root
  const ctxItem = context?.item
  return <main className="desktop">
    <div ref={space} className="desktop-space" onContextMenu={e => { if (!(e.target as Element).closest('.desktop-window,.shortcut')) { e.preventDefault(); contextAt(e.clientX, e.clientY, undefined, true) } }} onDragOver={e => { if (e.dataTransfer.types.includes(dragType)) e.preventDefault() }} onDrop={e => { if ((e.target as Element).closest('.desktop-window')) return; e.preventDefault(); move(e.dataTransfer.getData(dragType), root, point(e.clientX, e.clientY)) }}>
      <div className="workspace-header"><span className="workspace-brand"><WindowsMark /> Desktop</span><button aria-label="Desktop options" onClick={e => { const r = e.currentTarget.getBoundingClientRect(); contextAt(r.left, r.bottom) }}><Ellipsis size={18} /></button></div>
      <div className="desktop-clock"><div>{hour.split(' ')[0]}<small>{hour.split(' ')[1]}</small></div><span>{date}</span></div>
      {!active && <section className="desktop-intro"><div className="owner"><img src="/photos/studio.webp" alt="Biswajit Sao" /><span>Full Stack Developer</span></div><h1>Biswajit <em>Sao.</em></h1><p>Computer Science and Engineering</p><span className="home-location"><MapPin size={14} />Bankura, West Bengal, India</span><div className="home-actions"><button onClick={() => launch('portfolio')}><PanelsTopLeft size={17} />Open portfolio</button><button onClick={() => launch('docs')}><FileText size={16} />View résumé</button></div></section>}
      <aside className="desktop-files" aria-label="Desktop files">{desktopItems.map((n, i) => {
        const step = compact ? 64 : 79
        const left = n.position ? 'calc(' + n.position.x * 100 + '% - ' + n.position.x * 86 + 'px)' : (9 + Math.floor(i / rows) * 84) + 'px'
        const top = n.position ? 'calc(' + n.position.y * 100 + '% - ' + n.position.y * 78 + 'px)' : (63 + i % rows * step) + 'px'
        return <button draggable key={n.id} className={'shortcut ' + (compact ? 'small ' : '') + (cut === n.id ? 'cut' : '')} style={{ left, top }} onDragStart={e => { dismiss(); e.dataTransfer.setData(dragType, n.id); e.dataTransfer.effectAllowed = 'move' }} onDragOver={e => e.preventDefault()} onDrop={e => { if (n.kind === 'folder') { e.preventDefault(); e.stopPropagation(); move(e.dataTransfer.getData(dragType), n.id) } }} onContextMenu={e => { e.preventDefault(); contextAt(e.clientX, e.clientY, n) }} onClick={() => openItem(n)} title={n.name}><AppIcon name={itemIcon(n)} /><span>{n.name}</span></button>
      })}</aside>
      {windows.map((w, i) => <DesktopWindow key={w.id} id={w.id} minimized={w.minimized} index={i} front={w.id === active} footer={footers[w.id]} focus={() => focus(w.id)} minimize={() => minimize(w.id)} close={() => setWindows(prev => prev.filter(it => it.id !== w.id))}>{contents(w.id)}</DesktopWindow>)}
    </div>
    {context && <><button className="dismiss" aria-label="Close desktop options" onClick={dismiss} /><div className="context-menu" aria-label="Desktop context menu" style={{ left: Math.max(4, Math.min(context.x, size.w - 228)), top: Math.max(4, Math.min(context.y, size.h - (ctxItem ? 355 : 315))) }}>
      {ctxItem ? <><button onClick={() => openItem(ctxItem)}><PanelsTopLeft />Open</button><button onClick={() => ask({ type: 'rename', item: ctxItem })}><Pencil />Rename</button><button onClick={() => { setCut(ctxItem.id); dismiss() }}><Scissors />Cut</button><button onClick={() => ask({ type: 'move', item: ctxItem })}><FolderInput />Move to…</button></> : <><button onClick={() => { setCompact(!compact); dismiss() }}><LayoutGrid />{compact ? 'Medium icons' : 'Small icons'}</button><button onClick={() => { setItems(prev => [...prev].sort((a, b) => a.name.localeCompare(b.name)).map(n => n.parent === root ? { ...n, position: undefined } : n)); dismiss() }}><ListOrdered />Sort by name</button></>}
      {(!ctxItem || ctxItem.kind === 'folder') && <><hr /><button onClick={() => ask({ type: 'folder', parent: targetFolder }, context.atPointer ? point(context.x, context.y) : undefined)}><FolderPlus />New folder</button><button onClick={() => ask({ type: 'text', parent: targetFolder }, context.atPointer ? point(context.x, context.y) : undefined)}><FilePlus2 />New text file</button>{cut && <button onClick={() => { move(cut, targetFolder, context.atPointer ? point(context.x, context.y) : undefined); dismiss() }}><ClipboardPaste />Paste here</button>}<hr /><button onClick={() => { setCmdDir(targetFolder); open('cmd') }}><Terminal />Open in Terminal</button></>}
    </div></>}
    {action && <FileDialog action={action} items={items} submit={applyAction} close={() => setAction(null)} />}
    {menu && <><button className="dismiss" aria-label="Dismiss panel" onClick={dismiss} /><section className={'popup ' + (menu === 'start' ? 'start-menu' : 'tray-popup')} aria-label={menu === 'start' ? 'Start panel' : menu === 'calendar' ? 'Calendar' : 'Desktop guide'}>
      {menu === 'start' ? <><label className="start-search"><Search size={18} /><input ref={search} aria-label="Find apps and files" placeholder="Search for apps and files" value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { if (matches[0]) launch(matches[0].target); else { const file = items.find(n => n.name.toLowerCase().includes(query.toLowerCase())); if (file) openItem(file) } } }} /></label>
        <h2>{query ? 'Apps' : 'Pinned'}</h2><div className="start-grid">{matches.map(a => <button key={a.target} onClick={() => launch(a.target)}><AppIcon name={a.icon} />{a.label}</button>)}</div>
        <h2>{query ? 'Files' : recent.length ? 'Recent' : 'Recommended'}</h2><div className="recommended">{query ? items.filter(n => n.name.toLowerCase().includes(query.toLowerCase())).map(n => <button key={n.id} onClick={() => openItem(n)}><AppIcon name={itemIcon(n)} />{n.name}</button>) : (recent.length ? recent : ['docs', 'portfolio'] as Target[]).map(id => { const app = launchers.find(s => s.target === id) ?? { label: apps.note.title, icon: 'note' }; return <button key={id} onClick={() => id === 'note' ? open(id) : id === 'docs' ? launch(id) : open(id === 'projects' ? 'portfolio' : id)}><AppIcon name={app.icon} />{app.label}</button> })}{query && !matches.length && !items.some(n => n.name.toLowerCase().includes(query.toLowerCase())) && <p>No matching apps or files.</p>}</div>
        <div className="start-profile"><img src="/photos/studio.webp" alt="" /><strong>Biswajit Sao</strong><button title="Open contact" onClick={() => launch('contact')}><MessageSquare size={17} /></button></div></> : menu === 'calendar' ? <Calendar now={now} /> : <div className="guide"><h2>Desktop guide</h2><p><PanelTop />Right-click the desktop to create a folder or text file.</p><p><Keyboard />Press Ctrl + K to search apps and files.</p><p><Check />Drag items onto a folder, or use Move to in File Explorer.</p><small>Desktop icons by <a href="https://icons8.com/" target="_blank" rel="noreferrer">Icons8</a></small></div>}
    </section></>}
    {message && <p className="desktop-toast" role="status">{message}</p>}
    <footer className="taskbar"><div className="task-center"><button aria-label="Start menu" title="Start" aria-expanded={menu === 'start'} className="start-button" onClick={() => { setContext(null); setQuery(''); setMenu(menu === 'start' ? null : 'start') }}><WindowsMark /></button><button className="search-chip" onClick={() => { setContext(null); setMenu('start'); setQuery('') }}><Search size={15} /><span>Search</span></button>
      <div className="task-apps">{[...pinned, ...windows.map(w => w.id).filter(id => !pinned.includes(id))].map(id => <button key={id} title={apps[id].title} aria-label={'Taskbar ' + apps[id].title} onClick={() => { dismiss(); if (id === active) minimize(id); else if (windows.some(w => w.id === id)) open(id); else launch(id) }} className={'task-app ' + (windows.some(w => w.id === id) ? 'running ' : '') + (id === active ? 'active' : '')}><AppIcon name={apps[id].icon} /></button>)}</div></div>
      <div className="tray"><span className="tray-indicators"><Wifi size={16} /><Volume2 size={16} /></span><button className="task-clock" aria-label="Open calendar" onClick={() => { setContext(null); setMenu(menu === 'calendar' ? null : 'calendar') }}><span>{hour}</span><span>{now.toLocaleDateString('en-GB')}</span></button><button className="guide-button" aria-label="Desktop guide" onClick={() => { setContext(null); setMenu(menu === 'tips' ? null : 'tips') }}><MessageSquare size={16} /></button><button className="show-desktop" title="Show desktop" aria-label="Show desktop" onClick={() => { dismiss(); setWindows(prev => prev.map(w => ({ ...w, minimized: true }))) }} /></div></footer>
  </main>
}
export default App

