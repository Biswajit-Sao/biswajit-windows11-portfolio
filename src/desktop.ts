export const apps = {
  portfolio: {title:'Portfolio',icon:'portfolio'},
  pc: {title:'File Explorer',icon:'projects'},
  docs: {title:'PDF Reader',icon:'resume'},
  photos: {title:'Photos',icon:'photos'},
  contact: {title:'Contact',icon:'contact'},
  cmd: {title:'Command Prompt',icon:'cmd'},
  game: {title:'Minesweeper',icon:'game'},
  note: {title:'Notepad',icon:'note'},
  bin: {title:'Recycle Bin',icon:'bin'}
}
export type AppId = keyof typeof apps
export type Target = AppId | 'projects'
export type Item = {
  id:string; name:string; parent:string; kind:'folder'|'text'|'shortcut'|'pdf'
  target?:Target; doc?:number; body?:string; position?:{x:number;y:number}
}
export const root='desktop'
export const initialItems:Item[]=[
  {id:'pc',name:'This PC',kind:'shortcut',target:'pc',parent:root},
  {id:'projects',name:'My Projects',kind:'shortcut',target:'projects',parent:root},
  {id:'resume',name:'Résumé.pdf',kind:'pdf',doc:0,parent:root},
  {id:'photos',name:'Photos',kind:'shortcut',target:'photos',parent:root},
  {id:'cmd',name:'Terminal',kind:'shortcut',target:'cmd',parent:root},
  {id:'game',name:'Minesweeper',kind:'shortcut',target:'game',parent:root},
  {id:'work',name:'My Files',kind:'folder',parent:root},
  {id:'cv',name:'Curriculum Vitae.pdf',kind:'pdf',doc:1,parent:'work'}
]
export const launchers: {label:string;target:Target;icon:string}[]=[
  ...(['portfolio','pc','docs','photos','cmd','game','contact','bin'] as const).map(id=>({label:apps[id].title,target:id,icon:apps[id].icon})),
  {label:'My Projects',target:'projects',icon:'projects'}
]
export function itemIcon(item:Item) {
  if(item.kind==='folder'||item.target==='projects')return 'projects'
  if(item.kind==='pdf')return 'resume'
  if(item.target==='pc')return 'pc'
  return item.target?apps[item.target].icon:'note'
}
export function pathTo(items:Item[],id:string) {
  const result:string[]=[]
  const visited=new Set<string>()
  while(id!==root&&!visited.has(id)) {
    visited.add(id)
    const node=items.find(v=>v.id===id)
    if(!node)break
    result.unshift(node.name)
    id=node.parent
  }
  return ['Desktop',...result]
}
export function moveIssue(items:Item[],id:string,parent:string) {
  const node=items.find(n=>n.id===id)
  if(!node)return 'Item no longer exists.'
  let dest=parent
  const visited=new Set<string>()
  while(dest!==root) {
    const folder=items.find(n=>n.id===dest&&n.kind==='folder')
    if(dest===id||visited.has(dest))return 'Choose a folder outside this folder.'
    if(!folder)return 'Choose an existing folder.'
    visited.add(dest)
    dest=folder.parent
  }
  return nameIssue(items,node.name,parent,id)
}
export function nameIssue(items:Item[],name:string,parent:string,except='') {
  if(!name.trim()||name.trim()==='.'||name.trim()==='..'||/[\\/:*?"<>|]/.test(name))return 'Enter a valid file or folder name.'
  return items.some(n=>n.parent===parent&&n.id!==except&&n.name.toLowerCase()===name.trim().toLowerCase())?'This name is already in use.':''
}
export const dragType='application/x-portfolio-item'
