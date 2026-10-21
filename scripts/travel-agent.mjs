#!/usr/bin/env node
// Zero-dependency structured tools for fast trip inspection and optimistic batch edits.
import { readFile, writeFile, readdir, rename } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { createHash } from 'node:crypto';
import { performance } from 'node:perf_hooks';
const dir = resolve(process.cwd(), 'content/trips');
const [command,id,arg] = process.argv.slice(2);
const valid = value => /^[a-zA-Z0-9_-]+$/.test(value ?? '');
const tripFile = value => { if (!valid(value)) throw Error('Invalid trip id'); return join(dir, value+'.md'); };
const hash = data => createHash('sha256').update(data).digest('hex');
const read = async value => { const raw=await readFile(tripFile(value),'utf8'); return {raw,revision:hash(raw)}; };
const respond = obj => process.stdout.write(JSON.stringify(obj)+'\n');
try {
  const t0=performance.now();
  if (command==='list') {
    respond({trips:(await readdir(dir)).filter(v=>/^[\w-]+\.md$/.test(v)).map(v=>v.slice(0,-3))});
  } else if (command==='day') {
    const {raw,revision}=await read(id);
    const lines=raw.split(/\r?\n/);
    const title=arg;
    const start=lines.findIndex(v=>v.startsWith('### ') && (v===title || v.includes(title??'\u0000')));
    if(start<0) throw Error('Day not found');
    let end=start+1; while(end<lines.length && !/^#{1,3} /.test(lines[end])) end++;
    respond({trip:id,revision,startLine:start+1,lines:lines.slice(start,end),elapsedMs:Math.round(performance.now()-t0)});
  } else if (command==='search') {
    const q=(id??'').toLocaleLowerCase('pt-BR'); if(q.length<2) throw Error('Query too short');
    const names=(await readdir(dir)).filter(v=>/^[\w-]+\.md$/.test(v));
    const found=[];
    for(const name of names) {
      const lines=(await readFile(join(dir,name),'utf8')).split(/\r?\n/);
      for(let i=0;i<lines.length;i++) if(lines[i].toLocaleLowerCase('pt-BR').includes(q))
        found.push({trip:name.slice(0,-3),line:i+1,text:lines[i]});
    }
    respond({matches:found.slice(0,100),truncated:found.length>100,elapsedMs:Math.round(performance.now()-t0)});
  } else if(command==='batch') {
    // JSON file: {revision, edits:[{before:string[],after:string[]}]}
    // Each 'before' must occur exactly once, preventing ambiguous or stale edits.
    const {raw,revision}=await read(id);
    const payload=JSON.parse(await readFile(resolve(arg),'utf8'));
    if(payload.revision!==revision) throw Error('Conflict: revision changed; read again');
    if(!Array.isArray(payload.edits)||!payload.edits.length||payload.edits.length>100) throw Error('Invalid edits');
    let lines=raw.split(/\r?\n/);
    for(const edit of payload.edits) {
      if(!Array.isArray(edit.before)||!edit.before.length||!Array.isArray(edit.after)||
        ![...edit.before,...edit.after].every(v=>typeof v==='string'&&!/[\r\n]/.test(v))) throw Error('Invalid patch');
      const hits=[];
      for(let i=0;i<=lines.length-edit.before.length;i++)
        if(edit.before.every((v,j)=>lines[i+j]===v)) hits.push(i);
      if(hits.length!==1) throw Error('Conflict: expected unique matching block');
      lines.splice(hits[0],edit.before.length,...edit.after);
    }
    const updated=lines.join(raw.includes('\r\n')?'\r\n':'\n');
    const target=tripFile(id);
    // Check again before writing; rename prevents partial file writes.
    if(hash(await readFile(target,'utf8'))!==revision) throw Error('Conflict: concurrent change');
    const tmp=target+'.'+process.pid+'.tmp';
    await writeFile(tmp,updated,{flag:'wx'});
    await rename(tmp,target);
    respond({trip:id,revision:hash(updated),edits:payload.edits.length,elapsedMs:Math.round(performance.now()-t0)});
  } else throw Error('Usage: node scripts/travel-agent.mjs list | day <trip> <heading> | search <text> | batch <trip> <edits.json>');
} catch(error) { console.error(JSON.stringify({error:error.message})); process.exitCode=1; }
