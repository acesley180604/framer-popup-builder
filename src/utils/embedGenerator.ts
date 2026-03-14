/**
 * Embed Code Generator for Popup Builder v2.
 * Generates a self-contained script tag with inlined popup runtime.
 */

import type { Campaign } from "./defaults"

export interface EmbedCodeOptions {
    campaignId: string
    analyticsUrl?: string
}

/**
 * Build the embed config object from a Campaign.
 */
export function buildEmbedConfig(campaign: Campaign, analyticsUrl?: string): Record<string, unknown> {
    return {
        campaignId: campaign.id,
        apiUrl: analyticsUrl || "",
        popupType: campaign.popup_config.popupType,
        triggers: campaign.trigger_config,
        popup: {
            popupType: campaign.popup_config.popupType,
            headline: campaign.popup_config.headline,
            body: campaign.popup_config.body,
            ctaText: campaign.popup_config.ctaText,
            backgroundColor: campaign.popup_config.backgroundColor,
            backgroundImage: campaign.popup_config.backgroundImage,
            backgroundGradient: campaign.popup_config.backgroundGradient,
            textColor: campaign.popup_config.textColor,
            buttonColor: campaign.popup_config.buttonColor,
            buttonTextColor: campaign.popup_config.buttonTextColor,
            imageUrl: campaign.popup_config.imageUrl,
            closeButtonStyle: campaign.popup_config.closeButtonStyle,
            borderRadius: campaign.popup_config.borderRadius,
            shadowIntensity: campaign.popup_config.shadowIntensity,
            maxWidth: campaign.popup_config.maxWidth,
            customCss: campaign.popup_config.customCss,
            successMessage: campaign.popup_config.successMessage,
            redirectUrl: campaign.popup_config.redirectUrl,
            formFields: campaign.popup_config.formFields,
            countdown: campaign.popup_config.countdown,
            contentLocker: campaign.popup_config.contentLocker,
            spinWheel: campaign.popup_config.spinWheel,
            multiStep: campaign.popup_config.multiStep,
            video: campaign.popup_config.video,
            advancedStyle: campaign.popup_config.advancedStyle,
            forcedInteraction: campaign.popup_config.forcedInteraction,
        },
        schedule: campaign.schedule,
        targeting: {
            visitorType: campaign.targeting_config.visitorType,
            deviceType: campaign.targeting_config.deviceType,
            pageRules: campaign.targeting_config.pageRules,
            referrerSource: campaign.targeting_config.referrerSource,
            dateStart: campaign.targeting_config.dateStart,
            dateEnd: campaign.targeting_config.dateEnd,
            frequency: campaign.targeting_config.frequency,
            geoTargeting: campaign.targeting_config.geoTargeting,
        },
        abTest: campaign.ab_test_config.enabled
            ? {
                  enabled: true,
                  variants: campaign.ab_test_config.variants.map((v) => ({
                      id: v.id,
                      name: v.name,
                      weight: v.weight,
                      popupConfig: v.popupConfig,
                  })),
              }
            : { enabled: false, variants: [] },
        integrations: campaign.integrations
            .filter((i) => i.enabled)
            .map((i) => ({ type: i.type, config: i.config })),
        revenueTracking: campaign.revenue_tracking,
    }
}

/**
 * Generate the inline embed code.
 */
export function generateEmbedCode(campaign: Campaign, analyticsUrl?: string): string {
    const config = buildEmbedConfig(campaign, analyticsUrl)
    const json = JSON.stringify(config)
    return `<!-- Popup Builder v2 -->
<div data-pb-config='${json.replace(/'/g, "&#39;")}' style="display:none"></div>
<script>
${getEmbedRuntime()}
</script>
<!-- /Popup Builder -->`
}

/**
 * Minified embed runtime as a string for inlining.
 * v2: supports countdown, spin wheel, content locker, floating button,
 * notification, multi-step, geo-targeting, adblock detection,
 * scroll-to-element, purchase event, revenue tracking.
 */
