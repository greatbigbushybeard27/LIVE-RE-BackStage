/* Backstage 27th–26th timesheet close-out fix v2. */
(function(){
 'use strict';
 const oldHtml=window.hoursTimesheetHtml,oldAdd=window.addHourEntry,oldSave=window.saveHourEntry;
 const period=()=>window.backstageSelectedPayPeriod||currentPayPeriod();
 const rows=(u,p)=>(data.hours||[]).filter(x=>x.userId===u.id&&x.date>=p.start&&x.date<=p.end);
 const submitted=a=>a.length>0&&a.every(x=>x.status==='Submitted');

 if(typeof oldHtml==='function')window.hoursTimesheetHtml=function(u,p,isPrevious){
  const list=rows(u,p),editable=list.length&&!submitted(list);
  let html=oldHtml.call(this,u,p,!!isPrevious&&!editable);
  html=html.replace(/<div class="actions timesheet-top-actions">[\s\S]*?<\/div>/,
   '<div class="actions timesheet-top-actions"><button onclick="addHourEntry()">＋ Add Hours</button><button class="secondary" onclick="exportSelectedTimesheetExcel()">📥 Export Excel</button></div>');
  if(editable&&!html.includes('onclick="submitHoursPeriod()"'))html+=`<div class="timesheet-submit"><button class="green" style="width:100%" onclick="submitHoursPeriod()">Confirm &amp; Submit Previous Pay Period</button><div class="small muted">Submitting ${p.start} to ${p.end}. Once submitted, these hours cannot be amended.</div></div>`;
  return html;
 };

 if(typeof oldAdd==='function')window.addHourEntry=function(id,preset){
  const host=document.getElementById('hours'),active=!!host&&!host.classList.contains('hidden'),p=active?period():currentPayPeriod();
  if(!id&&!preset&&active&&p.key!==currentPayPeriod().key)preset=p.end;
  return oldAdd.call(this,id,preset);
 };
 if(typeof oldSave==='function')window.saveHourEntry=function(id){
  const host=document.getElementById('hours'),date=document.getElementById('h_date')?.value;
  if(host&&!host.classList.contains('hidden')&&date){const p=period();if(date<p.start||date>p.end)return alert('This timesheet covers '+p.start+' to '+p.end+'. Choose a date within this pay period.');}
  return oldSave.call(this,id);
 };

 window.exportSelectedTimesheetExcel=function(){
  const u=currentUser();if(!u)return showLoginOverlay();const p=period(),list=rows(u,p).slice().sort((a,b)=>(a.date+a.start).localeCompare(b.date+b.start));
  if(!list.length)return alert('No hours to export for this pay period.');
  const out=[];
  list.forEach(x=>{
   const segs=Array.isArray(x.segments)&&x.segments.length?x.segments:[{start:x.start,finish:x.finish,rateType:x.rateType||'standard',rateSnapshot:hourRateForEntry(x)}];
   if(x.work==='Day Off'){out.push({Crew:u.name,Date:x.date,Work:hourWorkLabel(x),Start:'',Finish:'',Rate:'',HourlyRate:0,Hours:0,Gross:0,Status:x.status});return;}
   segs.forEach(s=>{const mins=minutesBetweenTimes(s.start,s.finish),rate=Number(s.rateSnapshot)||hourRateForEntry({...x,rateType:s.rateType});out.push({Crew:u.name,Date:x.date,Work:hourWorkLabel(x),Start:s.start||'',Finish:s.finish||'',Rate:hourRateTypeLabel(s.rateType||'standard'),HourlyRate:Number(rate.toFixed(2)),Hours:Number((mins/60).toFixed(2)),Gross:Number((mins/60*rate).toFixed(2)),Status:x.status});});
  });
  const name='Regency_Timesheet_'+p.start+'_to_'+p.end;
  if(window.XLSX){const ws=XLSX.utils.json_to_sheet(out),wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,'Timesheet');XLSX.writeFile(wb,name+'.xlsx');}
  else{const csv=[Object.keys(out[0]).join(','),...out.map(r=>Object.values(r).map(v=>'"'+String(v).replaceAll('"','""')+'"').join(','))].join('\n'),a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download=name+'.csv';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}
 };

 window.submitHoursPeriod=function(){
  const u=currentUser();if(!u)return showLoginOverlay();const p=period(),all=rows(u,p),pending=all.filter(x=>x.status!=='Submitted');
  if(!pending.length)return alert('There are no unsubmitted hours in this pay period.');
  openModal(`<h2>Confirm and submit timesheet?</h2><p>You are submitting <b>${p.start}</b> to <b>${p.end}</b>.</p><div class="profile-stat"><span>Unsubmitted entries</span><b>${pending.length}</b></div><div class="profile-stat"><span>Total hours</span><b>${formatHours(all.reduce((n,x)=>n+minutesForHourEntry(x),0))}</b></div><p class="muted">Please check that the 26th has been added. Submitted entries are locked for crew editing.</p><div class="actions"><button class="secondary" onclick="closeModal();renderHoursPage(currentUser(),window.backstageSelectedPayPeriod,window.backstageSelectedPayPeriod.key!==currentPayPeriod().key)">Go Back</button><button class="green" onclick="confirmSubmitHoursPeriod()">Yes, confirm and submit</button></div>`);
 };
 window.confirmSubmitHoursPeriod=function(){
  const u=currentUser();if(!u)return showLoginOverlay();const p=period(),pending=rows(u,p).filter(x=>x.status!=='Submitted');
  if(!pending.length)return alert('There are no unsubmitted hours in this pay period.');
  const at=new Date().toISOString();pending.forEach(x=>{x.status='Submitted';x.submittedAt=at;});
  save();logActivity({itemName:u.name,action:'Hours submitted',at,details:'Pay period '+p.start+' to '+p.end});save();
  openModal(`<h2>✅ Timesheet submitted</h2><p>Your timesheet for <b>${p.start}</b> to <b>${p.end}</b> has been submitted.</p><p class="muted">These entries are now locked. Your next pay period starts on the 27th.</p><button class="green" style="width:100%" onclick="closeModal();window.backstageSelectedPayPeriod=currentPayPeriod();renderHoursPage(currentUser(),currentPayPeriod(),false)">Return to current pay period</button>`);
 };
})();