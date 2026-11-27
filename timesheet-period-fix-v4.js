/* Backstage payday fix v4: hooks the real hoursTimesheetHtml page used by the installed app. */
(function(){
 'use strict';
 const originalHtml=window.hoursTimesheetHtml;
 const originalAdd=window.addHourEntry;
 if(typeof originalHtml!=='function'||typeof originalAdd!=='function'){
   console.error('Backstage payday fix v4: actual hours page functions were not found.');
   return;
 }
 const selected=()=>window.backstageSelectedPayPeriod||currentPayPeriod();
 const rowsFor=(u,p)=>(data.hours||[]).filter(x=>x.userId===u.id&&x.date>=p.start&&x.date<=p.end);
 const fullySubmitted=rows=>rows.length>0&&rows.every(x=>x.status==='Submitted');

 window.hoursTimesheetHtml=function(u,p,isPrevious){
   const rows=rowsFor(u,p),locked=fullySubmitted(rows);
   // A previous period remains editable until every entry has been submitted.
   const showAsSubmittedHistory=!!isPrevious&&locked;
   let html=originalHtml.call(this,u,p,showAsSubmittedHistory);
   const add='<div class="actions timesheet-top-actions"><button onclick="addHourEntry()">＋ Add Hours</button></div>';
   const controls='<div class="actions timesheet-top-actions"><button onclick="addHourEntry()">＋ Add Hours</button><button class="secondary" onclick="exportSelectedTimesheetExcel()">📥 Export Excel</button></div>';
   if(html.includes(add))html=html.replace(add,controls);
   else if(!html.includes('exportSelectedTimesheetExcel'))html=html.replace('<div class="timesheet-list">','<div class="actions timesheet-top-actions"><button class="secondary" onclick="exportSelectedTimesheetExcel()">📥 Export Excel</button></div><div class="timesheet-list">');
   return html;
 };

 window.addHourEntry=function(existingId,presetDate){
   const u=currentUser();if(!u)return showLoginOverlay();
   const p=selected(),isHistorical=p.key!==currentPayPeriod().key;
   const existing=existingId?(data.hours||[]).find(x=>x.id===existingId):null;
   const date=existing?.date||presetDate||(isHistorical?p.end:undefined);
   return originalAdd.call(this,existingId,date);
 };

 window.exportSelectedTimesheetExcel=function(){
   const u=currentUser();if(!u)return showLoginOverlay();
   const p=selected(),rows=rowsFor(u,p).slice().sort((a,b)=>(a.date+a.start).localeCompare(b.date+b.start));
   if(!rows.length)return alert('No hours to export for this pay period.');
   const output=rows.map(x=>({
     Crew:u.name,Date:x.date,Work:hourWorkLabel(x),
     RateType:Array.isArray(x.segments)&&x.segments.length?x.segments.map(s=>hourRateTypeLabel(s.rateType||'standard')).join(' / '):hourRateTypeLabel(x.rateType||'standard'),
     Start:x.start||'',Finish:x.finish||'',
     Hours:Number((minutesForHourEntry(x)/60).toFixed(2)),
     Gross:Number(wageForEntry(x).toFixed(2)),Status:x.status||'Saved'
   }));
   const filename='Regency_Timesheet_'+p.start+'_to_'+p.end;
   if(window.XLSX){
     const ws=XLSX.utils.json_to_sheet(output),wb=XLSX.utils.book_new();
     XLSX.utils.book_append_sheet(wb,ws,'Timesheet');XLSX.writeFile(wb,filename+'.xlsx');
   }else{
     const csv=[Object.keys(output[0]).join(','),...output.map(r=>Object.values(r).map(v=>'"'+String(v).replaceAll('"','""')+'"').join(','))].join('\n');
     const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download=filename+'.csv';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
   }
 };

 window.submitHoursPeriod=function(){
   const u=currentUser();if(!u)return showLoginOverlay();
   const p=selected(),rows=rowsFor(u,p).filter(x=>x.status!=='Submitted');
   if(!rows.length)return alert('There are no unsubmitted hours in this pay period.');
   openModal(`<h2>Confirm and submit timesheet?</h2><p>You are submitting <b>${p.start}</b> to <b>${p.end}</b>.</p><div class="profile-stat"><span>Unsubmitted entries</span><b>${rows.length}</b></div><div class="profile-stat"><span>Total period hours</span><b>${formatHours(rowsFor(u,p).reduce((n,x)=>n+minutesForHourEntry(x),0))}</b></div><p class="muted">Please check that the 26th has been added and all shifts are correct. Once submitted, entries are locked for crew editing.</p><div class="actions"><button class="secondary" onclick="closeModal();renderHoursPage(currentUser(),window.backstageSelectedPayPeriod,true)">Go Back</button><button class="green" onclick="confirmSubmitHoursPeriod()">Yes, confirm and submit</button></div>`);
 };

 window.confirmSubmitHoursPeriod=function(){
   const u=currentUser();if(!u)return showLoginOverlay();
   const p=selected(),rows=rowsFor(u,p).filter(x=>x.status!=='Submitted');
   if(!rows.length)return alert('There are no unsubmitted hours in this pay period.');
   const at=new Date().toISOString();
   rows.forEach(x=>{x.status='Submitted';x.submittedAt=at;});
   save();logActivity({itemName:u.name,action:'Hours submitted',at,details:'Pay period '+p.start+' to '+p.end});save();
   closeModal();renderHoursPage(u,p,true);
 };
})();