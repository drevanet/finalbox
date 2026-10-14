"use client";
import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import type { BoxDesign, Face } from "@/components/box-preview";
import { Download, RotateCcw, Save, ImagePlus, Trash2 } from "lucide-react";
const BoxPreview = dynamic(() => import("@/components/box-preview"), { ssr: false, loading: () => <div className="h-[420px] animate-pulse rounded-3xl bg-slate-100"/> });
const faces = ["front","back","left","right","top","bottom"] as const;
const initial: BoxDesign = {
  front:{title:"BETTY BOTANICALS",text:"Nourish your natural glow",color:"#d9e8bc",image:""},
  back:{title:"OUR STORY",text:"Made with care. Designed for you.",color:"#e4edda",image:""},
  left:{title:"INGREDIENTS",text:"Thoughtfully selected ingredients",color:"#e8ead8",image:""},
  right:{title:"HOW TO USE",text:"Use daily for best results",color:"#dce8ce",image:""},
  top:{title:"BETTY",text:"",color:"#c7d7a8",image:""},
  bottom:{title:"DETAILS",text:"Net wt. 100 g",color:"#e6e9db",image:""}
};
export default function BoxEditor() {
  const [design,setDesign] = useState<BoxDesign>(initial);
  const [active,setActive] = useState<keyof BoxDesign>("front");
  const [name,setName] = useState("Botanical skincare");
  const fileRef = useRef<HTMLInputElement>(null);
  const current = design[active];
  function change(patch: Partial<Face>) { setDesign(old => ({...old,[active]:{...old[active],...patch}})); }
  function uploadImage(file?: File) {
    if (!file) return;
    if (!(["image/png","image/jpeg","image/webp"].includes(file.type))) { alert("Choose a JPG, PNG, or WebP image."); return; }
    if (file.size > 5 * 1024 * 1024) { alert("Please choose an image smaller than 5 MB."); return; }
    const reader = new FileReader();
    reader.onload = () => change({ image: String(reader.result || "") });
    reader.onerror = () => alert("Could not read this image. Please try another file.");
    reader.readAsDataURL(file);
  }
  async function download() {
    const response = await fetch("/api/download",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name,design})});
    if (response.status === 401) { window.location.href="/sign-in?next=/editor"; return; }
    if (response.status === 402) { window.location.href="/pricing?required=download"; return; }
    if (!response.ok) { alert("Could not start download. Please try again."); return; }
    const blob=await response.blob(), url=URL.createObjectURL(blob), a=document.createElement("a");
    a.href=url;a.download="betty-box-design.json";a.click();URL.revokeObjectURL(url);
  }
  function saveProject() { const blob=new Blob([JSON.stringify({name,design},null,2)],{type:"application/json"}); const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download="betty-project.json"; a.click(); URL.revokeObjectURL(url); }
  return <div className="grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
    <div className="space-y-4"><div className="flex flex-wrap items-center justify-between gap-3"><input aria-label="Project name" className="rounded-xl border px-4 py-3 font-bold" value={name} onChange={e=>setName(e.target.value)}/><span className="rounded-full bg-violet-50 px-3 py-2 text-xs font-bold text-brand">LIVE 3D PREVIEW</span></div><BoxPreview design={design}/><p className="text-sm text-slate-500">Drag to rotate the box. Select any of the six face tabs to edit its text, color, and image.</p></div>
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft md:p-7">
      <div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-brand">Design studio</p><h2 className="mt-1 text-2xl font-black">Edit your box</h2></div><button onClick={()=>setDesign(initial)} className="rounded-xl border p-3" aria-label="Reset design"><RotateCcw size={17}/></button></div>
      <div className="mt-6 grid grid-cols-3 gap-2">{faces.map(face=><button key={face} onClick={()=>setActive(face)} className={`rounded-xl border px-2 py-3 text-sm font-bold capitalize ${active===face?"border-brand bg-violet-50 text-brand":"border-slate-200 text-slate-600"}`}>{face}{design[face].image ? " ✓" : ""}</button>)}</div>
      <div className="mt-6 space-y-4"><label className="block text-sm font-bold">Face headline<input className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-brand" value={current.title} onChange={e=>change({title:e.target.value})}/></label><label className="block text-sm font-bold">Supporting text<textarea rows={3} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-brand" value={current.text} onChange={e=>change({text:e.target.value})}/></label><label className="flex items-center justify-between text-sm font-bold">Face background color<input aria-label="Face background color" type="color" className="h-11 w-16 cursor-pointer rounded-lg border p-1" value={current.color} onChange={e=>change({color:e.target.value})}/></label>
      <div className="rounded-2xl border border-dashed border-slate-300 p-4"><p className="text-sm font-bold">Artwork for the {active} face</p>{current.image ? <div className="mt-3"><img src={current.image} alt={`${active} face artwork`} className="max-h-44 w-full rounded-xl object-contain bg-slate-50"/><button type="button" onClick={()=>change({image:""})} className="mt-3 inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-bold text-red-600"><Trash2 size={15}/> Remove image</button></div> : <p className="mt-1 text-xs leading-5 text-slate-500">Upload a separate image for this face. JPG, PNG, or WebP, up to 5 MB.</p>}<input ref={fileRef} className="hidden" type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>{uploadImage(e.target.files?.[0]); e.currentTarget.value="";}}/><button type="button" onClick={()=>fileRef.current?.click()} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 font-bold hover:bg-slate-50"><ImagePlus size={17}/>{current.image ? "Replace image" : "Upload image to this face"}</button></div>
      </div>
      <div className="mt-7 grid gap-3 sm:grid-cols-2"><button onClick={saveProject} className="inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3 font-bold"><Save size={17}/> Save project</button><button onClick={download} className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 font-bold text-white"><Download size={17}/> Download design</button></div>
      <p className="mt-3 text-xs leading-5 text-slate-500">Uploaded images are included in the saved project JSON. Downloads require an active subscription.</p>
    </div>
  </div>;
}
