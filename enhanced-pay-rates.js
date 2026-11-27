/* Backstage dynamic enhanced pay rates, V71.80 */
(function(){
 'use strict';
 const byId=function(id){return document.getElementById(id)};
 const escHtml=function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
 const money=function(n){return '£'+(Number(n)||0).toFixed(2)};
 const oldEnsure=window.ensureWageSettings;
 function settings(u){
  const w=typeof oldEnsure==='function'?oldEnsure(u):(u?(u.wageSettings=u.wageSettings||{}):{});
  if(!w)return {};
  w.enhancedRates=Array.isArray(w.enhancedRates)?w.enhancedRates:[];
  w.enhancedRates=w.enhancedRates.map(function(r,i){return {id:String(r.id||('enhanced'+(i+3))),name:String(r.name||('Enhanced Rate '+(i+3))),rate:Math.max(0,Number(r.rate)||0),active:r.active!==false}});
  return w;
 }
 window.ensureWageSettings=settings;
 function customRate(u,type){return settings(u).enhancedRates.find(function(r){return r.id===type})||null}
 window.wageRateFor=function(u,type){
  const w=settings(u);
  if(type==='enhanced1')return Number(w.enhanced1Rate)||Number(w.standardRate)||0;
  if(type==='enhanced2')return Number(w.enhanced2Rate)||Number(w.standardRate)||0;
  const r=customRate(u,type);if(r)return Number(r.rate)||0;
  return Number(w.standardRate)||0;
 };
 window.hourRateTypeLabel=function(type){
  if(type==='enhanced1')return 'Enhanced Rate 1';
  if(type==='enhanced2')return 'Enhanced Rate 2';
  const users=typeof data!=='undefined'?(data.users||[]):[];
  for(const u of users){const r=customRate(u,type);if(r)return r.name+(r.active?'':' (Inactive)')}
  return type==='standard'?'Standard Rate':String(type||'Standard Rate');
 };
 function rateOptions(u,selected){
  const w=settings(u),base=[['standard','Standard Rate',w.standardRate],['enhanced1','Enhanced Rate 1',w.enhanced1Rate],['enhanced2','Enhanced Rate 2',w.enhanced2Rate]];
  let html=base.map(function(x){return '<option value="'+x[0]+'" '+(selected===x[0]?'selected':'')+'>'+x[1]+' • '+money(x[2])+'/hr</option>'}).join('');
  w.enhancedRates.forEach(function(r){if(!r.active&&r.id!==selected)return;html+='<option value="'+escHtml(r.id)+'" '+(selected===r.id?'selected':'')+' '+(r.active?'':'disabled')+'>'+escHtml(r.name)+(r.active?'':' (Inactive)')+' • '+money(r.rate)+'/hr</option>'});
  return html;
 }
 window.hoursSegmentHtml=function(s,i){
  s=s||{};i=i||0;const u=currentUser(),r=s.rateType||'standard';
  return '<div class="hours-rate-segment"><div class="hours-segment-heading"><b>Pay-rate period '+(i+1)+'</b>'+(i?'<button type="button" class="secondary" onclick="this.parentElement.parentElement.remove();renumberHoursSegments()">Remove</button>':'')+'</div><div class="hours-segment-fields"><label>Start<input type="time" class="h_seg_start" value="'+escHtml(s.start||(i?'17:00':'08:00'))+'"></label><label>Finish<input type="time" class="h_seg_finish" value="'+escHtml(s.finish||(i?'20:00':'17:00'))+'"></label></div><label>Pay rate<select class="h_seg_rate">'+rateOptions(u,r)+'</select></label></div>';
 };
 function rateRows(u){
  return settings(u).enhancedRates.map(function(r){
   return '<div class="bwr-rate-row" data-rate-id="'+escHtml(r.id)+'" style="display:grid;grid-template-columns:minmax(0,1fr) minmax(90px,.65fr) auto;gap:7px;align-items:center;margin:8px 0;padding:9px;border:1px solid var(--regency-border,#ccc);border-radius:10px"><label style="font-size:12px">Rate name<input class="bwr-rate-name" value="'+escHtml(r.name)+'" maxlength="50" style="margin:4px 0"></label><label style="font-size:12px">£ / hour<input class="bwr-rate-value" type="number" min="0" step="0.01" value="'+Number(r.rate).toFixed(2)+'" style="margin:4px 0"></label><label style="font-size:11px;display:flex;gap:5px;align-items:center"><input class="bwr-rate-active" type="checkbox" '+(r.active?'checked':'')+' style="width:18px;height:18px;margin:0"> Active</label></div>';
  }).join('');
 }
 function rateEditor(u){
  return '<div class="bwr-custom-rates"><h4 style="margin:14px 0 5px">Additional enhanced rates</h4><p class="small muted">Add as many enhanced pay bands as needed. Deactivated rates remain in historical timesheets but cannot be selected for new hours.</p><div class="bwr-rate-list">'+rateRows(u)+'</div><button type="button" class="secondary" onclick="backstageAddEnhancedRateRow()">＋ Add enhanced rate</button></div>';
 }
 window.backstageAddEnhancedRateRow=function(){
  const host=document.querySelector('.bwr-rate-list');if(!host)return;
  const ids=[].slice.call(host.querySelectorAll('.bwr-rate-row')).map(function(x){return Number((x.dataset.rateId||'').replace('enhanced',''))||0});
  let n=Math.max(2,...ids)+1;while(ids.includes(n))n++;
  const id='enhanced'+n,row=document.createElement('div');row.className='bwr-rate-row';row.dataset.rateId=id;
  row.style.cssText='display:grid;grid-template-columns:minmax(0,1fr) minmax(90px,.65fr) auto;gap:7px;align-items:center;margin:8px 0;padding:9px;border:1px solid var(--regency-border,#ccc);border-radius:10px';
  row.innerHTML='<label style="font-size:12px">Rate name<input class="bwr-rate-name" value="Enhanced Rate '+n+'" maxlength="50" style="margin:4px 0"></label><label style="font-size:12px">£ / hour<input class="bwr-rate-value" type="number" min="0" step="0.01" value="0.00" style="margin:4px 0"></label><label style="font-size:11px;display:flex;gap:5px;align-items:center"><input class="bwr-rate-active" type="checkbox" checked style="width:18px;height:18px;margin:0"> Active</label>';
  host.appendChild(row);
 };
 function readCustomRates(){
  return [].slice.call(document.querySelectorAll('.bwr-rate-row')).map(function(row){return {id:row.dataset.rateId,name:(row.querySelector('.bwr-rate-name').value||'').trim(),rate:Number(row.querySelector('.bwr-rate-value').value),active:!!row.querySelector('.bwr-rate-active').checked}});
 }
 function validRates(rows){
  const ids=new Set();
  for(const r of rows){if(!r.name||!Number.isFinite(r.rate)||r.rate<0||ids.has(r.id))return false;ids.add(r.id)}
  return true;
 }
 const oldOpenDirector=window.openDirectorCrewProfileV758;
 if(typeof oldOpenDirector==='function'){
  window.openDirectorCrewProfileV758=function(id){
   if(!(typeof isDirector==='function'&&isDirector()))return alert('Director access required.');
   const result=oldOpenDirector.apply(this,arguments),u=(data.users||[]).find(function(x){return String(x.id)===String(id)});
   const card=[].slice.call(document.querySelectorAll('#modalBody .card')).find(function(c){return c.querySelector('h3')&&c.querySelector('h3').textContent.includes('Pay rates')});
   if(u&&card&&!card.querySelector('.bwr-custom-rates'))card.insertAdjacentHTML('beforeend',rateEditor(u));
   return result;
  };
 }
 window.saveDirectorCrewRatesV758=function(id){
  if(!(typeof isDirector==='function'&&isDirector()))return alert('Director access required.');
  const u=(data.users||[]).find(function(x){return String(x.id)===String(id)});if(!u)return;
  const val=function(x){return Number(byId(x).value)};
  const standard=val('dp_rate'),enhanced1=val('dp_rate1'),enhanced2=val('dp_rate2'),tax=val('dp_tax'),extra=readCustomRates();
  if([standard,enhanced1,enhanced2,tax].some(function(x){return !Number.isFinite(x)||x<0})||tax>100||!validRates(extra))return alert('Enter valid non-negative hourly rates, names and a tax percentage from 0 to 100.');
  u.wageSettings={...(u.wageSettings||{}),standardRate:standard,enhanced1Rate:enhanced1,enhanced2Rate:enhanced2,taxPercent:tax,enhancedRates:extra};
  save();alert('Pay rates saved.');window.openDirectorCrewProfileV758(id);
 };
 const oldOpenWage=window.openWageSetup;
 if(typeof oldOpenWage==='function'){
  window.openWageSetup=function(){
   if(!(typeof isDirector==='function'&&isDirector()))return alert('Hourly rates are managed by a Director.');
   const u=currentUser(),result=oldOpenWage.apply(this,arguments),host=byId('modalBody');
   if(u&&host&&!host.querySelector('.bwr-custom-rates'))host.insertAdjacentHTML('beforeend',rateEditor(u));
   return result;
  };
 }
 window.saveWageSetup=function(){
  if(!(typeof isDirector==='function'&&isDirector()))return alert('Hourly rates are managed by a Director.');
  const u=currentUser();if(!u)return;
  const extra=readCustomRates();
  if(!validRates(extra))return alert('Check each additional rate has a name and a valid hourly amount.');
  const std=Math.max(0,Number(byId('w_standard').value)||0),e1=Math.max(0,Number(byId('w_enh1').value)||0),e2=Math.max(0,Number(byId('w_enh2').value)||0),tax=Math.max(0,Math.min(100,Number(byId('w_tax').value)||0));
  if(!std||!e1||!e2)return alert('Enter all three hourly rates.');
  u.wageSettings={...(u.wageSettings||{}),standardRate:std,enhanced1Rate:e1,enhanced2Rate:e2,taxPercent:tax,enhancedRates:extra};
  save();returnToProfileOnClose=false;closeModal();openCrewProfile();
 };
 const oldSaveHour=window.saveHourEntry;
 if(typeof oldSaveHour==='function'){
  window.saveHourEntry=function(id){
   const user=currentUser(),date=byId('h_date')&&byId('h_date').value;
   const result=oldSaveHour.apply(this,arguments);
   let row=id?(data.hours||[]).find(function(x){return String(x.id)===String(id)}):null;
   if(!row&&user&&date)row=(data.hours||[]).filter(function(x){return x.userId===user.id&&x.date===date}).sort(function(a,b){return String(b.createdAt||'').localeCompare(String(a.createdAt||''))})[0];
   if(row&&Array.isArray(row.segments)){row.segments.forEach(function(s){s.rateLabelSnapshot=hourRateTypeLabel(s.rateType)});row.rateLabelSnapshot=row.segments[0]?row.segments[0].rateLabelSnapshot:hourRateTypeLabel(row.rateType);save()}
   return result;
  };
 }
 const oldTimesheet=window.hoursTimesheetHtml;
 if(typeof oldTimesheet==='function'){
  window.hoursTimesheetHtml=function(u,p,isPrevious){
   let html=oldTimesheet.apply(this,arguments);
   const rows=(data.hours||[]).filter(function(x){return x.userId===u.id&&x.date>=p.start&&x.date<=p.end});
   rows.forEach(function(x){
    if(Array.isArray(x.segments)&&x.segments.length){
     const detail=x.segments.map(function(s){return s.start+'–'+s.finish+': '+(s.rateLabelSnapshot||hourRateTypeLabel(s.rateType))+' ('+money(s.rateSnapshot)+'/hr)'}).join(' · ');
     const needle=String(x.start||'')+' <span class="time-arrow">→</span> '+String(x.finish||'');
     if(needle&&html.includes(needle))html=html.replace(needle,needle+'<div class="small bwr-rate-detail">'+escHtml(detail)+'</div>');
    }
   });
   return html;
  };
 }
 function exportRows(people,p){
  const rows=[];
  people.forEach(function(u){
   (data.hours||[]).filter(function(x){return x.userId===u.id&&x.date>=p.start&&x.date<=p.end}).forEach(function(x){
    const segments=Array.isArray(x.segments)&&x.segments.length?x.segments:null;
    if(segments){
     segments.forEach(function(s){
      const mins=Number(s.minutes!=null?s.minutes:minutesBetweenTimes(s.start,s.finish)),hours=Number((mins/60).toFixed(2)),rate=Number(Number(s.rateSnapshot!=null?s.rateSnapshot:wageRateFor(u,s.rateType)).toFixed(2));
      rows.push({Crew:u.name,Date:x.date,Work:hourWorkLabel(x),Shift:(s.start||'')+'–'+(s.finish||''),RateType:s.rateLabelSnapshot||hourRateTypeLabel(s.rateType),HourlyRate:rate,Hours:hours,Gross:Number((mins/60*rate).toFixed(2)),Status:x.status||'Draft'});
     });
    }else{
     const hours=Number((minutesForHourEntry(x)/60).toFixed(2)),rate=Number(hourRateForEntry(x).toFixed(2));
     rows.push({Crew:u.name,Date:x.date,Work:hourWorkLabel(x),Shift:(x.start||'')+'–'+(x.finish||''),RateType:x.rateLabelSnapshot||hourRateTypeLabel(x.rateType||'standard'),HourlyRate:rate,Hours:hours,Gross:Number((hours*rate).toFixed(2)),Status:x.status||'Draft'});
    }
   });
  });
  return rows;
 }
 window.paySummary=function(u,p){
  const rows=(data.hours||[]).filter(function(x){return x.userId===u.id&&x.date>=p.start&&x.date<=p.end});
  const gross=rows.reduce(function(a,x){return a+wageForEntry(x)},0),taxPercent=Math.max(0,Math.min(100,Number(settings(u).taxPercent)||0)),tax=gross*taxPercent/100;
  const overtimeMinutes=rows.reduce(function(a,x){const segs=Array.isArray(x.segments)&&x.segments.length?x.segments:null;if(segs)return a+segs.filter(function(s){return s.rateType!=='standard'}).reduce(function(n,s){return n+minutesBetweenTimes(s.start,s.finish)},0);return a+(x.rateType&&x.rateType!=='standard'?minutesForHourEntry(x):0)},0);
  return {rows:rows,gross:gross,tax:tax,taxPercent:taxPercent,net:Math.max(0,gross-tax),minutes:rows.reduce(function(a,x){return a+minutesForHourEntry(x)},0),overtimeMinutes:overtimeMinutes};
 };
 function downloadRows(rows,filename){
  if(!rows.length)return alert('No hours to export for this pay period.');
  const dailyMap={},monthMap={};
  rows.forEach(function(r){
   const dk=r.Crew+'|'+r.Date,mk=r.Crew+'|'+String(r.Date||'').slice(0,7);
   if(!dailyMap[dk])dailyMap[dk]={Crew:r.Crew,Date:r.Date,DailyTotal:0,Hours:0};
   dailyMap[dk].DailyTotal+=Number(r.Gross)||0;dailyMap[dk].Hours+=Number(r.Hours)||0;
   if(!monthMap[mk])monthMap[mk]={Crew:r.Crew,Month:String(r.Date||'').slice(0,7),MonthlyTotal:0,Hours:0};
   monthMap[mk].MonthlyTotal+=Number(r.Gross)||0;monthMap[mk].Hours+=Number(r.Hours)||0;
  });
  const daily=Object.values(dailyMap).map(function(x){x.DailyTotal=Number(x.DailyTotal.toFixed(2));x.Hours=Number(x.Hours.toFixed(2));return x}).sort(function(a,b){return a.Date.localeCompare(b.Date)||a.Crew.localeCompare(b.Crew)});
  const monthly=Object.values(monthMap).map(function(x){x.MonthlyTotal=Number(x.MonthlyTotal.toFixed(2));x.Hours=Number(x.Hours.toFixed(2));return x}).sort(function(a,b){return a.Month.localeCompare(b.Month)||a.Crew.localeCompare(b.Crew)});
  rows.forEach(function(r){r.DailyTotal=dailyMap[r.Crew+'|'+r.Date].DailyTotal;r.MonthlyTotal=monthMap[r.Crew+'|'+String(r.Date||'').slice(0,7)].MonthlyTotal});
  if(window.XLSX){
   const wb=XLSX.utils.book_new();
   XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(rows),'Timesheet');
   XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(daily),'Daily Totals');
   XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(monthly),'Monthly Totals');
   XLSX.writeFile(wb,filename+'.xlsx');
  }else{
   const csv=[Object.keys(rows[0]).join(','),...rows.map(function(r){return Object.values(r).map(function(v){return '"'+String(v).replaceAll('"','""')+'"'}).join(',')})].join('\n');
   const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download=filename+'.csv';a.click();setTimeout(function(){URL.revokeObjectURL(a.href)},1000)
  }
 }
 window.exportHoursExcel=function(uid){
  const p=currentPayPeriod(),people=uid?[data.users.find(function(u){return u.id===uid})].filter(Boolean):(data.users||[]).filter(function(u){return !u.cloudOnly});
  downloadRows(exportRows(people,p),'Regency_Timesheet_'+p.start+'_to_'+p.end);
 };
 window.exportSelectedHoursExcel=function(){
  const u=currentUser();if(!u)return showLoginOverlay();
  const p=window.backstageSelectedPayPeriod||currentPayPeriod();
  downloadRows(exportRows([u],p),'Regency_Timesheet_'+p.start+'_to_'+p.end);
 };
 console.info('Backstage V71.80 dynamic enhanced pay rates loaded');
})();