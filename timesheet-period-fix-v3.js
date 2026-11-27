/* Backstage 27th–26th timesheet fix v3: hooks the real renderTimesheetPeriod flow. */
(function(){
 'use strict';
 const originalRender=window.renderTimesheetPeriod;
 const originalAdd=window.addHourEntry;
 const originalDateKey=window.dateKeyLocal;
 const originalOpenModal=window.openModal;
 const originalOpenHours=window.openHoursTracker;
 const originalOpenPeriod=window.openTimesheetPeriod;
 if(typeof originalRender!=='function'||typeof originalOpenModal!=='function'){
   console.error('Backstage timesheet fix: expected timesheet functions were not found.');
   return;
 }
 let selected=null, injecting=false;
 const getRows=(u,p)=>(data.hours||[]).filter(x=>x.userId===u.id&&x.date>=p.start&&x.date<=p.end);
 const allSubmitted=list=>list.length>0&&list.every(x=>x.status==='Submitted');
 const activePeriod=()=>selected||currentPayPeriod();

 window.openModal=function(body){
   if(injecting&&typeof body==='string'&&body.includes('⏱️ My Timesheet')){
     body=body.replace('<div class="timesheet-list">','<div class="actions timesheet-top-actions"><button class="secondary" onclick="exportSelectedTimesheetExcel()">📥 Export Excel</button></div><div class="timesheet-list">');
   }
   return originalOpenModal.call(this,body);
 };

 window.renderTimesheetPeriod=function(u,p,isPrevious){
   selected=p;
   const list=getRows(u,p);
   const locked=allSubmitted(list);
   const shouldTreatAsPrevious=!!isPrevious&&locked;
   injecting=true;
   try{return originalRender.call(this,u,p,shouldTreatAsPrevious);}
   finally{injecting=false;}
 };

 window.openHoursTracker=function(){
   const u=currentUser();if(!u)return showLoginOverlay();
   selected=currentPayPeriod();returnToProfileOnClose=true;
   return window.renderTimesheetPeriod(u,selected,false);
 };
 if(typeof originalOpenPeriod==='function'){
   window.openTimesheetPeriod=function(key){
     const u=currentUser();if(!u)return;
     const p=periodFromKey(key);if(!p)return;
     selected=p;returnToProfileOnClose=true;
     return window.renderTimesheetPeriod(u,p,allSubmitted(getRows(u,p)));
   };
 }

 if(typeof originalAdd==='function'){
   window.addHourEntry=function(existingId){
     const u=currentUser();if(!u)return showLoginOverlay();
     const old=existingId?(data.hours||[]).find(h=>h.id===existingId):null;
     if(old||!selected||selected.key===currentPayPeriod().key)return originalAdd.call(this,existingId);
     const dateFn=window.dateKeyLocal;
     try{
       window.dateKeyLocal=function(){return selected.end;};
       return originalAdd.call(this,existingId);
     }finally{window.dateKeyLocal=dateFn||originalDateKey;}
   };
 }

 window.exportSelectedTimesheetExcel=function(){
   const u=currentUser();if(!u)return showLoginOverlay();
   const p=activePeriod(),list=getRows(u,p).slice().sort((a,b)=>(a.date+a.start).localeCompare(b.date+b.start));
   if(!list.length)return alert('No hours to export for this pay period.');
   const output=[];
   list.forEach(x=>{
     const segments=Array.isArray(x.segments)&&x.segments.length?x.segments:[{start:x.start,finish:x.finish,rateType:x.rateType||'standard',rateSnapshot:hourRateForEntry(x)}];
     if(x.work==='Day Off'){output.push({Crew:u.name,Date:x.date,Work:hourWorkLabel(x),Start:'',Finish:'',Rate:'',HourlyRate:0,Hours:0,Gross:0,Status:x.status});return;}
     segments.forEach(s=>{
       const mins=minutesForHourEntry({...x,start:s.start,finish:s.finish}),rate=Number(s.rateSnapshot)||hourRateForEntry({...x,rateType:s.rateType});
       output.push({Crew:u.name,Date:x.date,Work:hourWorkLabel(x),Start:s.start||'',Finish:s.finish||'',Rate:hourRateTypeLabel(s.rateType||'standard'),HourlyRate:Number(rate.toFixed(2)),Hours:Number((mins/60).toFixed(2)),Gross:Number((mins/60*rate).toFixed(2)),Status:x.status});
     });
   });
   const filename='Regency_Timesheet_'+p.start+'_to_'+p.end;
   if(window.XLSX){const ws=XLSX.utils.json_to_sheet(output),wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,'Timesheet');XLSX.writeFile(wb,filename+'.xlsx');}
   else{const csv=[Object.keys(output[0]).join(','),...output.map(r=>Object.values(r).map(v=>'"'+String(v).replaceAll('"','""')+'"').join(','))].join('\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download=filename+'.csv';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}
 };

 window.submitHoursPeriod=function(){
   const u=currentUser();if(!u)return showLoginOverlay();
   const p=activePeriod(),all=getRows(u,p),pending=all.filter(x=>x.status!=='Submitted');
   if(!pending.length)return alert('There are no unsubmitted hours in this pay period.');
   openModal(`<h2>Confirm and submit timesheet?</h2><p>You are submitting <b>${p.start}</b> to <b>${p.end}</b>.</p><div class="profile-stat"><span>Unsubmitted entries</span><b>${pending.length}</b></div><div class="profile-stat"><span>Total period hours</span><b>${formatHours(all.reduce((n,x)=>n+minutesForHourEntry(x),0))}</b></div><p class="muted">Please check that the 26th has been added and all shifts are correct. Once submitted, entries are locked for crew editing.</p><div class="actions"><button class="secondary" onclick="closeModal();renderTimesheetPeriod(currentUser(),window.backstageSelectedPayPeriod||currentPayPeriod(),false)">Go Back</button><button class="green" onclick="confirmSubmitHoursPeriod()">Yes, confirm and submit</button></div>`);
 };
 window.confirmSubmitHoursPeriod=function(){
   const u=currentUser();if(!u)return showLoginOverlay();
   const p=activePeriod(),pending=getRows(u,p).filter(x=>x.status!=='Submitted');
   if(!pending.length)return alert('There are no unsubmitted hours in this pay period.');
   const at=new Date().toISOString();pending.forEach(x=>{x.status='Submitted';x.submittedAt=at;});
   save();logActivity({itemName:u.name,action:'Hours submitted',at,details:'Pay period '+p.start+' to '+p.end});save();
   openModal(`<h2>✅ Timesheet submitted</h2><p>Your timesheet for <b>${p.start}</b> to <b>${p.end}</b> has been submitted.</p><p class="muted">These entries are now locked. Your next pay period starts on the 27th.</p><button class="green" style="width:100%" onclick="closeModal();openHoursTracker()">Return to current pay period</button>`);
 };
 window.backstageSelectedPayPeriod=null;
 const render=window.renderTimesheetPeriod;
 window.renderTimesheetPeriod=function(u,p,isPrevious){window.backstageSelectedPayPeriod=p;return render.call(this,u,p,isPrevious);};
})();