function getEmbedRuntime(): string {
    return `(function(){var S="pb_",sh=false,sc=0,it=null;function gv(){var k=S+"vid";try{var e=localStorage.getItem(k);if(e)return e}catch(x){}var id=typeof crypto!=="undefined"&&crypto.randomUUID?crypto.randomUUID():"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(c){var r=Math.random()*16|0;return(c==="x"?r:(r&3|8)).toString(16)});try{localStorage.setItem(k,id)}catch(x){}return id}function gd(){var w=window.innerWidth;return w<768?"mobile":w<1024?"tablet":"desktop"}function gc(){var el=document.querySelector("[data-pb-config]");if(!el)return null;try{return JSON.parse(el.getAttribute("data-pb-config")||"")}catch(x){return null}}function ve(e){return/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(e)}function mpr(r,p){switch(r.type){case"exact":return p===r.value;case"contains":return p.indexOf(r.value)>=0;case"regex":try{return new RegExp(r.value).test(p)}catch(x){return false}default:return false}}function epr(rules){if(!rules||!rules.length)return true;var p=window.location.pathname+window.location.search,inc=[],exc=[];for(var i=0;i<rules.length;i++){if(rules[i].exclude)exc.push(rules[i]);else inc.push(rules[i])}for(var i=0;i<exc.length;i++){if(mpr(exc[i],p))return false}if(inc.length>0){for(var i=0;i<inc.length;i++){if(mpr(inc[i],p))return true}return false}return true}function mt(t){if(t.visitorType!=="all"){var v=localStorage.getItem(S+"visited"),ir=!!v;localStorage.setItem(S+"visited","1");if(t.visitorType==="new"&&ir)return false;if(t.visitorType==="returning"&&!ir)return false}if(t.deviceType!=="all"&&t.deviceType!==gd())return false;if(t.pageRules&&t.pageRules.length>0&&!epr(t.pageRules))return false;if(t.referrerSource){var ref=document.referrer.toLowerCase();if(ref.indexOf(t.referrerSource.toLowerCase())<0)return false}if(t.dateStart){var now=new Date(),ds=new Date(t.dateStart);if(now<ds)return false}if(t.dateEnd){var now2=new Date(),de=new Date(t.dateEnd);if(now2>de)return false}return true}function cf(freq){var fk=S+"freq_";if(freq==="always")return true;if(freq==="once"){if(localStorage.getItem(fk+"once"))return false;return true}if(freq==="once-per-session"){if(sc>0)return false;return true}if(freq==="once-per-day"){var ld=localStorage.getItem(fk+"day");if(ld){var d=new Date(parseInt(ld)),n=new Date();if(d.toDateString()===n.toDateString())return false}return true}return true}function mf(freq){var fk=S+"freq_";if(freq==="once")localStorage.setItem(fk+"once","1");if(freq==="once-per-day")localStorage.setItem(fk+"day",Date.now().toString())}function te(cfg,ev,ld){if(!cfg.apiUrl)return;var p={campaignId:cfg.campaignId,event:ev,visitorId:gv(),device:gd(),pageUrl:window.location.href,variantId:null};if(ld)p.lead=ld;try{fetch(cfg.apiUrl+"/track",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(p)}).catch(function(){})}catch(x){}}function ia(){if(document.getElementById("pb-animations"))return;var s=document.createElement("style");s.id="pb-animations";s.textContent="@keyframes pb-fi{from{opacity:0}to{opacity:1}}@keyframes pb-su{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}@keyframes pb-sc{from{opacity:0;transform:scale(.9)}to{opacity:1;transform:scale(1)}}@keyframes pb-sr{from{opacity:0;transform:translateX(100%)}to{opacity:1;transform:translateX(0)}}@keyframes pb-sdb{from{opacity:0;transform:translateY(-100%)}to{opacity:1;transform:translateY(0)}}@keyframes pb-sub{from{opacity:0;transform:translateY(100%)}to{opacity:1;transform:translateY(0)}}@keyframes pb-spin{from{transform:rotate(0deg)}to{transform:rotate(var(--pb-spin-deg))}}#pb-overlay{animation:pb-fi .3s ease-out}.pb-modal{animation:pb-sc .3s ease-out}.pb-slide-in{animation:pb-sr .4s ease-out}.pb-fullscreen{animation:pb-fi .3s ease-out}.pb-banner-top{animation:pb-sdb .3s ease-out}.pb-banner-bottom{animation:pb-sub .3s ease-out}.pb-toast,.pb-notification{animation:pb-sr .3s ease-out}.pb-floating-button{animation:pb-su .3s ease-out}.pb-spin-wheel{animation:pb-sc .3s ease-out}.pb-content-locker{animation:pb-fi .3s ease-out}.pb-cd-wrap{display:flex;gap:8px;justify-content:center;margin:12px 0}.pb-cd-unit{text-align:center}.pb-cd-digit{font-size:24px;font-weight:700;padding:6px 10px;border-radius:6px;min-width:40px;display:inline-block}.pb-cd-label{font-size:10px;margin-top:2px;text-transform:uppercase}";document.head.appendChild(s)}function rcd(pp,cw){var cd=pp.countdown;if(!cd||!cd.enabled)return;var dl;if(cd.mode==="evergreen"){var k=S+"cd_"+window.__pbCid;try{var st=localStorage.getItem(k);if(st)dl=parseInt(st);else{dl=Date.now()+cd.evergreenMinutes*60000;localStorage.setItem(k,dl.toString())}}catch(x){dl=Date.now()+cd.evergreenMinutes*60000}}else{dl=new Date(cd.fixedDeadline).getTime();if(isNaN(dl))return}var w=document.createElement("div");w.className="pb-cd-wrap";function u(){var n=Date.now(),d=dl-n;if(d<=0){if(cd.expiredBehavior==="hide"){var ov=document.getElementById("pb-overlay");if(ov)ov.remove()}else if(cd.expiredBehavior==="message"){w.innerHTML='<div style="font-size:14px;font-weight:600">'+cd.expiredMessage+'</div>'}else if(cd.expiredBehavior==="redirect"&&cd.expiredRedirectUrl){window.location.href=cd.expiredRedirectUrl}return}var dd=Math.floor(d/86400000),hh=Math.floor(d%86400000/3600000),mm=Math.floor(d%3600000/60000),ss=Math.floor(d%60000/1000),h="";if(cd.showDays)h+='<div class="pb-cd-unit"><div class="pb-cd-digit" style="color:'+cd.digitColor+";background:"+cd.digitBgColor+'">'+String(dd).padStart(2,"0")+'</div><div class="pb-cd-label" style="color:'+cd.labelColor+'">Days</div></div>';if(cd.showHours)h+='<div class="pb-cd-unit"><div class="pb-cd-digit" style="color:'+cd.digitColor+";background:"+cd.digitBgColor+'">'+String(hh).padStart(2,"0")+'</div><div class="pb-cd-label" style="color:'+cd.labelColor+'">Hours</div></div>';if(cd.showMinutes)h+='<div class="pb-cd-unit"><div class="pb-cd-digit" style="color:'+cd.digitColor+";background:"+cd.digitBgColor+'">'+String(mm).padStart(2,"0")+'</div><div class="pb-cd-label" style="color:'+cd.labelColor+'">Min</div></div>';if(cd.showSeconds)h+='<div class="pb-cd-unit"><div class="pb-cd-digit" style="color:'+cd.digitColor+";background:"+cd.digitBgColor+'">'+String(ss).padStart(2,"0")+'</div><div class="pb-cd-label" style="color:'+cd.labelColor+'">Sec</div></div>';w.innerHTML=h}u();setInterval(u,1000);cw.appendChild(w)}function rsw(cfg,pp,ov){var sw=pp.spinWheel;if(!sw||!sw.enabled)return;var segs=sw.segments,n=segs.length;var cv=document.createElement("canvas");cv.width=280;cv.height=280;cv.style.display="block";cv.style.margin="10px auto";var ctx=cv.getContext("2d");var cx=140,cy=140,r=130;function draw(rot){ctx.clearRect(0,0,280,280);var sa=2*Math.PI/n;for(var i=0;i<n;i++){ctx.beginPath();ctx.moveTo(cx,cy);ctx.arc(cx,cy,r,sa*i+rot,sa*(i+1)+rot);ctx.closePath();ctx.fillStyle=segs[i].color;ctx.fill();ctx.strokeStyle=sw.wheelBorderColor||"#333";ctx.lineWidth=2;ctx.stroke();ctx.save();ctx.translate(cx,cy);ctx.rotate(sa*i+sa/2+rot);ctx.textAlign="center";ctx.fillStyle="#fff";ctx.font="bold 11px sans-serif";ctx.fillText(segs[i].label,r*0.6,4);ctx.restore()}ctx.beginPath();ctx.moveTo(cx+r+5,cy);ctx.lineTo(cx+r+15,cy-8);ctx.lineTo(cx+r+15,cy+8);ctx.closePath();ctx.fillStyle=sw.pointerColor||"#e00";ctx.fill()}draw(0);ov.querySelector(".pb-spin-wheel").appendChild(cv);var spinning=false;var spinBtn=document.getElementById("pb-spin-btn");if(spinBtn)spinBtn.onclick=function(){if(spinning)return;spinning=true;var tw=segs.reduce(function(s,x){return s+x.probability},0),rn=Math.random()*tw,acc=0,wi=0;for(var i=0;i<n;i++){acc+=segs[i].probability;if(rn<=acc){wi=i;break}}var sa=2*Math.PI/n,ta=sa*wi+sa/2,fs=5+Math.floor(Math.random()*3),tr=fs*2*Math.PI+(2*Math.PI-ta),dur=4000,st=Date.now();function anim(){var el=(Date.now()-st)/dur;if(el>=1){draw(tr);var seg=segs[wi];var rd=document.getElementById("pb-spin-result");if(rd){if(seg.isNoPrize){rd.textContent=seg.label;rd.style.color="#999"}else{rd.textContent=sw.prizeMessage.replace("{value}",seg.value);rd.style.color="#10b981"}}return}var ease=1-Math.pow(1-el,3);draw(ease*tr);requestAnimationFrame(anim)}anim()}}function rcl(cfg,pp){var cl=pp.contentLocker;if(!cl||!cl.enabled)return;var uk=S+"cl_"+cfg.campaignId;try{var u=localStorage.getItem(uk);if(u){if(cl.unlockDuration==="permanent")return;if(cl.unlockDuration==="session"&&sessionStorage.getItem(uk))return}}catch(x){}var sels=cl.selectors.split(",");for(var i=0;i<sels.length;i++){var els=document.querySelectorAll(sels[i].trim());for(var j=0;j<els.length;j++){var el=els[j];if(cl.lockMode==="blur"){el.style.filter="blur("+cl.blurAmount+"px)";el.style.userSelect="none";el.style.pointerEvents="none"}else{el.style.display="none"}el.setAttribute("data-pb-locked","1")}}}function ucl(cfg,pp){var cl=pp.contentLocker;if(!cl||!cl.enabled)return;var uk=S+"cl_"+cfg.campaignId;try{localStorage.setItem(uk,"1");if(cl.unlockDuration==="session")sessionStorage.setItem(uk,"1")}catch(x){}var sels=cl.selectors.split(",");for(var i=0;i<sels.length;i++){var els=document.querySelectorAll(sels[i].trim());for(var j=0;j<els.length;j++){var el=els[j];el.style.filter="none";el.style.userSelect="auto";el.style.pointerEvents="auto";el.style.display="";el.removeAttribute("data-pb-locked")}}}function rpop(cfg,pcfg){var pp=pcfg||cfg.popup;if(!pp)return;ia();window.__pbCid=cfg.campaignId;var ov=document.createElement("div");ov.id="pb-overlay";var pt=pp.popupType;var isBT=pt==="banner-top",isBB=pt==="banner-bottom",isS=pt==="slide-in",isT=pt==="toast"||pt==="notification",isFS=pt==="fullscreen",isM=pt==="modal",isSW=pt==="spin-wheel",isCL=pt==="content-locker",isFB=pt==="floating-button";var isBanner=isBT||isBB;if(isFB){var fb=document.createElement("div");fb.id="pb-fab";Object.assign(fb.style,{position:"fixed",bottom:"20px",right:"20px",zIndex:"999999",width:"56px",height:"56px",borderRadius:"50%",background:pp.buttonColor||"#3b82f6",color:pp.buttonTextColor||"#fff",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",boxShadow:"0 4px 12px rgba(0,0,0,0.2)",fontSize:"24px",fontWeight:"700"});fb.textContent="+";fb.onclick=function(){fb.style.display="none";rpop(cfg,Object.assign({},pp,{popupType:"slide-in"}))};document.body.appendChild(fb);return}Object.assign(ov.style,{position:"fixed",zIndex:"999999"},isBT?{top:"0",left:"0",right:"0"}:isBB?{bottom:"0",left:"0",right:"0"}:isS||isT?{bottom:"20px",right:"20px"}:{top:"0",left:"0",right:"0",bottom:"0",background:isCL?"rgba(0,0,0,0.7)":"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center"});var bx=document.createElement("div");bx.className="pb-"+pt;var bg=pp.backgroundColor||"#fff";if(pp.backgroundGradient)bg=pp.backgroundGradient;var shd=["none","0 1px 3px rgba(0,0,0,0.1)","0 4px 12px rgba(0,0,0,0.12)","0 8px 24px rgba(0,0,0,0.15)","0 12px 36px rgba(0,0,0,0.2)","0 20px 50px rgba(0,0,0,0.25)"];Object.assign(bx.style,{background:bg,color:pp.textColor||"#111",padding:isBanner?"14px 24px":"28px",borderRadius:isBanner?"0":(pp.borderRadius||12)+"px",maxWidth:isFS?"100vw":(pp.maxWidth||480)+"px",width:isBanner?"100%":isS||isT?"340px":"90%",boxShadow:shd[Math.min(pp.shadowIntensity||3,5)],fontFamily:"-apple-system,BlinkMacSystemFont,sans-serif",position:"relative"});if(isBanner)Object.assign(bx.style,{display:"flex",alignItems:"center",gap:"16px"});else bx.style.textAlign="center";if(pp.backgroundImage)Object.assign(bx.style,{backgroundImage:"url("+pp.backgroundImage+")",backgroundSize:"cover",backgroundPosition:"center"});if(pp.customCss){var cs=document.createElement("style");cs.textContent=pp.customCss;ov.appendChild(cs)}var cbs=pp.closeButtonStyle||"x";if(cbs!=="none"){var cl=document.createElement("button");cl.textContent=cbs==="text"?"Close":"\\u00D7";Object.assign(cl.style,{position:"absolute",top:"8px",right:"12px",background:cbs==="icon-circle"?"rgba(0,0,0,0.1)":"none",border:"none",fontSize:cbs==="text"?"12px":"20px",cursor:"pointer",color:pp.textColor||"#111",opacity:"0.6",borderRadius:cbs==="icon-circle"?"50%":"0",width:cbs==="icon-circle"?"28px":"auto",height:cbs==="icon-circle"?"28px":"auto",display:"flex",alignItems:"center",justifyContent:"center"});cl.onclick=function(){te(cfg,"close");ov.remove()};bx.appendChild(cl)}if(pp.imageUrl&&!isBanner){var im=document.createElement("img");im.src=pp.imageUrl;im.alt="";Object.assign(im.style,{display:"block",maxWidth:"100%",borderRadius:"8px",margin:"0 auto 14px auto",maxHeight:isT?"80px":"200px",objectFit:"cover"});bx.appendChild(im)}var cw=isBanner?document.createElement("div"):bx;if(isBanner){cw.style.flex="1";bx.appendChild(cw)}var hd=document.createElement("h2");hd.textContent=pp.headline;hd.style.margin="0 0 6px 0";hd.style.fontSize=isBanner||isT?"15px":"22px";hd.style.fontWeight="700";cw.appendChild(hd);if(!isBanner||isT){var bd=document.createElement("p");bd.textContent=pp.body;bd.style.margin="0 0 14px 0";bd.style.fontSize=isT?"12px":"14px";bd.style.opacity="0.8";bd.style.lineHeight="1.5";cw.appendChild(bd)}rcd(pp,cw);var fc=document.createElement("div");fc.id="pb-form";var er=document.createElement("div");er.id="pb-error";Object.assign(er.style,{color:"#ef4444",fontSize:"12px",marginBottom:"8px",display:"none"});fc.appendChild(er);if(isSW&&pp.spinWheel&&pp.spinWheel.enabled){if(pp.spinWheel.emailBeforeSpin){var ei=document.createElement("input");ei.type="email";ei.placeholder="your@email.com";ei.id="pb-spin-email";Object.assign(ei.style,{display:"block",width:"100%",maxWidth:"260px",margin:"0 auto 8px auto",padding:"8px 12px",border:"1px solid #555",borderRadius:"6px",fontSize:"14px",boxSizing:"border-box",background:"rgba(255,255,255,0.1)",color:pp.textColor||"#fff"});fc.appendChild(ei)}var sb=document.createElement("button");sb.id="pb-spin-btn";sb.textContent=pp.spinWheel.spinButtonText||"Spin!";Object.assign(sb.style,{padding:"10px 24px",background:pp.buttonColor||"#e00",color:pp.buttonTextColor||"#fff",border:"none",borderRadius:"6px",fontSize:"14px",fontWeight:"600",cursor:"pointer",display:"block",margin:"8px auto"});fc.appendChild(sb);var sr=document.createElement("div");sr.id="pb-spin-result";Object.assign(sr.style,{fontSize:"16px",fontWeight:"700",textAlign:"center",marginTop:"10px",minHeight:"24px"});fc.appendChild(sr);cw.appendChild(fc);ov.appendChild(bx);document.body.appendChild(ov);te(cfg,"view");rsw(cfg,pp,ov);return}var fields=pp.formFields||[];var inputs={};for(var fi=0;fi<fields.length;fi++){var f=fields[fi];var inp=document.createElement("input");inp.type=f.type==="email"?"email":f.type==="phone"?"tel":"text";inp.placeholder=f.placeholder||f.label;inp.id="pb-field-"+f.id;Object.assign(inp.style,{display:"block",width:isBanner?"180px":"100%",maxWidth:"300px",margin:isBanner?"0":"0 auto 8px auto",padding:"8px 12px",border:"1px solid #ddd",borderRadius:"6px",fontSize:"14px",boxSizing:"border-box"});fc.appendChild(inp);inputs[f.id]={el:inp,field:f}}var bc=pp.buttonColor||"#3b82f6",btc=pp.buttonTextColor||"#fff";var bt=document.createElement("button");bt.textContent=pp.ctaText||"Submit";Object.assign(bt.style,{padding:"10px 24px",background:bc,color:btc,border:"none",borderRadius:"6px",fontSize:"14px",fontWeight:"600",cursor:"pointer",display:isBanner?"inline-block":"block",margin:isBanner?"0":"8px auto 0 auto"});bt.onclick=function(){for(var key in inputs){var d=inputs[key],val=d.el.value.trim();if(d.field.required&&!val){er.textContent="Please fill in "+d.field.label+".";er.style.display="block";return}if(d.field.type==="email"&&val&&!ve(val)){er.textContent="Please enter a valid email address.";er.style.display="block";return}}var ld={};for(var key2 in inputs)ld[key2]=inputs[key2].el.value.trim();te(cfg,"convert",ld);mf(cfg.targeting.frequency);if(isCL)ucl(cfg,pp);var sm=pp.successMessage||"Thanks!";var els=fc.querySelectorAll("input,button");for(var i=0;i<els.length;i++)els[i].style.display="none";er.style.display="none";var sc2=document.createElement("div");sc2.textContent=sm;Object.assign(sc2.style,{padding:"14px",fontSize:"15px",fontWeight:"600",textAlign:"center"});fc.appendChild(sc2);if(pp.redirectUrl){setTimeout(function(){window.location.href=pp.redirectUrl},2000)}else{setTimeout(function(){ov.remove()},3000)}};fc.appendChild(bt);if(isBanner)Object.assign(fc.style,{display:"flex",alignItems:"center",gap:"8px"});cw.appendChild(fc);ov.appendChild(bx);document.body.appendChild(ov);te(cfg,"view");if(isCL)rcl(cfg,pp)}function sp(cfg){if(sh)return;if(!cf(cfg.targeting.frequency))return;sh=true;sc++;mf(cfg.targeting.frequency);if(cfg.abTest&&cfg.abTest.enabled&&cfg.abTest.variants&&cfg.abTest.variants.length>0){var r=Math.random()*100,acc=0;for(var i=0;i<cfg.abTest.variants.length;i++){acc+=cfg.abTest.variants[i].weight;if(r<=acc){cfg.variantId=cfg.abTest.variants[i].id;rpop(cfg,cfg.abTest.variants[i].popupConfig);return}}rpop(cfg,cfg.abTest.variants[0].popupConfig)}else{rpop(cfg,null)}}function dab(){try{var d=document.createElement("div");d.innerHTML="&nbsp;";d.className="adsbox ad-placement ad_unit";d.style.cssText="position:absolute;left:-9999px;top:-9999px;width:1px;height:1px";document.body.appendChild(d);var blocked=d.offsetHeight===0||d.clientHeight===0;document.body.removeChild(d);return blocked}catch(e){return false}}function strig(cfg){for(var i=0;i<cfg.triggers.length;i++){var tr=cfg.triggers[i];if(!tr.enabled)continue;switch(tr.type){case"exit-intent":var sn=tr.config.sensitivity||20;document.addEventListener("mouseleave",function(e){if(e.clientY<=sn)sp(cfg)});break;case"scroll":var pc=tr.config.percentage||50;window.addEventListener("scroll",function(){var s=window.scrollY/(document.body.scrollHeight-window.innerHeight)*100;if(s>=pc)sp(cfg)});break;case"time-delay":var sec=tr.config.seconds||5;setTimeout(function(){sp(cfg)},sec*1000);break;case"click":var sel=tr.config.selector;if(sel)document.addEventListener("click",function(e){if(e.target.matches&&e.target.matches(sel))sp(cfg)});break;case"page-load":sp(cfg);break;case"inactivity":var isec=tr.config.seconds||30;var rit=function(){if(it)clearTimeout(it);it=setTimeout(function(){sp(cfg)},isec*1000)};rit();["mousemove","keydown","mousedown","touchstart","scroll"].forEach(function(ev){document.addEventListener(ev,rit,{passive:true})});break;case"adblock":if(dab())sp(cfg);break;case"scroll-to-element":var esel=tr.config.selector;if(esel){var obs=new IntersectionObserver(function(entries){entries.forEach(function(en){if(en.isIntersecting){sp(cfg);obs.disconnect()}})},{threshold:0.5});var tel=document.querySelector(esel);if(tel)obs.observe(tel)}break;case"purchase-event":var evn=tr.config.eventName||"purchase";window.addEventListener(evn,function(){sp(cfg)});break}}}function init(){var cfg=gc();if(!cfg){return}if(!mt(cfg.targeting))return;strig(cfg)}if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init()})()`;
}

/**
 * Copy text to clipboard. Returns true on success.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text)
        return true
    } catch {
        const textarea = document.createElement("textarea")
        textarea.value = text
        textarea.style.position = "fixed"
        textarea.style.opacity = "0"
        document.body.appendChild(textarea)
        textarea.select()
        try {
            document.execCommand("copy")
            return true
        } catch {
            return false
        } finally {
            document.body.removeChild(textarea)
        }
    }
}
