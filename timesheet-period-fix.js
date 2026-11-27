/* Timesheet close-out: keep the 27th–26th period editable until crew submit it on payday. */
(function(){
 'use strict';
 const originalTimesheetHtml=window.hoursTimesheetHtml;
 const originalAddHourEntry=window.addHourEntry;
 const originalSaveHourEntry=window.saveHourEntry;
 const selectedPeriod=()=>window.backstageSelectedPayPeriod||currentPayPeriod();
 const rowsFor=(u,p)=>(data.hours||[]).filter(x=>x.userId===u.id&&x.date>=p.start&&x.date<=p.end);
 const isFullySubmitted=rows=>rows.length>0&&rows.every(x=>x.status==='Submitted');

 if(typeof originalTimesheetHtml==='function'){
  window.hoursTimesheetHtml=function(u,p,isPrevious=false){
   const rows=rowsFor(u,p),editable=rows.length>0&&!isFullySubmitted(rows);
   let html=originalTimesheetHtml.call(this,u,p,!!isPrevious&&!editable);
   html=html.replace('<div class="actions timesheet-top-actions"><button onclick="addHourEntry()">＋ Add Hours</button></div>','<div class="actions timesheet-top-actions"><button onclick="addHourEntry()">＋ Add Hours</button><button class="secondary" onclick="exportSelectedTimesheetExcel()">📥 Export Excel</button></div>');
   return html;
  };
 }

 if(typeof originalAddHourEntry==='function'){
  window.addHourEntry=function(existingId,presetDate){
   const u=currentUser();if(!u)return originalAddHourEntry.call(this,existingId,presetDate);
   const host=document.getElementById('hours'),onHoursPage=!!host&&!host.classList.contains('hidden');
   const p=onHoursPage?selectedPeriod():currentPayPeriod(),today=currentPayPeriod();
   const oldDraft=p.key!==today.key&&rowsFor(u,p).some(x=>x.status!=='Submitted');
   const defaultDate=(!existingId&&!presetDate&&oldDraft)?p.end:presetDate;
   return originalAddHourEntry.call(this,existingId,defaultDate);
  };
 }

 window.openHoursTracker=function(){
  const u=currentUser();if(!u)return showLoginOverlay();
  const host=document.getElementById('hours'),onHoursPage=!!host&&!host.classList.contains('hidden');
  const p=onHoursPage?selectedPeriod():currentPayPeriod();
  returnToProfileOnClose=false;closeModal();window.backstageHoursTab='timesheet';
  window.backstageSelectedPayPeriod=p;showPage('hours');renderHoursPage(u,p,p.key!==currentPayPeriod().key);
 };

 if(typeof originalSaveHourEntry==='function'){
  window.saveHourEntry=function(id){
   const host=document.getElementById('hours'),p=selectedPeriod(),date=document.getElementById('h_date')?.value;
   if(host&&!host.classList.contains('hidden')&&date&&(date<p.start||date>p.end))
    return alert(`This timesheet covers ${p.start} to ${p.end}. Please choose a date within that pay period.`);
   return originalSaveHourEntry.call(this,id);
  };
 }

 window.exportSelectedTimesheetExcel=function(){
  const u=currentUser();if(!u)return showLoginOverlay();const p=selectedPeriod(),rows=rowsFor(u,p).slice().sort((a,b)=>(a.date+a.start).localeCompare(b.date+b.start));
  if(!rows.length)return alert('No hours to export for this pay period.');
  const output=[];
  rows.forEach(x=>{
   const segments=Array.isArray(x.segments)&&x.segments.length?x.segments:[{start:x.start,finish:x.finish,rateType:x.rateType||'standard',rateSnapshot:hourRateForEntry(x)}];
   if(x.work==='Day Off')output.push({Crew:u.name,Date:x.date,Work:hourWorkLabel(x),Start:'',Finish:'',Rate:'',HourlyRate:0,Hours:0,Gross:0,Status:x.status});
   else segments.forEach(s=>{const mins=minutesBetweenTimes(s.start,s.finish),rate=Number(s.rateSnapshot)||hourRateForEntry({...x,rateType:s.rateType});output.push({Crew:u.name,Date:x.date,Work:hourWorkLabel(x),Start:s.start||'',Finish:s.finish||'',Rate:hourRateTypeLabel(s.rateType||'standard'),HourlyRate:Number(rate.toFixed(2)),Hours:Number((mins/60).toFixed(2)),Gross:Number((mins/60*rate).toFixed(2)),Status:x.status});});
  });
  const filename=`Regency_Timesheet_${p.start}_to_${p.end}`;
  if(window.XLSX){const ws=XLSX.utils.json_to_sheet(output);const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,'Timesheet');XLSX.writeFile(wb,filename+'.xlsx');}
  else{const csv=[Object.keys(output[0]).join(','),...output.map(r=>Object.values(r).map(v=>`"${String(v).replaceAll('"','""')}"`).join(','))].join('\\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download=filename+'.csv';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}
 };

 window.submitHoursPeriod=function(){
  const u=currentUser();if(!u)return showLoginOverlay();
  const p=selectedPeriod(),rows=rowsFor(u,p).filter(x=>x.status!=='Submitted');
  if(!rows.length)return alert('There are no unsubmitted hours in this pay period.');
  openModal(`<h2>Confirm and submit timesheet?</h2><p>You are submitting your pay period from <b>${p.start}</b> to <b>${p.end}</b>.</p><div class="profile-stat"><span>Unsubmitted entries</span><b>${rows.length}</b></div><div class="profile-stat"><span>Total period hours</span><b>${formatHours(rowsFor(u,p).reduce((n,x)=>n+minutesForHourEntry(x),0))}</b></div><p class="muted" style="margin-top:12px">Please check that the 26th has been added and all shifts are correct. Once submitted, entries are locked for crew editing.</p><div class="actions" style="margin-top:16px"><button class="secondary" onclick="closeModal();renderHoursPage(currentUser(),window.backstageSelectedPayPeriod,window.backstageSelectedPayPeriod.key!==currentPayPeriod().key)">Go Back</button><button class="green" onclick="confirmSubmitHoursPeriod()">Yes, confirm and submit</button></div>`);
 };

 window.confirmSubmitHoursPeriod=function(){
  const u=currentUser();if(!u)return showLoginOverlay();
  const p=selectedPeriod(),rows=rowsFor(u,p).filter(x=>x.status!=='Submitted');
  if(!rows.length)return alert('There are no unsubmitted hours in this pay period.');
  rows.forEach(x=>{x.status='Submitted';x.submittedAt=new Date().toISOString();});
  save();logActivity({itemName:u.name,action:'Hours submitted',at:new Date().toISOString(),details:`Pay period ${p.start} to ${p.end}`});save();
  openModal(`<h2>✅ Timesheet confirmed and submitted</h2><p>Your timesheet for <b>${p.start}</b> to <b>${p.end}</b> has been submitted for payday.</p><p class="muted">The entries are now locked. Your next pay period starts on the 27th.</p><button class="green" style="width:100%" onclick="closeModal();window.backstageSelectedPayPeriod=currentPayPeriod();renderHoursPage(currentUser(),currentPayPeriod(),false)">Return to current pay period</button>`);
 };
})();