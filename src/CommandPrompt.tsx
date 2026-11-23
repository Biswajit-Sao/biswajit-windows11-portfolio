import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { pathTo, root } from './desktop'
import type { Item } from './desktop'

const help='dir           List files and folders\ncd <folder>   Change folder (.. goes up)\nmkdir <name>  Create a folder\ntype <file>   Read a text file\nstart <name>  Open a file, folder or shortcut\nwhoami        Show the desktop owner\ncls           Clear the screen'
export default function CommandPrompt({items,initial,create,open}:{items:Item[];initial:string;create:(parent:string,name:string)=>string;open:(item:Item)=>void}) {
  const [cwd,setCwd]=useState(initial)
  const [lines,setLines]=useState<string[]>([])
  const [value,setValue]=useState('')
  const [history,setHistory]=useState<string[]>([])
  const [cursor,setCursor]=useState(0)
  const bottom=useRef<HTMLDivElement>(null)
  const prompt='C:\\Users\\Biswajit\\'+pathTo(items,cwd).join('\\')+'>'
  useEffect(()=>{bottom.current?.scrollIntoView({block:'nearest'})},[lines])
  function submit(e:FormEvent){
    e.preventDefault()
    const line=value.trim()
    if(!line)return
    const [,verb,arg='']=line.match(/^(\S+)(?:\s+([\s\S]*))?$/)!
    const name=arg.replace(/^"(.*)"$/,'$1')
    const children=items.filter(v=>v.parent===cwd)
    const entry=children.find(v=>v.name.toLowerCase()===name.toLowerCase())
    let out=''
    switch(verb.toLowerCase()){
      case 'help':out=help;break
      case 'dir':out=children.map(n=>(n.kind==='folder'?'<DIR>   ':'        ')+n.name).join('\n')||'Folder is empty.';break
      case 'whoami':out='Biswajit Sao · Full Stack Developer';break
      case 'cd':
        if(!name)out=prompt.slice(0,-1)
        else if(name==='..')setCwd(items.find(v=>v.id===cwd)?.parent??root)
        else if(name==='\\')setCwd(root)
        else if(entry?.kind==='folder')setCwd(entry.id)
        else out='Folder not found.'
        break
      case 'mkdir':out=create(cwd,name)||'Folder created.';break
      case 'type':out=entry?.kind==='text'?(entry.body||'(empty file)'):'Choose a text file in this folder.';break
      case 'start':if(entry)open(entry);else out='File or folder not found.';break
      case 'cls':break
      default:out='Unknown command. Type help to list desktop commands.'
    }
    setLines(prev=>verb.toLowerCase()==='cls'?[]:[...prev,prompt+line,out].filter(Boolean))
    setHistory(prev=>[...prev,line]);setCursor(history.length+1);setValue('')
  }
  return <div className="cmd-screen"><p>Portfolio Desktop [Version 11.0]</p><p>Type <b>help</b> for available commands.</p><br/>{lines.map((line,i)=><pre key={i}>{line}</pre>)}<form onSubmit={submit}><label>{prompt}<input autoFocus aria-label="Command" spellCheck={false} autoComplete="off" value={value} onChange={e=>setValue(e.target.value)} onKeyDown={e=>{if(e.key==='ArrowUp'||e.key==='ArrowDown'){e.preventDefault();const n=Math.max(0,Math.min(history.length,cursor+(e.key==='ArrowUp'?-1:1)));setValue(history[n]??'');setCursor(n)}}}/></label></form><div ref={bottom}/></div>
}
