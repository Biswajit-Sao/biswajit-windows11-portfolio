import { useState } from 'react'
import { Bomb, Flag, RotateCcw } from 'lucide-react'

const side=8, total=side*side, mineCount=10
function neighbors(i:number) {
  const adjacent:number[]=[]
  for(let y=-1;y<=1;y++)for(let x=-1;x<=1;x++){
    const col=i%side+x,row=Math.floor(i/side)+y
    if((x||y)&&col>=0&&row>=0&&col<side&&row<side)adjacent.push(row*side+col)
  }
  return adjacent
}
function placeMines(first:number){
  const safe=new Set([first,...neighbors(first)])
  const candidates=Array.from({length:total},(_,i)=>i).filter(i=>!safe.has(i))
  const mines=new Set<number>()
  while(mines.size<mineCount)mines.add(candidates.splice(Math.floor(Math.random()*candidates.length),1)[0])
  return mines
}
export default function Minesweeper() {
  const [mines,setMines]=useState<Set<number>|null>(null)
  const [opened,setOpened]=useState(new Set<number>())
  const [flags,setFlags]=useState(new Set<number>())
  const [lost,setLost]=useState(false)
  const [flagMode,setFlagMode]=useState(false)
  const won=opened.size===total-mineCount
  function flag(i:number){
    if(lost||won||opened.has(i))return
    const next=new Set(flags)
    if(next.has(i))next.delete(i)
    else if(next.size<mineCount)next.add(i)
    setFlags(next)
  }
  function reveal(i:number){
    if(lost||won||opened.has(i))return
    if(flagMode){flag(i);return}
    if(flags.has(i))return
    const field=mines??placeMines(i)
    setMines(field)
    if(field.has(i)){setLost(true);return}
    const next=new Set(opened),queue=[i]
    while(queue.length){
      const cell=queue.pop()!
      if(next.has(cell)||flags.has(cell))continue
      next.add(cell)
      const adjacent=neighbors(cell)
      if(adjacent.every(n=>!field.has(n)))queue.push(...adjacent)
    }
    setOpened(next)
  }
  function reset(){setMines(null);setOpened(new Set());setFlags(new Set());setLost(false);setFlagMode(false)}
  return <div className="mine-game"><div className="mine-head"><div><small>Classic · 8 × 8</small><h2>Minesweeper</h2></div><button onClick={reset} aria-label="New game"><RotateCcw size={17}/></button></div>
    <div className="mine-tools"><span><Bomb size={15}/> {mineCount-flags.size} remaining</span><button aria-pressed={flagMode} onClick={()=>setFlagMode(!flagMode)}><Flag size={14}/> Flag mode</button></div>
    <div className="mine-board">{Array.from({length:total},(_,i)=>{
      const count=neighbors(i).filter(n=>mines?.has(n)).length
      const bomb=lost&&mines?.has(i),show=opened.has(i)
      const label=bomb?'Mine':flags.has(i)?'Flagged':show?count+' adjacent mines':'Covered'
      return <button key={i} className={bomb?'exploded':show?'revealed n'+count:''} aria-label={'Row '+(Math.floor(i/side)+1)+', column '+(i%side+1)+', '+label} onClick={()=>reveal(i)} onContextMenu={e=>{e.preventDefault();flag(i)}}>{bomb?<Bomb size={15}/>:flags.has(i)?<Flag size={14}/>:show&&count?count:''}</button>
    })}</div><p role="status">{lost?'Mine hit. Start a new game to try again.':won?'Field cleared. You won!':'Reveal safe squares. Use flags to mark suspected mines.'}</p></div>
}
