#!/usr/bin/env node
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const os=require('node:os');
const crypto=require('node:crypto');
const args=process.argv.slice(2);
for(let i=0;i<args.length;i++)if(args[i]==='--dest')i++;else if(!['--legacy','--dry-run'].includes(args[i]))throw Error(`Unknown argument: ${args[i]}`);
const custom=args.indexOf('--dest');
if(custom>=0&&(!args[custom+1]||!path.isAbsolute(args[custom+1])))throw Error('--dest requires an absolute directory');
const codexRoot=process.env.CODEX_HOME||path.join(os.homedir(),'.codex');
const dest=custom>=0?path.resolve(args[custom+1]):path.join(codexRoot,'pets','nicole');
if(dest===path.parse(dest).root||dest===os.homedir()||dest===process.cwd()||dest===codexRoot||dest===path.join(codexRoot,'pets'))throw Error('Refusing an unsafe installation directory');
const assets=path.join(__dirname,'../assets');
const legacy=args.includes('--legacy');
const manifest=JSON.parse(fs.readFileSync(path.join(assets,'pet.json'),'utf8'));
manifest.spriteVersionNumber=legacy?1:2;
const source=path.join(assets,legacy?'spritesheet-v1.webp':'spritesheet.webp');
const bytes=fs.readFileSync(source);
function dimensions(b){
  if(b.toString('ascii',0,4)!=='RIFF'||b.toString('ascii',8,12)!=='WEBP')throw Error('Invalid WebP');
  for(let i=12;i+8<=b.length;){const kind=b.toString('ascii',i,i+4),size=b.readUInt32LE(i+4),p=i+8;if(p+size>b.length)throw Error('Truncated WebP');
    if(kind==='VP8X'&&size>=10)return[b.readUIntLE(p+4,3)+1,b.readUIntLE(p+7,3)+1];
    if(kind==='VP8L'&&size>=5&&b[p]===47){const bits=b.readUInt32LE(p+1);return[(bits&16383)+1,((bits>>>14)&16383)+1];}
    i=p+size+(size%2);
  }throw Error('Unsupported WebP header');
}
const [w,h]=dimensions(bytes);if(w!==1536||h!==(legacy?1872:2288))throw Error('Unexpected atlas geometry');
const sha256=crypto.createHash('sha256').update(bytes).digest('hex');
if(args.includes('--dry-run')){console.log(JSON.stringify({destination:dest,version:manifest.spriteVersionNumber,size:[w,h],sha256},null,2));process.exit(0);}
fs.mkdirSync(path.dirname(dest),{recursive:true});
const backupRoot=path.join(codexRoot,'pet-backups','nicole');fs.mkdirSync(backupRoot,{recursive:true});
const staging=fs.mkdtempSync(path.join(path.dirname(dest),'.nicole-install-'));
let backup;
try{
  fs.writeFileSync(path.join(staging,'spritesheet.webp'),bytes);
  fs.writeFileSync(path.join(staging,'pet.json'),JSON.stringify(manifest,null,2)+'\n');
  if(fs.existsSync(dest)){
    // A non-Nicole directory must never be replaced accidentally.
    const old=JSON.parse(fs.readFileSync(path.join(dest,'pet.json'),'utf8'));
    if(old.id!=='nicole'&&old.displayName!=='妮可')throw Error('Destination contains a different pet; choose another --dest');
    backup=path.join(backupRoot,new Date().toISOString().replace(/[:.]/g,'-')+'-'+crypto.randomBytes(3).toString('hex'));
    fs.cpSync(dest,backup,{recursive:true,errorOnExist:true,force:false});
    // Replace only managed files, preserving unrelated user files in the pet directory.
    for(const name of ['spritesheet.webp','pet.json'])fs.copyFileSync(path.join(staging,name),path.join(dest,name));
  }else fs.renameSync(staging,dest);
  let care;
  let careError;
  try { care=require('./care.cjs').interact('init',{codexRoot}); }
  catch(error) { careError=error.message; }
  console.log(JSON.stringify({installed:dest,backup:backup||null,version:manifest.spriteVersionNumber,sha256,skillVersion:fs.readFileSync(path.join(__dirname,'../VERSION'),'utf8').trim(),care,careError},null,2));
}finally{
  if(fs.existsSync(staging)){for(const name of ['spritesheet.webp','pet.json']){const f=path.join(staging,name);if(fs.existsSync(f))fs.unlinkSync(f);}fs.rmdirSync(staging);}
}
