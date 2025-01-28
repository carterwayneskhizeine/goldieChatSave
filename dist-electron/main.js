"use strict";const{app:F,BrowserWindow:v,ipcMain:d,dialog:x,protocol:P}=require("electron"),{shell:S}=require("electron"),s=require("path"),o=require("fs").promises;let y=null;F.whenReady().then(()=>{P.registerFileProtocol("local-file",(i,r)=>{const e=i.url.replace("local-file://","");r(decodeURI(e))})});d.handle("select-folder",async()=>{const i=await x.showOpenDialog(y,{properties:["openDirectory"]});return i.canceled?null:i.filePaths[0]});d.handle("create-chat-folder",async(i,r)=>{try{const t=(await o.readdir(r)).filter(l=>l.startsWith("NewChat"));let a=0;t.forEach(l=>{const h=l.match(/NewChat(\d+)/);if(h){const m=parseInt(h[1]);a=Math.max(a,m)}});const n=`NewChat${a+1}`,c=s.join(r,n);return await o.mkdir(c),{path:c,name:n}}catch(e){throw console.error("Failed to create chat folder:",e),e}});d.handle("save-file",async(i,r,e)=>{try{const t=s.join(r,e.name);return await o.writeFile(t,Buffer.from(e.data)),{name:e.name,path:t}}catch(t){throw console.error("Failed to save file:",t),t}});d.handle("save-messages",async(i,r,e,t)=>{try{const a=s.join(r,"messages.json");return await o.writeFile(a,JSON.stringify(t,null,2),"utf8"),!0}catch(a){throw console.error("Failed to save messages:",a),a}});d.handle("load-messages",async(i,r,e)=>{try{const t=s.join(r,"messages.json"),a=await o.readFile(t,"utf8");return JSON.parse(a)}catch(t){if(t.code==="ENOENT")return[];throw console.error("Failed to load messages:",t),t}});d.handle("save-message-as-txt",async(i,r,e)=>{var t;try{const a=(t=e.txtFile)!=null&&t.displayName?`${e.txtFile.displayName}.txt`:`message_${e.id}.txt`,n=s.join(r,a);return await o.writeFile(n,e.content,"utf8"),{name:a,displayName:a.replace(".txt",""),path:n}}catch(a){throw console.error("Failed to save message as txt:",a),a}});d.handle("load-message-txt",async(i,r)=>{try{return await o.readFile(r,"utf8")}catch(e){throw console.error("Failed to load message txt:",e),e}});d.handle("rename-message-file",async(i,r,e,t)=>{try{const a=s.join(r,`${e}.txt`),n=s.join(r,`${t}.txt`);try{await o.access(n);const c=await o.readFile(a,"utf8"),l=await o.readFile(n,"utf8");return await o.writeFile(n,`${l}

${c}`,"utf8"),await o.unlink(a),{name:`${t}.txt`,displayName:t,path:n,merged:!0}}catch{return await o.rename(a,n),{name:`${t}.txt`,displayName:t,path:n,merged:!1}}}catch(a){throw console.error("Failed to rename message file:",a),a}});d.handle("move-to-recycle",async(i,r,e)=>{try{const t=s.join(r,"..","RecycleBin");try{await o.access(t)}catch{await o.mkdir(t)}const a=new Date().getTime(),n=s.join(t,`${a}_${e}`),c=s.join(r,e);return await o.rename(c,n),!0}catch(t){throw console.error("Failed to move file to recycle bin:",t),t}});d.handle("delete-message",async(i,r,e)=>{try{const t=s.dirname(r),a=s.join(t,"RecycleBin");try{await o.access(a)}catch{await o.mkdir(a)}if(e.txtFile){const n=Date.now(),c=s.join(a,`${n}_${e.txtFile.name}`);try{await o.access(e.txtFile.path),await o.rename(e.txtFile.path,c)}catch(l){console.error("Failed to move txt file:",l)}}if(e.files&&e.files.length>0)for(const n of e.files){const c=Date.now(),l=s.basename(n.path),h=s.join(a,`${c}_${l}`);try{await o.access(n.path),await o.rename(n.path,h)}catch(m){console.error("Failed to move file:",m)}}return!0}catch(t){throw console.error("Failed to delete message:",t),t}});d.handle("renameFile",async(i,r,e,t,a="")=>{try{const n=a?s.join(r,a):r,c=s.join(n,e),l=s.join(n,t);try{throw await o.access(l),new Error("文件名已存在")}catch(h){if(h.code==="ENOENT")return await o.rename(c,l),{name:t,path:l};throw h}}catch(n){throw console.error("Failed to rename file:",n),n}});d.handle("move-folder-to-recycle",async(i,r)=>{try{const e=s.join(s.dirname(r),"RecycleBin");try{await o.access(e)}catch{await o.mkdir(e)}const t=new Date().getTime(),a=s.basename(r),n=s.join(e,`${t}_${a}`);return await o.rename(r,n),!0}catch(e){throw console.error("Failed to move folder to recycle bin:",e),e}});d.handle("rename-chat-folder",async(i,r,e)=>{try{const t=s.dirname(r),a=s.join(t,e);try{throw await o.access(a),new Error("文件夹名已存在")}catch(n){if(n.code==="ENOENT")return await o.rename(r,a),{name:e,path:a};throw n}}catch(t){throw console.error("Failed to rename chat folder:",t),t}});d.handle("openFileLocation",async(i,r)=>{try{return await S.showItemInFolder(r),!0}catch(e){throw console.error("Failed to open file location:",e),e}});d.handle("scanFolders",async(i,r)=>{try{const t=(await o.readdir(r,{withFileTypes:!0})).filter(n=>n.isDirectory()&&n.name!=="RecycleBin");return await Promise.all(t.map(async n=>{const c=s.join(r,n.name),l=await o.readdir(c,{withFileTypes:!0}),h=await Promise.all(l.filter(f=>f.isFile()).map(async f=>{const p=s.join(c,f.name),u=await o.stat(p);return{name:f.name,path:p,type:s.extname(f.name).toLowerCase(),size:u.size,timestamp:u.mtime.toISOString()}}));let m=[];try{const f=s.join(c,"messages.json"),p=await o.readFile(f,"utf8");m=JSON.parse(p)}catch{m=[];const p=h.filter(w=>w.type===".txt");for(const w of p){const j=await o.readFile(w.path,"utf8");m.push({id:Date.now().toString()+Math.random().toString(36).substr(2,9),content:j,timestamp:w.timestamp,txtFile:{name:w.name,displayName:w.name.replace(".txt",""),path:w.path}})}const u=h.filter(w=>w.type!==".txt");u.length>0&&m.push({id:Date.now().toString()+Math.random().toString(36).substr(2,9),content:"",timestamp:new Date().toISOString(),files:u}),await o.writeFile(s.join(c,"messages.json"),JSON.stringify(m,null,2),"utf8")}return{id:Date.now().toString()+Math.random().toString(36).substr(2,9),name:n.name,path:c,timestamp:new Date().toISOString()}}))}catch(e){throw console.error("Failed to scan folders:",e),e}});function g(){y=new v({width:1200,height:800,title:"Goldie Chat",webPreferences:{nodeIntegration:!0,contextIsolation:!0,webSecurity:!1,preload:s.join(__dirname,"preload.js")}}),y.webContents.session.webRequest.onHeadersReceived((i,r)=>{r({responseHeaders:{...i.responseHeaders,"Content-Security-Policy":["default-src 'self' 'unsafe-inline' 'unsafe-eval' data: local-file:"]}})}),process.env.VITE_DEV_SERVER_URL?y.loadURL(process.env.VITE_DEV_SERVER_URL):y.loadFile(s.join(__dirname,"../dist/index.html")),process.env.NODE_ENV==="development"&&y.webContents.openDevTools(),y.on("closed",()=>{y=null})}module.exports={createWindow:g};F.whenReady().then(g);F.on("window-all-closed",()=>{process.platform!=="darwin"&&F.quit()});F.on("activate",()=>{v.getAllWindows().length===0&&g()});
