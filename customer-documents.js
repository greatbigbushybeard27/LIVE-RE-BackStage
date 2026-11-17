/* V71.80 Customer Documents extension. Loaded by the Backstage service worker after the core app. */
(function(){
 'use strict';
 if(window.__customerDocumentsBV179)return;
 window.__customerDocumentsBV179=true;
 let documentsMode=false;
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const currentCustomer=()=>{
  const active=document.querySelector('#customers .cust-person.active');
  const match=active?.getAttribute('onclick')?.match(/selectCustomerBV170\(['"]([^'"]+)['"]\)/);
  return match?(data.customers||[]).find(c=>String(c.id)===String(match[1])):null;
 };
 const customerFiles=c=>{
  const v=typeof ensureV51==='function'?ensureV51():{vehicleFiles:[],hireVehicles:[]};
  const files=Array.isArray(v.vehicleFiles)?v.vehicleFiles:[];
  const out=files.filter(f=>String(f.customerId||'')===String(c.id));
  const seen=new Set(out.map(f=>String(f.id)));
  const name=String(c.name||'').trim().toLowerCase();
  (v.hireVehicles||[]).forEach(b=>{
   const customer=b.customer||{};
   const linked=String(b.customerId||customer.customerId||'')===String(c.id)||
    String(typeof b.customer==='string'?b.customer:(customer.name||customer.company||'')).trim().toLowerCase()===name;
   if(!linked)return;
   const ids=Array.isArray(b.agreementFileIds)?b.agreementFileIds:(b.agreementFileId?[b.agreementFileId]:[]);
   ids.forEach(id=>{const f=files.find(x=>String(x.id)===String(id));if(f&&!seen.has(String(f.id))){seen.add(String(f.id));out.push(Object.assign({},f,{_linkedBooking:b}));}});
   const pdfPath=String(b.rentalAgreementPdfPath||'').trim();
   if(pdfPath){
    const virtualId='hire-agreement:'+String(b.id||pdfPath);
    if(!seen.has(virtualId)){
     seen.add(virtualId);
     out.push({id:virtualId,name:'Hire Agreement - '+String(b.rentalAgreementReference||b.displayRef||b.vehicleName||'Signed agreement')+'.pdf',type:'application/pdf',createdAt:b.rentalAgreementSignedAt||b.updatedAt||'',cloudPath:pdfPath,storageBucket:'hire-agreements',cloudOnly:true,_linkedBooking:b});
    }
   }
  });
  return out.sort((a,b)=>String(b.createdAt||'').localeCompare(String(a.createdAt||'')));
 };
 function renderDocuments(){
  const host=document.querySelector('#customers .cust-content'),c=currentCustomer();
  if(!host||!c)return;
  const docs=customerFiles(c),labels={hire_agreement:'Hire Agreement',insurance:'Insurance',certificate:'Certificate',general:'General document',other:'Other'};
  const rows=docs.map(f=>{
   const date=f.createdAt?new Date(f.createdAt).toLocaleDateString('en-GB'):'Date not recorded';
   const booking=f._linkedBooking?'<div class="cd-muted">Booking: '+esc(f._linkedBooking.displayRef||f._linkedBooking.vehicleName||'Vehicle hire')+'</div>':'';
   const view=f.storageBucket?'viewCustomerDocumentBV179':'viewV51File';
   return '<article class="cd-file"><div class="cd-file-main"><b>📄 '+esc(f.name||'Uploaded document')+'</b><small>'+esc(date)+'</small>'+booking+'</div><button type="button" class="secondary" onclick="'+view+'(\''+esc(f.id)+'\')">View</button></article>';
  }).join('');
  host.innerHTML='<section class="cd-wrap"><div class="cd-head"><div><b>Customer Documents</b><small>'+docs.length+' saved file'+(docs.length===1?'':'s')+' · retained against this customer</small></div></div><div class="cd-panel"><h3>Upload a document</h3><div class="cd-fields"><label>Document Name<input id="cd-name" type="text" placeholder="Enter document name" maxlength="160"></label><label class="cd-file-input">Choose file<input id="cd-file" type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.xlsx"></label></div><button type="button" id="cd-save" onclick="addCustomerDocumentBV179()">＋ Save to Customer</button><small class="cd-help">PDF, image or office document · maximum 20 MB. Previous versions are retained.</small></div><div class="cd-list">'+(rows||'<div class="cd-empty">No documents saved yet. Upload a file above. Signed hire agreements will appear here automatically.</div>')+'</div></section>';
 }
 function injectTab(){
  const nav=document.querySelector('#customers .cust-tabs');if(!nav||nav.querySelector('[data-customer-documents-tab]'))return;
  const button=document.createElement('button');button.type='button';button.className='cust-tab';button.textContent='Documents';button.dataset.customerDocumentsTab='1';
  button.addEventListener('click',()=>{documentsMode=true;nav.querySelectorAll('.cust-tab').forEach(x=>x.classList.toggle('active',x===button));renderDocuments();});
  const bookings=Array.from(nav.querySelectorAll('.cust-tab')).find(x=>x.textContent.trim()==='Bookings');
  if(bookings)bookings.insertAdjacentElement('afterend',button);else nav.appendChild(button);
 }
 const originalRender=window.renderCustomerDirectoryBV170;
 if(typeof originalRender==='function'){
  window.renderCustomerDirectoryBV170=function(){const result=originalRender.apply(this,arguments);injectTab();if(documentsMode)renderDocuments();return result;};
  const originalSet=window.setCustomerTabBV170;
  if(typeof originalSet==='function')window.setCustomerTabBV170=function(tab){if(tab!=='documents')documentsMode=false;return originalSet.apply(this,arguments);};
  window.renderCustomerDirectoryBV170();
 }
 window.viewCustomerDocumentBV179=async function(id){
  const doc=customerFiles(currentCustomer()||{}).find(f=>String(f.id)===String(id));
  if(!doc||!doc.storageBucket||!doc.cloudPath)return alert('This signed agreement could not be found.');
  const tab=window.open('about:blank','_blank');
  try{
   if(typeof supabaseClient==='undefined'||!supabaseClient)throw new Error('Cloud storage is not connected.');
   const bookingId=String(doc._linkedBooking?.id||'');
   if(!bookingId)throw new Error('The hire booking link is missing.');
   // Rebuild the signed PDF from its saved agreement and signature, then issue a fresh secure URL.
   const result=await supabaseClient.functions.invoke('hire-agreement',{body:{action:'repair_pdf',bookingId}});
   if(result.error)throw result.error;
   if(result.data?.error)throw new Error(result.data.error);
   if(!result.data?.pdfUrl)throw new Error('The agreement service did not return a PDF link.');
   if(tab)tab.location.href=result.data.pdfUrl;else window.location.href=result.data.pdfUrl;
  }catch(err){if(tab)tab.close();console.error('Could not open signed hire agreement',err);alert('Could not open this agreement: '+(err?.message||err));}
 };
 window.addCustomerDocumentBV179=async function(){
  const c=currentCustomer(),input=document.getElementById('cd-file'),file=input?.files?.[0],nameInput=document.getElementById('cd-name');
  const documentName=String(nameInput?.value||'').trim();
  if(!c)return alert('Select a customer first.');
  if(!documentName)return alert('Enter a document name first.');
  if(!file)return alert('Choose a document first.');
  if(file.size>20*1024*1024)return alert('The file must be 20 MB or smaller.');
  const id='custfile_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,9);
  const rec={id,name:documentName,originalFileName:file.name,type:file.type||'application/octet-stream',size:file.size,createdAt:new Date().toISOString(),ownerId:c.id,customerId:String(c.id),customerDocumentType:'other',folder:'customer-documents'};
  const btn=document.getElementById('cd-save');if(btn){btn.disabled=true;btn.textContent='Saving…';}
  try{
   if(typeof cloudIsReady==='function'&&cloudIsReady()&&typeof supabaseClient!=='undefined'){
    const org=typeof REGENCY_ORG_ID!=='undefined'?REGENCY_ORG_ID:'regency',safeName=file.name.replace(/[^a-zA-Z0-9._-]/g,'_');
    const cloudPath=org+'/v51/customer-documents/'+id+'_'+safeName;
    const result=await supabaseClient.storage.from('regency-hs').upload(cloudPath,file,{upsert:true,contentType:rec.type});
    if(result.error)throw result.error;rec.cloudPath=cloudPath;rec.cloudOnly=true;
   }else{
    const db=await new Promise((resolve,reject)=>{const req=indexedDB.open('regency-backstage-files-v1',1);req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains('files'))req.result.createObjectStore('files',{keyPath:'id'});};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});
    await new Promise((resolve,reject)=>{const tx=db.transaction('files','readwrite');tx.objectStore('files').put({id,blob:file});tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error||new Error('Could not save the file locally.'));});db.close();rec.localStored=true;
   }
   const v=ensureV51();v.vehicleFiles=Array.isArray(v.vehicleFiles)?v.vehicleFiles:[];v.vehicleFiles.push(rec);save();renderDocuments();
  }catch(err){console.error('Customer document upload failed',err);alert('Could not save this document: '+(err?.message||err));}
  finally{const b=document.getElementById('cd-save');if(b){b.disabled=false;b.textContent='＋ Save to Customer';}}
 };
 const style=document.createElement('style');style.textContent='#customers .cd-wrap{display:grid;gap:12px}.cd-head{display:flex;justify-content:space-between;align-items:center}.cd-head small,.cd-file small,.cd-help,.cd-muted{display:block;color:var(--regency-muted,var(--muted));font-size:12px;margin-top:4px}.cd-panel,.cd-file{border:1px solid var(--regency-border,var(--line));border-radius:12px;background:var(--regency-panel,var(--card));padding:13px}.cd-panel h3{margin:0 0 12px;font-size:15px}.cd-fields{display:grid;gap:10px}.cd-fields label{display:block;font-size:13px}.cd-fields input,.cd-fields select{display:block;width:100%;box-sizing:border-box;margin-top:5px;background:var(--regency-bg,var(--background));color:var(--regency-text,var(--text));border:1px solid var(--regency-border,var(--line));border-radius:9px;padding:10px;font:inherit}.cd-panel>button{margin-top:12px;width:100%}.cd-help{margin-top:9px}.cd-list{display:grid;gap:8px}.cd-file{display:flex;align-items:center;justify-content:space-between;gap:10px}.cd-file-main{min-width:0;overflow-wrap:anywhere}.cd-file button{flex:0 0 auto}.cd-empty{padding:24px;text-align:center;color:var(--regency-muted,var(--muted));border:1px dashed var(--regency-border,var(--line));border-radius:12px}';
 document.head.appendChild(style);
})();