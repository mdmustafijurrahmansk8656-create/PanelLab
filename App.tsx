import { useMemo, useState } from 'react';
import { Download, FilePlus2, MousePointer2, Cable, Trash2, Zap, Search, Save } from 'lucide-react';

type Kind = 'MCB' | 'Contactor' | 'Overload' | 'Capacitor' | 'Push button' | 'Lamp';
type Device = { id: number; kind: Kind; x: number; y: number; tag: string };
type Wire = { id: number; from: number; to: number };
const palette: { kind: Kind; subtitle: string }[] = [
  { kind: 'MCB', subtitle: '3-pole breaker' }, { kind: 'Contactor', subtitle: 'Coil + 3 poles' },
  { kind: 'Overload', subtitle: 'Motor protection' }, { kind: 'Capacitor', subtitle: 'PFC capacitor' },
  { kind: 'Push button', subtitle: 'Start / Stop' }, { kind: 'Lamp', subtitle: 'Pilot lamp' }
];
const dims: Record<Kind, { w: number; h: number }> = { MCB:{w:74,h:96}, Contactor:{w:92,h:112}, Overload:{w:92,h:84}, Capacitor:{w:92,h:104}, 'Push button':{w:82,h:72}, Lamp:{w:72,h:72} };
function App() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [wires, setWires] = useState<Wire[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [wireMode, setWireMode] = useState(false);
  const [wireStart, setWireStart] = useState<number | null>(null);
  const [query, setQuery] = useState('');
  const [projectName, setProjectName] = useState('Untitled Motor Panel');
  const [notice, setNotice] = useState('Choose a device on the left to add it to the drawing.');
  const filtered = useMemo(() => palette.filter(p => p.kind.toLowerCase().includes(query.toLowerCase())), [query]);
  function addDevice(kind: Kind) {
    const id = Date.now() + Math.floor(Math.random()*1000);
    const n = devices.filter(d=>d.kind===kind).length + 1;
    const d: Device = { id, kind, x: 110 + (devices.length % 4) * 150, y: 100 + Math.floor(devices.length/4)*155, tag: ({MCB:'QF',Contactor:'KM',Overload:'FR',Capacitor:'C','Push button':'S',Lamp:'H'} as Record<Kind,string>)[kind] + n };
    setDevices(v=>[...v,d]); setSelected(id); setNotice(`${d.tag} added. Select Wire mode to connect devices.`);
  }
  function connectDevice(id: number) {
    if (!wireMode) { setSelected(id); return; }
    if (wireStart === null) { setWireStart(id); setNotice('Now choose the second device to create a draft wire.'); return; }
    if (wireStart !== id) { setWires(v=>[...v,{id:Date.now(),from:wireStart,to:id}]); setNotice('Draft wire added. This first version draws device-to-device wires, not terminal-level electrical simulation yet.'); }
    setWireStart(null);
  }
  function removeSelected() { if (selected===null) return; setDevices(v=>v.filter(d=>d.id!==selected)); setWires(v=>v.filter(w=>w.from!==selected&&w.to!==selected)); setSelected(null); }
  function saveProject() { const data = { app:'PanelLab', version:1, projectName, devices, wires }; const blob = new Blob([JSON.stringify(data,null,2)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=`${projectName.toLowerCase().replace(/[^a-z0-9]+/g,'-')}.json`; a.click(); URL.revokeObjectURL(a.href); setNotice('Project JSON downloaded.'); }
  function exportPdf() { window.print(); }
  function reset() { if(confirm('Start a new empty project?')) {setDevices([]);setWires([]);setSelected(null);setNotice('New empty project ready.');} }
  const byId = (id:number) => devices.find(d=>d.id===id);
  return <div className="app-shell">
    <header className="topbar"><div className="brand"><div className="brand-icon"><Zap size={22}/></div><div><strong>PanelLab</strong><small>Electrical panel designer · prototype v0.1</small></div></div><div className="top-actions"><button className="ghost" onClick={reset}><FilePlus2 size={17}/> New</button><button className="ghost" onClick={saveProject}><Save size={17}/> Save project</button><button className="primary" onClick={exportPdf}><Download size={17}/> Export PDF</button></div></header>
    <div className="project-strip"><label>Project name <input value={projectName} onChange={e=>setProjectName(e.target.value)} /></label><span className="prototype-pill">Prototype · local only</span></div>
    <main className="workspace">
      <aside className="sidebar"><div className="side-heading"><div><h2>Device library</h2><p>Click to place a device</p></div></div><div className="searchbox"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search devices" /></div><div className="palette">{filtered.map(item=><button className="palette-item" key={item.kind} onClick={()=>addDevice(item.kind)}><span className={`mini-symbol ${item.kind.toLowerCase().replace(' ','-')}`}>{item.kind==='Capacitor'?'||':item.kind==='Lamp'?'◉':item.kind==='Push button'?'○':item.kind==='Contactor'?'KM':item.kind==='Overload'?'FR':'QF'}</span><span><strong>{item.kind}</strong><small>{item.subtitle}</small></span><span className="plus">+</span></button>)}</div><div className="library-note"><strong>Next milestone</strong><p>Real IEC terminals, wire snapping and electrical rules will be added after this canvas prototype.</p></div></aside>
      <section className="editor"><div className="toolbar"><div><strong>Drawing canvas</strong><span>{devices.length} devices · {wires.length} draft wires</span></div><div className="tools"><button className={wireMode?'tool active':'tool'} onClick={()=>{setWireMode(v=>!v);setWireStart(null);setNotice(!wireMode?'Wire mode on: choose two devices.':'Selection mode on.')}}><Cable size={17}/> Wire</button><button className="tool" disabled={selected===null} onClick={removeSelected}><Trash2 size={17}/> Delete</button></div></div>
        <div className="canvas-wrap"><svg className="canvas" viewBox="0 0 1000 680" role="img" aria-label="Electrical panel drawing canvas"><defs><pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M 24 0 L 0 0 0 24" fill="none" stroke="#e5eaf1" strokeWidth="1"/></pattern></defs><rect width="1000" height="680" fill="url(#grid)"/>
          {wires.map(w=>{const a=byId(w.from),b=byId(w.to); if(!a||!b)return null; const da=dims[a.kind],db=dims[b.kind]; return <polyline key={w.id} points={`${a.x+da.w/2},${a.y+da.h} ${a.x+da.w/2},${(a.y+da.h+b.y)/2} ${b.x+db.w/2},${(a.y+da.h+b.y)/2} ${b.x+db.w/2},${b.y}`} fill="none" stroke="#e59a27" strokeWidth="3" strokeLinejoin="round"/>;})}
          {devices.map(d=>{const {w,h}=dims[d.kind];return <g key={d.id} transform={`translate(${d.x},${d.y})`} onClick={()=>connectDevice(d.id)} className="device-node" style={{cursor:'pointer'}}><rect width={w} height={h} rx="9" fill={selected===d.id?'#e6f2ff':'#ffffff'} stroke={selected===d.id?'#2373b9':'#8b9aaf'} strokeWidth={selected===d.id?3:1.5}/><text x={w/2} y="21" textAnchor="middle" fontSize="11" fontWeight="700" fill="#1e2b40">{d.tag}</text>
          {d.kind==='MCB'&&<g stroke="#53647a" strokeWidth="3" fill="none"><line x1={w/2} y1="30" x2={w/2} y2="63"/><rect x={w/2-15} y="36" width="30" height="24" rx="4" fill="#edf2f7"/><line x1="14" y1="29" x2="14" y2="39"/><line x1={w/2} y1="63" x2={w/2+10} y2="76"/></g>}
          {d.kind==='Contactor'&&<g stroke="#53647a" strokeWidth="2" fill="none"><rect x="15" y="30" width={w-30} height="58" rx="4"/><line x1="24" y1="43" x2={w-24} y2="43"/><line x1="24" y1="55" x2={w-24} y2="55"/><path d={`M ${w/2-12} 72 l 24 0 m -12 -9 l 0 18`}/></g>}
          {d.kind==='Overload'&&<g stroke="#53647a" strokeWidth="2" fill="none"><rect x="15" y="29" width={w-30} height="38" rx="4"/><path d={`M 25 42 l 12 0 l 6 12 l 12 -12 l 12 0`}/></g>}
          {d.kind==='Capacitor'&&<g stroke="#2373b9" strokeWidth="3"><line x1={w/2-14} y1="38" x2={w/2+14} y2="38"/><line x1={w/2-14} y1="47" x2={w/2+14} y2="47"/><line x1={w/2-14} y1="60" x2={w/2+14} y2="60"/><line x1={w/2-14} y1="69" x2={w/2+14} y2="69"/></g>}
          {d.kind==='Push button'&&<g><circle cx={w/2} cy="42" r="16" fill="#e8f2ff" stroke="#2373b9" strokeWidth="3"/><circle cx={w/2} cy="42" r="6" fill="#2373b9"/></g>}
          {d.kind==='Lamp'&&<g><circle cx={w/2} cy="42" r="20" fill="#fff4c6" stroke="#d59c20" strokeWidth="2.5"/><path d={`M ${w/2-10} 32 l 20 20 m 0 -20 l -20 20`} stroke="#d59c20" strokeWidth="2"/></g>}
          <text x={w/2} y={h-9} textAnchor="middle" fontSize="10" fill="#5b6a7d">{d.kind}</text><circle cx={w/2} cy="0" r="4" fill="#2373b9"/><circle cx={w/2} cy={h} r="4" fill="#2373b9"/></g>})}
          {devices.length===0&&<g><text x="500" y="300" textAnchor="middle" fontSize="23" fill="#8c99aa">Your drawing starts here</text><text x="500" y="332" textAnchor="middle" fontSize="15" fill="#a0aaba">Add a device from the left library</text></g>}
        </svg></div><div className="statusbar"><span><MousePointer2 size={15}/>{wireMode?(wireStart===null?'Wire mode: choose first device':'Wire mode: choose second device'):'Select mode'}</span><span>{notice}</span></div>
      </section>
      <aside className="properties"><h2>Properties</h2>{selected!==null&&byId(selected)?<><p className="property-type">Selected device</p><div className="property-card"><span className="property-symbol">{byId(selected)!.tag}</span><div><strong>{byId(selected)!.kind}</strong><small>IEC tag</small></div></div><label>Tag<input value={byId(selected)!.tag} onChange={e=>setDevices(v=>v.map(d=>d.id===selected?{...d,tag:e.target.value}:d))}/></label><label>Position X<input type="number" value={byId(selected)!.x} onChange={e=>setDevices(v=>v.map(d=>d.id===selected?{...d,x:Number(e.target.value)}:d))}/></label><label>Position Y<input type="number" value={byId(selected)!.y} onChange={e=>setDevices(v=>v.map(d=>d.id===selected?{...d,y:Number(e.target.value)}:d))}/></label><button className="danger" onClick={removeSelected}><Trash2 size={16}/> Remove device</button></>:<div className="empty-props"><div className="empty-icon">⌁</div><strong>No device selected</strong><p>Add or select a device to view its properties.</p></div>}<div className="warning"><strong>Simulation status</strong><p>This is an early UI prototype. It does not yet calculate voltage, current, overload trips, or capacitor kvar.</p></div></aside>
    </main><footer>PanelLab · Prototype only · Validate all real-world designs against IEC requirements and qualified engineering review.</footer>
  </div>
}
export default App;
