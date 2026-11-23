import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Download, Minus, Plus } from 'lucide-react'
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'
import type { PDFDocumentProxy, RenderTask } from 'pdfjs-dist'
import worker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { documents } from './data'

GlobalWorkerOptions.workerSrc=worker
export default function PdfReader({index,select}:{index:number;select:(i:number)=>void}) {
  const [doc,setDoc]=useState<PDFDocumentProxy|null>(null)
  const [page,setPage]=useState(1)
  const [zoom,setZoom]=useState(1)
  const [width,setWidth]=useState(640)
  const [error,setError]=useState('')
  const [pageText,setPageText]=useState('')
  const area=useRef<HTMLDivElement>(null)
  const canvas=useRef<HTMLCanvasElement>(null)
  const url='/documents/'+documents[index].file
  useEffect(()=>{
    let alive=true
    const task=getDocument({url})
    task.promise.then(pdf=>{if(alive)setDoc(pdf)}).catch(()=>{if(alive)setError('The document could not be displayed. Use Download to open the PDF.')})
    return ()=>{alive=false;void task.destroy()}
  },[url])
  useEffect(()=>{
    const observer=new ResizeObserver(([entry])=>{if(entry.contentRect.width>0)setWidth(entry.contentRect.width)})
    observer.observe(area.current!)
    return ()=>observer.disconnect()
  },[])
  useEffect(()=>{
    if(!doc)return
    let alive=true
    let task:RenderTask|undefined
    const render=async()=>{
      const pdfPage=await doc.getPage(page)
      if(!alive||!canvas.current)return
      const scale=Math.max(150,width-32)/pdfPage.getViewport({scale:1}).width*zoom
      const viewport=pdfPage.getViewport({scale})
      const pixelRatio=Math.min(window.devicePixelRatio||1,2)
      const el=canvas.current
      el.width=Math.ceil(viewport.width*pixelRatio)
      el.height=Math.ceil(viewport.height*pixelRatio)
      el.style.width=viewport.width+'px'
      el.style.height=viewport.height+'px'
      task=pdfPage.render({canvas:el,viewport,transform:[pixelRatio,0,0,pixelRatio,0,0]})
      await task.promise
      const content=await pdfPage.getTextContent()
      if(alive)setPageText(content.items.map(item=>'str' in item?item.str:'').join(' '))
    }
    render().catch(()=>{if(alive)setError('Unable to render this page. Use the download button for the original PDF.')})
    return ()=>{alive=false;task?.cancel()}
  },[doc,page,width,zoom])
  function turn(next:number){setPage(next);area.current?.scrollTo(0,0)}
  return <div className="pdf-reader"><div className="pdf-toolbar">
    <select aria-label="Choose PDF" value={index} onChange={e=>select(Number(e.target.value))}>{documents.map((d,i)=><option key={d.file} value={i}>{d.name}</option>)}</select>
    <div><button aria-label="Previous page" disabled={page<=1} onClick={()=>turn(page-1)}><ChevronLeft/></button><span> {page} / {doc?.numPages??documents[index].pages} </span><button aria-label="Next page" disabled={!doc||page>=doc.numPages} onClick={()=>turn(page+1)}><ChevronRight/></button></div>
    <div><button aria-label="Zoom out" disabled={zoom<=0.75} onClick={()=>setZoom(zoom-.25)}><Minus/></button><span>{zoom*100}%</span><button aria-label="Zoom in" disabled={zoom>=2} onClick={()=>setZoom(zoom+.25)}><Plus/></button></div>
    <a href={url} download aria-label="Download PDF" title="Download PDF"><Download size={17}/></a></div>
    <div className="pdf-area" ref={area}>{error?<p role="alert">{error}</p>:<>{!doc&&<p>Opening PDF…</p>}<canvas ref={canvas} aria-label={documents[index].name+', page '+page}/><p className="sr-only">{pageText}</p></>}</div></div>
}

