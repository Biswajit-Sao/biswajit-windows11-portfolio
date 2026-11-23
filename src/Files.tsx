import { useState } from 'react'
import { ArrowUp, FolderInput, FolderPlus, FilePlus2, MoreHorizontal, ChevronRight, Folder, FileText, Gamepad2, SquareTerminal, PanelsTopLeft } from 'lucide-react'
import { dragType, itemIcon, pathTo, root } from './desktop'
import type { Item } from './desktop'

export function AppIcon({name}:{name:string}){
  const icons={portfolio:PanelsTopLeft,cmd:SquareTerminal,game:Gamepad2,note:FileText}
  const Icon=icons[name as keyof typeof icons]
  return Icon?<span className={'drawn-icon icon-'+name}><Icon/></span>:<img className="app-icon" src={'/icons/'+name+'.png'} alt="" draggable={false}/>
}
export type FileAction={type:'folder';parent:string}|{type:'text';parent:string}|{type:'rename';item:Item}|{type:'move';item:Item}
export function FileExplorer({items,current,navigate,open,action,menu,move}:{items:Item[];current:string;navigate:(id:string)=>void;open:(n:Item)=>void;action:(a:FileAction)=>void;menu:(x:number,y:number,n:Item)=>void;move:(id:string,dest:string)=>void}){
  const currentNode=items.find(n=>n.id===current)
  const contents=items.filter(n=>n.parent===current)
  return <div className="file-explorer" onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();e.stopPropagation();const id=e.dataTransfer.getData(dragType);if(id)move(id,current)}}>
    <div className="file-path"><button title="Parent folder" aria-label="Parent folder" disabled={current===root} onClick={()=>navigate(currentNode?.parent??root)}><ArrowUp size={16}/></button><button onClick={()=>navigate(root)}>Desktop</button>{pathTo(items,current).slice(1).map((p,i)=><span key={i}><ChevronRight size={13}/>{p}</span>)}</div>
    <div className="file-tools"><button onClick={()=>action({type:'folder',parent:current})}><FolderPlus/> New folder</button><button onClick={()=>action({type:'text',parent:current})}><FilePlus2/> New text file</button></div>
    {contents.map(n=><div key={n.id} className="file-row" draggable onDragStart={e=>e.dataTransfer.setData(dragType,n.id)} onContextMenu={e=>{e.preventDefault();menu(e.clientX,e.clientY,n)}} onDrop={e=>{if(n.kind==='folder'){e.preventDefault();e.stopPropagation();move(e.dataTransfer.getData(dragType),n.id)}}}>
      <button className="file-open" onClick={()=>open(n)}><AppIcon name={itemIcon(n)}/><span>{n.name}</span></button><small>{n.kind==='folder'?'Folder':n.kind==='pdf'?'PDF document':n.kind==='text'?'Text file':'Shortcut'}</small>
      <button aria-label={'Move '+n.name} title="Move to folder" onClick={()=>action({type:'move',item:n})}><FolderInput size={16}/></button><button aria-label={'Options for '+n.name} onClick={e=>{const r=e.currentTarget.getBoundingClientRect();menu(r.left,r.bottom,n)}}><MoreHorizontal size={17}/></button></div>)}
    {!contents.length&&<div className="empty-bin"><Folder/><p>This folder is empty.</p></div>}</div>
}
export function FileDialog({action,items,submit,close}:{action:FileAction;items:Item[];submit:(value:string)=>string;close:()=>void}){
  const move=action.type==='move'
  const [value,setValue]=useState(move?root:action.type==='rename'?action.item.name:action.type==='folder'?'New folder':'New file.txt')
  const [error,setError]=useState('')
  return <div className="dialog-veil" onPointerDown={e=>{if(e.target===e.currentTarget)close()}}><form role="dialog" aria-modal="true" aria-label="File operation" className="file-dialog" onSubmit={e=>{e.preventDefault();const issue=submit(value);if(issue)setError(issue);else close()}}>
    <h2>{move?'Move '+action.item.name:action.type==='rename'?'Rename item':action.type==='folder'?'Create folder':'Create text file'}</h2>
    {move?<label>Destination<select autoFocus value={value} onChange={e=>setValue(e.target.value)}><option value={root}>Desktop</option>{items.filter(n=>n.kind==='folder'&&n.id!==action.item.id).map(n=><option key={n.id} value={n.id}>{pathTo(items,n.id).join(' / ')}</option>)}</select></label>:<label>Name<input autoFocus maxLength={100} value={value} onFocus={e=>e.target.select()} onChange={e=>setValue(e.target.value)}/></label>}
    {error&&<p role="alert">{error}</p>}<div className="actions"><button type="submit" className="primary">{move?'Move':action.type==='rename'?'Save':'Create'}</button><button type="button" className="secondary" onClick={close}>Cancel</button></div></form></div>
}



