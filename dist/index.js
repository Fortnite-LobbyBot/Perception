// @bun
var r;(function(e){e["Default"]="en";e["De"]="de";e["Es"]="es";e["Fr"]="fr";e["It"]="it";e["Pl"]="pl";e["Pt"]="pt";e["Tr"]="tr"})(r||(r={}));class l{lockPromise;constructor(){this.lockPromise=void 0}get isLocked(){return!!this.lockPromise}wait(){return this.lockPromise?.promise||Promise.resolve()}lock(){let t;const o=new Promise((c)=>{t=c});this.lockPromise={promise:o,resolve:t}}unlock(){this.lockPromise?.resolve(),this.lockPromise=void 0}}class a{moduleObject;options;constructor(t,o){this.moduleObject=t,this.options=o}translate(t,o){return this.moduleObject?.[t]?.replace(/{(.*?)}/gi,(s,i)=>{return o?.[i]??""})??`TRANSLATION_ERROR: KEY "${t}" MODULE "${this.options.module}"`}}class p{localeObject;constructor(t){this.localeObject=t}createTranslator(t){return new a(this.localeObject?.[t.module],t)}}var d="https://cdn.fnlb.net";class f{scope;contextCache={};loadCache={};constructor(t){this.scope=t}async getContext(t,o){const c=`${t}/${o}.json`,s=this.contextCache[c];if(s)return s;const i=this.loadCache[c];if(!i){const n=new l;n.lock(),this.loadCache[c]=n;const u=await fetch(`${d}/locales/${this.scope}/${c}`).then((e)=>e.json().catch(()=>null)).catch(()=>null);if(!u)return;const m=new p(u);return this.contextCache[c]=m,n.unlock(),m}if(i?.isLocked)await i.wait();return this.contextCache[c]}static transformToSupportedLocale(t){if(typeof t!=="string")return r.Default;const o=t.split("-")[0]?.toLowerCase();if(Object.values(r).includes(o))return o;return r.Default}}export{r as Locales,a as LocaleTranslator,p as LocaleContext,f as LocaleClient};
