import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PDFDocument, StandardFonts, rgb } from "https://esm.sh/pdf-lib@1.17.1";

const configuredOrigins = (Deno.env.get("APP_ORIGIN") || "").split(",").map(v => v.trim().replace(/\/$/, "")).filter(v => v && v !== "https://steady-fairy-a7278d.netlify.app");
const allowedOrigins = [...new Set([...configuredOrigins, "https://regencybackstage.netlify.app", "https://feature-hire-agreement-email--regencybackstage.netlify.app"])];
const corsFor = (req: Request) => {
  const origin = (req.headers.get("Origin") || "").replace(/\/$/, "");
  const allowedOrigin = origin
    ? (allowedOrigins.includes(origin) ? origin : "")
    : (configuredOrigins[0] || "*");
  return {
    ...(allowedOrigin ? { "Access-Control-Allow-Origin": allowedOrigin } : {}),
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-agreement-token",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
};
const json=(req:Request,data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:{...corsFor(req),"Content-Type":"application/json"}});
const terms = ["Rental Agreement terms and Conditions", "In this agreement the following terms shall have the meanings hereby respectively assigned to them", "Lessor: Regency Events Ltd", "Hirer: The person named and signed at bottom of this document", "Vehicle: The original Vehicle described at the bottom of this document or any replacement vehicle", "Accessories: The spare wheel, tools or any other items the vehicle is supplied with and any replacements thereof", "Rental Period The period from the date and time out as stated at the bottom of this document until the re-delivery of the vehicle into the physical custody of the lessor.", "Rental charges: The hire charges for the rental period calculated in accordance with the lessor’s current tariff.", "Excess amount: the sum specified at point of hire by the lessor’s insurance as stated at the bottom of this document.", "Current Tariff: The lessor’s current tariff at commencement of hire", "The hirer acknowledges that:", "The vehicle is fit for their purpose and undertakes to return it and its accessories to the place and date as specified at the bottom of the document.", "They have received the vehicle free from defects and damage except where indicated.", "The lessor has no liability in respect of any injury, loss or damage arising from the use of the vehicle, nor shall the lessor be liable for any indirect loss or damage or, in the case of consumers, damage which was not foreseeable by both parties.", "The lessor shall not be liable for damages arising from defects or mechanical failures which are not attributable to any breach of the manufacturer’s warranty or any Implied by law to take reasonable care or exercise skill.", "The Hirer shall not smoke inside the cab or the loading area of the vehicle. A £300 cleaning charge will be issued if vehicle is smoked in.", "The hirer shall return the vehicle clean inside and remove all packaging or rubbish they have created a cleaning charge of £100 plus the cost of disposing of any items or rubbish left behind will be applied if this is not adhered to.", "The Hirer will return the vehicle with the same amount of fuel indicated on the display at point of hire.", "The Hirer acknowledges that to combat theft and abuse of vehicles tracking devices may be installed. No data will be shared with any 3rd party unless requested by law enforcement or insurers.", "During the rental period the hirer shall keep the vehicle and its accessories in their or any approved driver’s possession and free from legal process or lien when not in use adequately protected and stored", "The hirer and any approved driver shall ensure that the vehicle will not be used for:", "For hire or reward", "For racing, pace making, rallying, speed testing, driving tuition or similar processes or for propelling or towing any vehicle or object.", "In any manner which might render or void the insurance policy, or other contact of insurance.", "Or any illegal purpose or in contravention of any legislation affecting the vehicle, its use or construction.", "By any person who:", "Is not licenced to drive the vehicle.", "Is under 25 or over 70.", "Is under the influence of drink or drugs.", "Has given fictitious name, age or address.", "Has not been approved by the lessor.", "Has been convicted of any offence, motoring or otherwise the details of which have not been disclosed in writing to the lessor at the commencement of hire.", "Outside the island of Guernsey without prior consent of the lessor", "The hirer agrees to pay on demand.", "The Invoice to secure booking as quoted by the lessor.", "Rental charges.", "Any refuelling or miscellaneous charges.", "The excess amount in respect of each incident resulting in damage to or loss of the vehicle, its accessories or any property left stored or transported in or upon the vehicle.", "All fines and court costs incurred in relation to the vehicle by the hirer or lessor from the commencement of the rental period until the vehicle is returned to the lessor except when caused by the fault of the lessor.", "Any value added tax or other taxes payable in respect of any of the above", "The hirer shall compensate the lessor in full on demand for any loss it suffers as a result of damage, fire or theft to or of the vehicle including loss of revenue to the lessor for the period which the vehicle remains unavailable for rental by reason of such matters & any claims made by any person in respect of the vehicle whilst it is in the hirers custody.", "The hirer and driver shall:", "Ensure compliance with the terms, conditions and limitations of the insurance policy, which shall be deemed to be included in this agreement as if the same were fully set out herein.", "At the request and cost of the lessor permit to be done in their own name all acts and things may be reasonably required by the lessor for the purposes of repairing the vehicle or enforcing any rights or remedies or of obtaining relief from other parties in respect of any loss or damage to or in connection with the vehicle or its accessories", "Inform the lessor immediately of any loss or damage to or fault developing in the vehicle.", "Indemnify the lessor against any loss incurred by reason of breach of this agreement by the hirer or any driver.", "Ensure the maximum payload and axle weights are not exceeded.", "Be responsible for loading and unloading of the vehicle.", "Obtain or maintain any necessary operator’s licence.", "Shall not modify the vehicle or alter or add any extra equipment at any time.", "The hirer or driver shall not:", "Without prior consent of the lessor incur and liability for repairs to the vehicle in excess of £25", "Be the agent or servant of the lessor for any purpose.", "Make and claim for loss of or damage to any property left stored or transported in or upon the vehicle unless due to the negligence of the lessor.", "The hirer shall be responsible for payment of the excess amount for loss or damage to the vehicle or its accessories arises from the neglect or wilful action of the hirer or driver.", "The period of hire is specified at the bottom of this document shall not be extended without the lessor’s express authorisation in writing in and even then, the period of the hire shall not exceed 90 days.", "If the hirer does not comply with any of these conditions, they shall return the vehicle to the lessor immediately and pay to the lessor on demand any loss it suffers in respect of the hirer’s noncompliance, failing which the lessor shall be at liability to retake possession of the vehicle and all costs and expenses incurred in its recovery.", "Any addition or alteration to these terms and conditions should be agreed upon in writing by both parties.", "Nothing in these terms and conditions shall be deemed to exclude or restrict the lessor’s liability for death or personal injury resulting from negligence or any other liability of the lessor which cannot be excluded as a matter of law.", "This agreement is subject to Guernsey Law and the exclusive jurisdiction of Guernsey and to which the lessor and hirer irrevocably submit.", "Vehicle Make: Peugeot", "Model: Boxer L1H1", "Reg: 42426", "Hire period:", "Hire Cost: £80 per day.", "The AA Phone number 03300 530 420\t Policy\t BCASP971155", "Excess Amount: £1000", "Hirer name:", "Driver:", "Email:", "Hirer address:", "Hirer signature:", "Contact Number:", "Date:", "Lessor: Regency Events", "If you wish to review the terms and conditions these can be found on our website at:", "www.vanhireguernsey.com", "Damage notes.", "Minor scuffs and scrapes around vehicle. A video walk around of van is on file updated before each hire. Customer encouraged to record their own."];
const supabaseUrl=Deno.env.get("SUPABASE_URL")!;
const serviceKey=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const admin=createClient(supabaseUrl,serviceKey,{auth:{persistSession:false}});
const sha=async(v:string)=>Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(v)))).map(x=>x.toString(16).padStart(2,"0")).join("");
const clean=(v:any,max=500)=>String(v??"").trim().slice(0,max);
function wrap(text:string,font:any,size:number,max:number){const words=text.split(/\s+/);const lines:string[]=[];let line="";for(const w of words){const test=line?line+" "+w:w;if(font.widthOfTextAtSize(test,size)>max&&line){lines.push(line);line=w}else line=test}if(line)lines.push(line);return lines}
// Version 1 renderer is intentionally retained unchanged for recovery of agreements signed on template version 1.
async function makePdfV1(booking:any,customer:any,signaturePng:Uint8Array,reference:string,signedAt:string,termsList:string[],recovered=false){
 const pdf=await PDFDocument.create();const font=await pdf.embedFont(StandardFonts.Helvetica);const bold=await pdf.embedFont(StandardFonts.HelveticaBold);const sig=await pdf.embedPng(signaturePng);
 let page=pdf.addPage([595,842]),y=800;const margin=48,width=499;
 const draw=(rawText:string,size=10,isBold=false,space=5)=>{const text=rawText.replaceAll("£","GBP ").replace(/[’‘]/g,"'").replace(/[“”]/g,'"').replace(/[–—]/g,"-").replace(/•/g,"-").replace(/[^\x20-\x7E]/g," ");const f=isBold?bold:font;for(const line of wrap(text,f,size,width)){if(y<75){page=pdf.addPage([595,842]);y=800}page.drawText(line,{x:margin,y,size,font:f,color:rgb(.08,.12,.09)});y-=size+3}y-=space};
 if(recovered)draw("RECOVERED COPY - RECONSTRUCTED FROM SIGNING-TIME RECORDS",10,true,9);
 draw("REGENCY EVENTS LTD",15,true,5);draw("PEUGEOT BOXER RENTAL AGREEMENT",13,true,12);
 draw(`Vehicle: ${booking.vehicleName||"Peugeot Boxer"}   Registration: ${booking.registration||""}`,10,true);
 draw(`Hire period: ${booking.start||"Not set"} to ${booking.end||"Not set"}`);
 draw(`Hire cost: ${booking.hireCost||"£80 per day"}   Insurance excess: ${booking.excess||"£1,000"}`,10,true,10);
 draw(`Hirer: ${customer.hirer}`);draw(`Driver: ${customer.driver}`);draw(`Email: ${customer.email}`);draw(`Contact: ${customer.phone}`);draw(`Address: ${customer.address}`,10,false,12);
 const signedDate=new Date(signedAt).toLocaleDateString("en-GB",{day:"2-digit",month:"2-digit",year:"numeric"});
 const hirePeriod=`${booking.start||"Not set"} to ${booking.end||"Not set"}`;
 const hireCost=booking.hireCost||"GBP 80 per day";
 const filledTerms=termsList.map((line)=>{
  const key=line.trim().toLowerCase();
  if(key==="hire period:")return `Hire period: ${hirePeriod}`;
  if(key.startsWith("hire cost:"))return `Hire Cost: ${hireCost}`;
  if(key==="hirer name:")return `Hirer name: ${customer.hirer||""}`;
  if(key==="driver:")return `Driver: ${customer.driver||""}`;
  if(key==="email:")return `Email: ${customer.email||""}`;
  if(key==="hirer address:")return `Hirer address: ${customer.address||""}`;
  if(key==="hirer signature:")return "Hirer signature: Digital signature provided below.";
  if(key==="contact number:")return `Contact Number: ${customer.phone||""}`;
  if(key==="date:")return `Date: ${signedDate}`;
  return line;
 });
 for(let i=0;i<filledTerms.length;i++)draw(filledTerms[i],9,i===0,4);
 draw("CUSTOMER ACCEPTANCE",11,true,6);draw("I confirm that I have read and agree to the full rental agreement and all its terms and conditions.",9,true,8);
 if(y<190){page=pdf.addPage([595,842]);y=800}
 page.drawText("Customer signature:",{x:margin,y,size:10,font:bold});page.drawImage(sig,{x:margin,y:y-82,width:190,height:70});y-=105;
 draw(`Signed by: ${customer.hirer}`);draw(`Date/time signed: ${signedAt}`);draw(`Agreement reference: ${reference}`);draw("Lessor: Regency Events · www.vanhireguernsey.com",9,true);
 return await pdf.save();
}
Deno.serve(async(req)=>{
 if(req.method==="OPTIONS")return new Response("ok",{headers:corsFor(req)});
 if(req.method!=="POST")return json(req,{error:"Method not allowed"},405);
 try{
  const body=await req.json();const action=clean(body.action,30);
  if(action==="create"){
   const auth=req.headers.get("Authorization")||"";
   if(!auth.startsWith("Bearer "))return json(req,{error:"Crew login required to create a signing link."},401);
   const token=auth.slice(7);const {data:userData,error:userErr}=await admin.auth.getUser(token);
   if(userErr||!userData.user)return json(req,{error:"Your Backstage session has expired. Please sign in again."},401);
   const b=body.booking||{};if(!clean(b.id,150))return json(req,{error:"Hire booking ID is missing."},400);
   const raw=crypto.randomUUID()+"."+crypto.randomUUID();const hash=await sha(raw);
   const expires=new Date(Date.now()+7*86400000).toISOString();
   const {data,error}=await admin.from("vehicle_hire_agreements").insert({booking_id:clean(b.id,150),template_key:"peugeot-boxer-v1",template_version:"1",status:"awaiting_signature",token_hash:hash,booking_snapshot:b,terms_snapshot:terms,created_by:userData.user.id,expires_at:expires}).select("id").single();
   if(error)throw error;
   const appUrl=(Deno.env.get("APP_URL")||"").replace(/\/$/,"");
   if(!appUrl)throw new Error("APP_URL secret is not configured for the signing website.");
   return json(req,{agreementId:data.id,signingUrl:appUrl+"/?hire-sign="+encodeURIComponent(raw),expiresAt:expires});
  }
  if(action==="status"){
   const auth=req.headers.get("Authorization")||"";
   if(!auth.startsWith("Bearer "))return json(req,{error:"Crew login required."},401);
   const {data:userData,error:userErr}=await admin.auth.getUser(auth.slice(7));
   if(userErr||!userData.user)return json(req,{error:"Your Backstage session has expired."},401);
   const bookingId=clean(body.bookingId,150);if(!bookingId)return json(req,{error:"Booking ID is missing."},400);
   const {data:rows,error:statusErr}=await admin.from("vehicle_hire_agreements").select("id,status,reference,pdf_path,created_at,expires_at,signed_at,booking_id,customer_email_status,company_email_status,email_last_error,email_sent_at").eq("booking_id",bookingId).order("created_at",{ascending:false}).limit(1);
   if(statusErr)throw statusErr;
   return json(req,{agreement:rows?.[0]||null});
  }
  if(action==="get_pdf"){
   const auth=req.headers.get("Authorization")||"";
   if(!auth.startsWith("Bearer "))return json(req,{error:"Crew login required."},401);
   const {data:userData,error:userErr}=await admin.auth.getUser(auth.slice(7));
   if(userErr||!userData.user)return json(req,{error:"Your Backstage session has expired. Please sign in again."},401);
   const bookingId=clean(body.bookingId,150);
   if(!bookingId)return json(req,{error:"Booking ID is missing."},400);
   const {data:rows,error:findErr}=await admin.from("vehicle_hire_agreements")
    .select("*").eq("booking_id",bookingId).eq("status","signed")
    .order("created_at",{ascending:false}).limit(1);
   if(findErr)throw findErr;
   const agreement=rows?.[0];
   if(!agreement)return json(req,{error:"No signed hire agreement was found for this booking."},404);

   // First choice is always the exact PDF produced at signing. Never rebuild over it.
   if(agreement.pdf_path){
    const {data:fileData,error:fileErr}=await admin.storage.from("hire-agreements").download(agreement.pdf_path);
    if(!fileErr&&fileData){
     const bytes=new Uint8Array(await fileData.arrayBuffer());
     const digest=Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",bytes))).map(x=>x.toString(16).padStart(2,"0")).join("");
     if(agreement.pdf_sha256&&digest!==agreement.pdf_sha256){
      return json(req,{error:"The stored signed PDF failed its integrity check. It has not been changed or reconstructed.",integrity:"failed",reference:agreement.reference},409);
     }
     const {data:urlData,error:urlErr}=await admin.storage.from("hire-agreements").createSignedUrl(agreement.pdf_path,900);
     if(urlErr)throw urlErr;
     return json(req,{ok:true,pdfUrl:urlData.signedUrl,reference:agreement.reference,integrity:agreement.pdf_sha256?"verified":"legacy_unverified",recovered:false,sha256:digest,sizeBytes:bytes.byteLength});
    }
    const statusCode=String(fileErr?.statusCode||fileErr?.status||"");
    const missingObject=statusCode.includes("404")||/not found|object missing/i.test(String(fileErr?.message||""));
    if(!missingObject)throw fileErr||new Error("The original signed PDF could not be retrieved.");
   }

   // Recovery is allowed only from the frozen booking, customer, terms and template version captured at signing.
   if(!agreement.accepted||!agreement.booking_snapshot||!agreement.customer_details||!agreement.signature_path||!agreement.reference||!agreement.signed_at){
    return json(req,{error:"The original PDF is missing and the signing-time records are incomplete. No replacement was created.",integrity:"recovery_unavailable"},409);
   }
   if(agreement.template_key!=="peugeot-boxer-v1"||agreement.template_version!=="1"){
    return json(req,{error:"The original PDF is missing and this agreement's exact saved form version is not available for recovery. No replacement was created.",integrity:"recovery_version_unavailable",templateKey:agreement.template_key,templateVersion:agreement.template_version},409);
   }
   const savedTerms=Array.isArray(agreement.terms_snapshot)?agreement.terms_snapshot:null;
   if(!savedTerms)return json(req,{error:"The original PDF is missing and the saved signing-time form terms are unavailable. No replacement was created.",integrity:"recovery_unavailable"},409);
   const {data:sigFile,error:sigErr}=await admin.storage.from("hire-agreements").download(agreement.signature_path);
   if(sigErr||!sigFile)return json(req,{error:"The original PDF is missing and the original signature image could not be retrieved. No replacement was created.",integrity:"recovery_unavailable"},409);
   const sigBytes=new Uint8Array(await sigFile.arrayBuffer());
   const recoveredPdf=await makePdfV1(agreement.booking_snapshot,agreement.customer_details,sigBytes,agreement.reference,agreement.signed_at,savedTerms,true);
   const recoveredHash=Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",recoveredPdf))).map(x=>x.toString(16).padStart(2,"0")).join("");
   const recoveredPath=`${agreement.id}/recovered/${agreement.reference}-recovered-${Date.now()}.pdf`;
   const {error:uploadErr}=await admin.storage.from("hire-agreements").upload(recoveredPath,recoveredPdf,{contentType:"application/pdf",upsert:false});
   if(uploadErr)throw uploadErr;
   const {error:auditErr}=await admin.from("vehicle_hire_agreement_recoveries").insert({
    agreement_id:agreement.id,recovered_pdf_path:recoveredPath,pdf_sha256:recoveredHash,
    pdf_size_bytes:recoveredPdf.byteLength,source_template_key:agreement.template_key,
    source_template_version:agreement.template_version,recovered_by:userData.user.id,
    recovery_reason:agreement.pdf_path?"Original signed PDF object was missing from storage.":"No original signed PDF path was recorded."
   });
   if(auditErr)throw auditErr;
   const {data:urlData,error:urlErr}=await admin.storage.from("hire-agreements").createSignedUrl(recoveredPath,900);
   if(urlErr)throw urlErr;
   return json(req,{ok:true,pdfUrl:urlData.signedUrl,reference:agreement.reference,integrity:"reconstructed_from_signing_snapshot",recovered:true,sha256:recoveredHash,sizeBytes:recoveredPdf.byteLength});
  }
  const raw=req.headers.get("x-agreement-token")||"";
  if(!raw||raw.length>200)return json(req,{error:"Signing link is invalid."},400);
  const hash=await sha(raw);
  const {data:agreement,error}=await admin.from("vehicle_hire_agreements").select("*").eq("token_hash",hash).maybeSingle();
  if(error)throw error;
  if(!agreement)return json(req,{error:"This signing link is invalid or has already been used."},404);
  if(action==="send_copy"){
   if(agreement.status!=="signed"||!agreement.pdf_path)return json(req,{error:"The agreement must be signed before an email copy can be sent."},409);
   const resendKey=Deno.env.get("RESEND_API_KEY")||"";
   const from=Deno.env.get("RESEND_FROM_EMAIL")||"";
   if(!resendKey||!from)return json(req,{error:"Email sending is not configured yet. Regency Events will enable this once its email domain has been verified."},503);
   const {data:fileData,error:fileErr}=await admin.storage.from("hire-agreements").download(agreement.pdf_path);
   if(fileErr||!fileData)throw fileErr||new Error("The signed PDF could not be retrieved.");
   const pdfBytes=new Uint8Array(await fileData.arrayBuffer());
   const emailPdfHash=Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",pdfBytes))).map(x=>x.toString(16).padStart(2,"0")).join("");
   if(agreement.pdf_sha256&&emailPdfHash!==agreement.pdf_sha256)return json(req,{error:"The stored signed PDF failed its integrity check. No copy was sent.",integrity:"failed",reference:agreement.reference},409);
   let binary="";for(let i=0;i<pdfBytes.length;i+=0x8000)binary+=String.fromCharCode(...pdfBytes.subarray(i,i+0x8000));
   const pdfBase64=btoa(binary);
   const customer=agreement.customer_details||{};
   const sendOne=async(to:string,subject:string,textBody:string)=>{
    const response=await fetch("https://api.resend.com/emails",{method:"POST",headers:{"Authorization":`Bearer ${resendKey}`,"Content-Type":"application/json"},body:JSON.stringify({from,to:[to],subject,text:textBody,attachments:[{filename:`Regency-Events-Agreement-${agreement.reference||"signed"}.pdf`,content:pdfBase64}]})});
    const data=await response.json().catch(()=>({}));
    if(!response.ok)throw new Error(data?.message||data?.error||`Email provider returned ${response.status}`);
    return data?.id||null;
   };
   const attemptAt=new Date().toISOString();
   let customerStatus=agreement.customer_email_status==="sent"?"sent":"failed";
   let companyStatus=agreement.company_email_status==="sent"?"sent":"failed";
   let customerId=agreement.customer_email_id||null,companyId=agreement.company_email_id||null;
   const failures=[];
   // Preserve successful deliveries. A retry only sends copies that have not succeeded.
   if(customerStatus!=="sent"){
    try{if(!customer.email)throw new Error("Customer email address is missing.");customerId=await sendOne(clean(customer.email,254),"Your signed Peugeot Boxer rental agreement",`Please find your signed Regency Events vehicle rental agreement attached. Agreement reference: ${agreement.reference||""}`);customerStatus="sent";}catch(e){failures.push("Customer: "+(e?.message||"send failed"));}
   }
   if(companyStatus!=="sent"){
    try{companyId=await sendOne("info@regencyevents.com","Signed Peugeot Boxer rental agreement - "+(agreement.reference||""),`A customer has signed a Peugeot Boxer rental agreement.\\nReference: ${agreement.reference||""}\\nHirer: ${clean(customer.hirer,200)}\\nCustomer email: ${clean(customer.email,254)}\\n\\nThe signed PDF is attached.`);companyStatus="sent";}catch(e){failures.push("Company: "+(e?.message||"send failed"));}
   }
   const sentAt=(customerStatus==="sent"&&companyStatus==="sent")?(agreement.email_sent_at||new Date().toISOString()):null;
   const {error:emailUpdateErr}=await admin.from("vehicle_hire_agreements").update({customer_email_status:customerStatus,company_email_status:companyStatus,customer_email_id:customerId,company_email_id:companyId,email_last_error:failures.length?failures.join(" | ").slice(0,1000):null,email_last_attempt_at:attemptAt,email_sent_at:sentAt}).eq("id",agreement.id);
   if(emailUpdateErr)throw emailUpdateErr;
   return json(req,{email:{customer:customerStatus,company:companyStatus,error:failures.length?failures.join(" | "):null}});
  }
  if(agreement.status!=="awaiting_signature")return json(req,{error:"This agreement has already been completed or revoked."},410);
  if(new Date(agreement.expires_at).getTime()<Date.now()){await admin.from("vehicle_hire_agreements").update({status:"expired"}).eq("id",agreement.id);return json(req,{error:"This signing link has expired. Please contact Regency Events for a new link."},410)}
  if(action==="verify")return json(req,{booking:agreement.booking_snapshot,terms:agreement.terms_snapshot,expiresAt:agreement.expires_at});
  if(action!=="submit")return json(req,{error:"Unknown agreement action."},400);
  if(body.accepted!==true)return json(req,{error:"Terms must be accepted before signing."},400);
  const c=body.customer||{};for(const k of ["hirer","driver","email","phone","address"])if(!clean(c[k],1000))return json(req,{error:"Please complete all customer and driver details."},400);
  const sigText=String(body.signature||"");const match=sigText.match(/^data:image\/png;base64,([A-Za-z0-9+/=]+)$/);
  if(!match||match[1].length>1500000)return json(req,{error:"A valid signature is required."},400);
  const sigBytes=Uint8Array.from(atob(match[1]),x=>x.charCodeAt(0));
  const signedAt=new Date().toISOString();const reference="RE-"+new Date().toISOString().slice(0,10).replaceAll("-","")+"-"+crypto.randomUUID().slice(0,8).toUpperCase();
  const savedTerms=Array.isArray(agreement.terms_snapshot)?agreement.terms_snapshot:terms;
  const pdf=await makePdfV1(agreement.booking_snapshot,c,sigBytes,reference,signedAt,savedTerms);
  const base=`${agreement.id}/${reference}`;
  const {error:pdfErr}=await admin.storage.from("hire-agreements").upload(`${base}.pdf`,pdf,{contentType:"application/pdf",upsert:false});
  if(pdfErr)throw pdfErr;
  const {error:sigErr}=await admin.storage.from("hire-agreements").upload(`${base}-signature.png`,sigBytes,{contentType:"image/png",upsert:false});
  if(sigErr)throw sigErr;
  const pdfHash=Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",pdf))).map(x=>x.toString(16).padStart(2,"0")).join("");
  const update={status:"signed",customer_details:c,accepted:true,signature_path:`${base}-signature.png`,pdf_path:`${base}.pdf`,pdf_sha256:pdfHash,pdf_size_bytes:pdf.byteLength,reference,signed_at:signedAt,ip_address:req.headers.get("x-forwarded-for")||null,user_agent:req.headers.get("user-agent")||null};
  const {error:updateErr}=await admin.from("vehicle_hire_agreements").update(update).eq("id",agreement.id).eq("status","awaiting_signature");
  if(updateErr)throw updateErr;
  const {data:urlData,error:urlErr}=await admin.storage.from("hire-agreements").createSignedUrl(`${base}.pdf`,604800);
  if(urlErr)throw urlErr;
  return json(req,{reference,pdfPath:`${base}.pdf`,pdfUrl:urlData.signedUrl,signedAt});
 }catch(e){console.error(e);return json(req,{error:e?.message||"Agreement service failed."},500)}
});