globalThis.process ??= {}; globalThis.process.env ??= {};
import { g as decodeKey } from './chunks/astro/server_B_tH219N.mjs';
import './chunks/astro-designed-error-pages_BtR5q7fZ.mjs';
import { N as NOOP_MIDDLEWARE_FN } from './chunks/noop-middleware_DR8EvKvF.mjs';

function sanitizeParams(params) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      if (typeof value === "string") {
        return [key, value.normalize().replace(/#/g, "%23").replace(/\?/g, "%3F")];
      }
      return [key, value];
    })
  );
}
function getParameter(part, params) {
  if (part.spread) {
    return params[part.content.slice(3)] || "";
  }
  if (part.dynamic) {
    if (!params[part.content]) {
      throw new TypeError(`Missing parameter: ${part.content}`);
    }
    return params[part.content];
  }
  return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]");
}
function getSegment(segment, params) {
  const segmentPath = segment.map((part) => getParameter(part, params)).join("");
  return segmentPath ? "/" + segmentPath : "";
}
function getRouteGenerator(segments, addTrailingSlash) {
  return (params) => {
    const sanitizedParams = sanitizeParams(params);
    let trailing = "";
    if (addTrailingSlash === "always" && segments.length) {
      trailing = "/";
    }
    const path = segments.map((segment) => getSegment(segment, sanitizedParams)).join("") + trailing;
    return path || "/";
  };
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender,
    redirect: rawRouteData.redirect,
    redirectRoute: rawRouteData.redirectRoute ? deserializeRouteData(rawRouteData.redirectRoute) : void 0,
    fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
      return deserializeRouteData(fallback);
    }),
    isIndex: rawRouteData.isIndex,
    origin: rawRouteData.origin
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  const componentMetadata = new Map(serializedManifest.componentMetadata);
  const inlinedScripts = new Map(serializedManifest.inlinedScripts);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  const serverIslandNameMap = new Map(serializedManifest.serverIslandNameMap);
  const key = decodeKey(serializedManifest.key);
  return {
    // in case user middleware exists, this no-op middleware will be reassigned (see plugin-ssr.ts)
    middleware() {
      return { onRequest: NOOP_MIDDLEWARE_FN };
    },
    ...serializedManifest,
    assets,
    componentMetadata,
    inlinedScripts,
    clientDirectives,
    routes,
    serverIslandNameMap,
    key
  };
}

