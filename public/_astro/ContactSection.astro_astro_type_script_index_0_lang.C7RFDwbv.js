const b="modulepreload",y=function(u){return"/"+u},f={},p=function(e,t,o){let r=Promise.resolve();if(t&&t.length>0){let s=function(a){return Promise.all(a.map(l=>Promise.resolve(l).then(d=>({status:"fulfilled",value:d}),d=>({status:"rejected",reason:d}))))};document.getElementsByTagName("link");const i=document.querySelector("meta[property=csp-nonce]"),c=i?.nonce||i?.getAttribute("nonce");r=s(t.map(a=>{if(a=y(a),a in f)return;f[a]=!0;const l=a.endsWith(".css"),d=l?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${a}"]${d}`))return;const m=document.createElement("link");if(m.rel=l?"stylesheet":b,l||(m.as="script"),m.crossOrigin="",m.href=a,c&&m.setAttribute("nonce",c),document.head.appendChild(m),l)return new Promise((g,v)=>{m.addEventListener("load",g),m.addEventListener("error",()=>v(new Error(`Unable to preload CSS for ${a}`)))})}))}function n(s){const i=new Event("vite:preloadError",{cancelable:!0});if(i.payload=s,window.dispatchEvent(i),!i.defaultPrevented)throw s}return r.then(s=>{for(const i of s||[])i.status==="rejected"&&n(i.reason);return e().catch(n)})};class x{container=null;toasts=new Map;constructor(){this.init()}init(){typeof document>"u"||this.container||(this.container=document.getElementById("toast-container"),this.container||(this.container=document.createElement("div"),this.container.id="toast-container",this.container.setAttribute("aria-live","polite"),this.container.setAttribute("aria-atomic","true"),document.body.appendChild(this.container),this.addStyles()))}addStyles(){if(document.getElementById("toast-styles"))return;const e=document.createElement("style");e.id="toast-styles",e.textContent=`
      #toast-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 99999;
        pointer-events: none;
      }

      .toast {
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        padding: 16px 20px;
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 300px;
        max-width: 500px;
        pointer-events: auto;
        animation: slideIn 0.3s ease-out;
        transition: all 0.3s ease-out;
      }

      .toast.removing {
        animation: slideOut 0.3s ease-out;
        opacity: 0;
        transform: translateX(100%);
      }

      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }

      .toast-icon {
        flex-shrink: 0;
        width: 24px;
        height: 24px;
      }

      .toast-content {
        flex: 1;
        color: #1a1a1a;
        font-size: 14px;
        line-height: 1.5;
      }

      .toast-close {
        flex-shrink: 0;
        background: none;
        border: none;
        color: #666;
        cursor: pointer;
        padding: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: color 0.2s;
      }

      .toast-close:hover {
        color: #333;
      }

      .toast.success {
        border-left: 4px solid #10b981;
      }

      .toast.success .toast-icon {
        color: #10b981;
      }

      .toast.error {
        border-left: 4px solid #ef4444;
      }

      .toast.error .toast-icon {
        color: #ef4444;
      }

      .toast.warning {
        border-left: 4px solid #f59e0b;
      }

      .toast.warning .toast-icon {
        color: #f59e0b;
      }

      .toast.info {
        border-left: 4px solid #3b82f6;
      }

      .toast.info .toast-icon {
        color: #3b82f6;
      }

      /* Position variations */
      #toast-container.top-left {
        top: 20px;
        left: 20px;
        right: auto;
      }

      #toast-container.bottom-right {
        top: auto;
        bottom: 20px;
        right: 20px;
      }

      #toast-container.bottom-left {
        top: auto;
        bottom: 20px;
        left: 20px;
        right: auto;
      }

      #toast-container.top-center {
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        right: auto;
      }

      #toast-container.bottom-center {
        top: auto;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        right: auto;
      }

      @media (max-width: 640px) {
        #toast-container {
          top: 10px;
          left: 10px;
          right: 10px;
        }

        .toast {
          min-width: auto;
          max-width: none;
        }
      }
    `,document.head.appendChild(e)}getIcon(e){return{success:`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>`,error:`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>`,warning:`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>`,info:`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>`}[e]}show(e){this.init();const{message:t,type:o="info",duration:r=4e3,position:n="top-right",dismissible:s=!0}=e;this.container&&(this.container.className="",this.container.classList.add(n));const i=`toast-${Date.now()}`,c=document.createElement("div");return c.id=i,c.className=`toast ${o}`,c.setAttribute("role","alert"),c.innerHTML=`
      <div class="toast-icon">${this.getIcon(o)}</div>
      <div class="toast-content">${t}</div>
      ${s?`
        <button class="toast-close" aria-label="Close notification">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
          </svg>
        </button>
      `:""}
    `,this.container&&(this.container.appendChild(c),this.toasts.set(i,c)),s&&c.querySelector(".toast-close")?.addEventListener("click",()=>this.remove(i)),r>0&&setTimeout(()=>this.remove(i),r),i}remove(e){const t=this.toasts.get(e);t&&(t.classList.add("removing"),setTimeout(()=>{t.remove(),this.toasts.delete(e)},300))}success(e,t){return this.show({...t,message:e,type:"success"})}error(e,t){return this.show({...t,message:e,type:"error"})}warning(e,t){return this.show({...t,message:e,type:"warning"})}info(e,t){return this.show({...t,message:e,type:"info"})}clear(){this.toasts.forEach((e,t)=>this.remove(t))}}const h=new x,w=Object.freeze(Object.defineProperty({__proto__:null,toast:h},Symbol.toStringTag,{value:"Module"}));class E{form;submitButton;originalButtonText="";isSubmitting=!1;constructor(e){this.form=e,this.submitButton=e.querySelector('button[type="submit"]'),this.submitButton&&(this.originalButtonText=this.submitButton.textContent||"Submit")}async submit(e={}){const{endpoint:t="/api/contact",method:o="POST",headers:r={},onSuccess:n,onError:s,validateFields:i=!0,resetOnSuccess:c=!0,showToast:a=!0}=e;if(!this.isSubmitting&&!(i&&!this.validateForm())){this.setLoadingState(!0);try{const l=this.getFormData(),d=await fetch(t,{method:o,headers:{"Content-Type":"application/json",...r},body:JSON.stringify(l)});if(!d.ok)throw new Error(`Failed to submit form: ${d.statusText}`);const m=await d.json();a&&h.success("Form submitted successfully!"),c&&this.form.reset(),n&&n(m),this.trackConversion("form_submission",l)}catch(l){const d=l instanceof Error?l.message:"An error occurred";a&&h.error(d),s&&s(l),console.error("Form submission error:",l)}finally{this.setLoadingState(!1)}}}getFormData(){const e=new FormData(this.form),t={};return e.forEach((o,r)=>{t[r]?Array.isArray(t[r])?t[r].push(o):t[r]=[t[r],o]:t[r]=o}),t.timestamp=new Date().toISOString(),t.url=window.location.href,t.referrer=document.referrer,delete t.honeypot,delete t.website,t}validateForm(){const e=this.form.querySelectorAll("[required]");let t=!0;const o=[];e.forEach(n=>{if(n instanceof HTMLInputElement||n instanceof HTMLTextAreaElement){const s=n.value.trim();n.classList.remove("error");const i=n.parentElement?.querySelector(".field-error");i&&i.remove(),s||(t=!1,n.classList.add("error"),this.showFieldError(n,"This field is required"),o.push(`${n.name||"Field"} is required`)),n.type==="email"&&s&&(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)||(t=!1,n.classList.add("error"),this.showFieldError(n,"Please enter a valid email address"),o.push("Invalid email address"))),n.type==="tel"&&s&&(!/^[\d\s\-\+\(\)]+$/.test(s)||s.replace(/\D/g,"").length<10)&&(t=!1,n.classList.add("error"),this.showFieldError(n,"Please enter a valid phone number"),o.push("Invalid phone number"))}});const r=this.form.querySelector('[name="honeypot"], [name="website"]');return r&&r.value&&(t=!1,console.warn("Honeypot field filled - possible bot submission")),!t&&o.length>0&&h.error(o[0]),t}showFieldError(e,t){const o=document.createElement("span");o.className="field-error",o.textContent=t,o.style.cssText=`
      color: #ef4444;
      font-size: 12px;
      margin-top: 4px;
      display: block;
    `,e.parentElement?.appendChild(o)}setLoadingState(e){this.isSubmitting=e,this.submitButton&&(this.submitButton.disabled=e,e?this.submitButton.innerHTML=`
          <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Submitting...
        `:this.submitButton.textContent=this.originalButtonText),this.form.querySelectorAll("input, textarea, select").forEach(o=>{(o instanceof HTMLInputElement||o instanceof HTMLTextAreaElement||o instanceof HTMLSelectElement)&&(o.disabled=e)})}trackConversion(e,t){typeof window<"u"&&window.gtag&&window.gtag("event",e,{form_name:this.form.id||"contact_form",form_data:t}),typeof window<"u"&&window.fbq&&window.fbq("track","Lead",{content_name:"Contact Form",value:0,currency:"AUD"}),fetch("/api/track",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({event:e,data:t,timestamp:new Date().toISOString()})}).catch(o=>console.error("Tracking error:",o))}}function S(u,e){const t=document.querySelector(u);if(!t)return console.error(`Form not found: ${u}`),null;const o=new E(t);return t.addEventListener("submit",async r=>{r.preventDefault(),await o.submit(e)}),o}async function L(u){if(await new Promise(e=>setTimeout(e,1500)),Math.random()>.8)throw new Error("Network error - please try again");return{success:!0,message:"Form submitted successfully",id:`submission_${Date.now()}`,data:u}}function k(u,e,t={}){const{threshold:o=.1,rootMargin:r="0px",once:n=!0}=t;if(window.matchMedia("(prefers-reduced-motion: reduce)").matches){document.querySelectorAll(u).forEach(a=>{a.classList.add(e),a.classList.add("no-animation")});return}const s=new IntersectionObserver(c=>{c.forEach(a=>{a.isIntersecting?(a.target.classList.add(e),n&&s.unobserve(a.target)):n||a.target.classList.remove(e)})},{threshold:o,rootMargin:r}),i=document.querySelectorAll(u);return i.forEach(c=>s.observe(c)),()=>{i.forEach(c=>s.unobserve(c)),s.disconnect()}}document.addEventListener("DOMContentLoaded",()=>{k(".contact","fade-in-up",{threshold:.2}),S("#contactForm",{endpoint:"/api/contact",resetOnSuccess:!0,showToast:!0,onSuccess:t=>{console.log("Form submitted successfully:",t),typeof window<"u"&&window.gtag&&window.gtag("event","generate_lead",{value:997,currency:"AUD"})},onError:async t=>{console.error("Form submission error:",t);try{const o=document.getElementById("contactForm"),r=new FormData(o),n=Object.fromEntries(r);await L(n);const{toast:s}=await p(async()=>{const{toast:i}=await Promise.resolve().then(()=>w);return{toast:i}},void 0);s.success("Thank you for your inquiry! We'll contact you within 24 hours."),o.reset()}catch{const{toast:r}=await p(async()=>{const{toast:n}=await Promise.resolve().then(()=>w);return{toast:n}},void 0);r.error("Please try again or call us directly.")}}}),document.querySelectorAll("#contactForm input[required], #contactForm textarea[required]").forEach(t=>{t.addEventListener("blur",()=>{const o=t;o.value.trim()?o.classList.remove("error"):o.classList.add("error")})});const e=document.getElementById("phone");e&&e.addEventListener("input",t=>{const o=t.target;let r=o.value.replace(/\D/g,"");r.length>0&&(r.length<=4?r=r.replace(/(\d{4})/,"$1"):r.length<=7?r=r.replace(/(\d{4})(\d{3})/,"$1 $2"):r=r.replace(/(\d{4})(\d{3})(\d{3})/,"$1 $2 $3")),o.value=r})});