const manifest = deserializeManifest({"hrefRoot":"file:///home/avi/projects/astro-site/tpp-astro/tpp-astro/","cacheDir":"file:///home/avi/projects/astro-site/tpp-astro/tpp-astro/node_modules/.astro/","outDir":"file:///home/avi/projects/astro-site/tpp-astro/tpp-astro/dist/","srcDir":"file:///home/avi/projects/astro-site/tpp-astro/tpp-astro/src/","publicDir":"file:///home/avi/projects/astro-site/tpp-astro/tpp-astro/public/","buildClientDir":"file:///home/avi/projects/astro-site/tpp-astro/tpp-astro/dist/","buildServerDir":"file:///home/avi/projects/astro-site/tpp-astro/tpp-astro/dist/_worker.js/","adapterName":"@astrojs/cloudflare","routes":[{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"page","component":"_server-islands.astro","params":["name"],"segments":[[{"content":"_server-islands","dynamic":false,"spread":false}],[{"content":"name","dynamic":true,"spread":false}]],"pattern":"^\\/_server-islands\\/([^/]+?)\\/?$","prerender":false,"isIndex":false,"fallbackRoutes":[],"route":"/_server-islands/[name]","origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"index-complete/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/index-complete","isIndex":false,"type":"page","pattern":"^\\/index-complete\\/?$","segments":[[{"content":"index-complete","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/index-complete.html","pathname":"/index-complete","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/","isIndex":true,"type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}}],"site":"https://theprofitplatform.com.au","base":"/","trailingSlash":"ignore","compressHTML":true,"componentMetadata":[["/home/avi/projects/astro-site/tpp-astro/tpp-astro/src/pages/index.astro",{"propagation":"none","containsHead":true}]],"renderers":[],"clientDirectives":[["idle","(()=>{var l=(n,t)=>{let i=async()=>{await(await n())()},e=typeof t.value==\"object\"?t.value:void 0,s={timeout:e==null?void 0:e.timeout};\"requestIdleCallback\"in window?window.requestIdleCallback(i,s):setTimeout(i,s.timeout||200)};(self.Astro||(self.Astro={})).idle=l;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var n=(a,t)=>{let i=async()=>{await(await a())()};if(t.value){let e=matchMedia(t.value);e.matches?i():e.addEventListener(\"change\",i,{once:!0})}};(self.Astro||(self.Astro={})).media=n;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var a=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value==\"object\"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let l of e)if(l.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=a;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"\u0000astro-internal:middleware":"_astro-internal_middleware.mjs","\u0000noop-actions":"_noop-actions.mjs","\u0000@astro-page:src/pages/index-complete@_@html":"pages/index-complete.astro.mjs","\u0000@astro-page:src/pages/index@_@astro":"pages/index.astro.mjs","\u0000@astrojs-ssr-virtual-entry":"index.js","\u0000@astro-renderers":"renderers.mjs","\u0000@astrojs-ssr-adapter":"_@astrojs-ssr-adapter.mjs","\u0000@astrojs-manifest":"manifest_BdPSrG_z.mjs","/home/avi/projects/astro-site/tpp-astro/tpp-astro/node_modules/unstorage/drivers/cloudflare-kv-binding.mjs":"chunks/cloudflare-kv-binding_DMly_2Gl.mjs","/home/avi/projects/astro-site/tpp-astro/tpp-astro/src/pages/index.astro?astro&type=script&index=0&lang.ts":"_astro/index.astro_astro_type_script_index_0_lang.K-o05hCX.js","/home/avi/projects/astro-site/tpp-astro/tpp-astro/src/layouts/BaseLayout.astro?astro&type=script&index=0&lang.ts":"_astro/BaseLayout.astro_astro_type_script_index_0_lang.CiNYOkpB.js","/home/avi/projects/astro-site/tpp-astro/tpp-astro/src/layouts/BaseLayout.astro?astro&type=script&index=1&lang.ts":"_astro/BaseLayout.astro_astro_type_script_index_1_lang.Cprtm7CX.js","astro:scripts/before-hydration.js":""},"inlinedScripts":[["/home/avi/projects/astro-site/tpp-astro/tpp-astro/src/pages/index.astro?astro&type=script&index=0&lang.ts","document.addEventListener(\"DOMContentLoaded\",function(){const e=document.createElement(\"script\");e.src=\"/js/components/navigation-inline.js\",e.defer=!0,document.head.appendChild(e)});"],["/home/avi/projects/astro-site/tpp-astro/tpp-astro/src/layouts/BaseLayout.astro?astro&type=script&index=0&lang.ts","(function(t,s,n,h,j,e){t.hj=t.hj||function(){(t.hj.q=t.hj.q||[]).push(arguments)},t._hjSettings={hjid:6526316,hjsv:6},j=s.getElementsByTagName(\"head\")[0],e=s.createElement(\"script\"),e.async=1,e.src=n+t._hjSettings.hjid+h+t._hjSettings.hjsv,j.appendChild(e)})(window,document,\"https://static.hotjar.com/c/hotjar-\",\".js?sv=\");"],["/home/avi/projects/astro-site/tpp-astro/tpp-astro/src/layouts/BaseLayout.astro?astro&type=script&index=1&lang.ts","window.dataLayer=window.dataLayer||[];function a(){dataLayer.push(arguments)}a(\"js\",new Date);a(\"config\",\"G-FB947JWCFT\");"]],"assets":["/_headers","/favicon.svg","/robots.txt","/test-phase2-performance.js","/_astro/ContactSection.astro_astro_type_script_index_0_lang.C7RFDwbv.js","/_astro/index.DgPovgi6.css","/_worker.js/_@astrojs-ssr-adapter.mjs","/_worker.js/_astro-internal_middleware.mjs","/_worker.js/_noop-actions.mjs","/_worker.js/index.js","/_worker.js/renderers.mjs","/css/bundled.min.css","/css/combined.css","/css/combined.min.css","/css/consolidated.min.css","/css/critical-inline.css","/css/critical-inline.min.css","/css/critical.css","/css/critical.min.css","/css/dropdown-fix.css","/css/extracted-inline-styles.css","/css/fix-animations.css","/css/google-ads-enhanced.css","/css/header-fix.css","/css/hero-content-spacing.css","/css/hero-fix.css","/css/hero-modern.css","/css/html-update.txt","/css/index-nav-fix.css","/css/inline-styles-mapping.json","/css/layout.css","/css/loading-states.css","/css/main-content-spacing.css","/css/modern-theme-components.css","/css/modern-theme-variables.css","/css/navigation-contact-page-fix.css","/css/navigation-dropdown-fix.css","/css/navigation-glass-enhanced.css","/css/navigation.css","/css/performance-optimizations.css","/css/pricing-enhanced.css","/css/seo-ultra.css","/css/services-fix.css","/css/services.css","/css/skip-links-fix.css","/css/style.css","/css/style.min.css","/css/trust-signals-enhanced.css","/css/trust-signals-homepage-theme.css","/css/web-design-alignment-fix.css","/css/web-design-cta-enhanced.css","/css/web-design-cta-simple.css","/css/web-design-enhanced.css","/js/accessibility-fixes.js","/js/cdn-fallback.js","/js/combined.min.js","/js/component-library.js","/js/component-loader.js","/js/consolidated.js","/js/consolidated.min.js","/js/email-notification-handler.js","/js/emergency-fixes-loader.js","/js/enhanced-form-handler.js","/js/exit-intent-popup.js","/js/form-handler.js","/js/homepage.js","/js/interactive-features.js","/js/interactive.js","/js/main.js","/js/monitoring.js","/js/plugins.js","/js/predictive-resource-loader.js","/js/pricing-enhanced.js","/js/pricing-ultra.js","/js/seo-ultra.js","/js/tracking-implementation.js","/js/vendor.js","/js/web-design-enhanced.js","/_worker.js/chunks/_@astrojs-ssr-adapter_CSx0Wb2z.mjs","/_worker.js/chunks/astro-designed-error-pages_BtR5q7fZ.mjs","/_worker.js/chunks/astro_N34giBef.mjs","/_worker.js/chunks/cloudflare-kv-binding_DMly_2Gl.mjs","/_worker.js/chunks/index_BPRKXY4j.mjs","/_worker.js/chunks/noop-middleware_DR8EvKvF.mjs","/_worker.js/pages/index-complete.astro.mjs","/_worker.js/pages/index.astro.mjs","/css/consolidated/components.css","/css/consolidated/critical.css","/css/consolidated/pages.css","/css/consolidated/responsive.css","/js/components/footer-loader.js","/js/components/mobile-nav.js","/js/components/navigation-inline.js","/js/components/navigation-loader.js","/js/components/navigation.js","/js/dist/combined.js","/js/dist/combined.min.js","/js/dist/exit-intent.min.js","/js/modules/component-library.js","/js/modules/component-loader.js","/js/modules/consolidated.js","/js/modules/consolidated.min.js","/js/modules/email-notification-handler.js","/js/modules/emergency-fixes-loader.js","/js/modules/exit-intent-popup.js","/js/modules/pricing-enhanced.js","/js/modules/pricing-ultra.js","/js/modules/seo-ultra.js","/js/modules/shared-utils.js","/js/modules/tracking-implementation.js","/js/modules/web-design-enhanced.js","/_worker.js/chunks/astro/server_B_tH219N.mjs","/index-complete/index.html","/index.html"],"buildFormat":"directory","checkOrigin":true,"serverIslandNameMap":[],"key":"RrzzFjYYtRzhQoWv/23RyzFUWl2aAUFNHw2i2TfYUww=","sessionConfig":{"driver":"cloudflare-kv-binding","options":{"binding":"SESSION"}}});
if (manifest.sessionConfig) manifest.sessionConfig.driverModule = () => import('./chunks/cloudflare-kv-binding_DMly_2Gl.mjs');

export { manifest };
