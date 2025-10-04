import { onRequestPost as __api_n8n_trigger_js_onRequestPost } from "/mnt/c/Users/abhis/projects/atpp/tpp/functions/api/n8n/trigger.js"
import { onRequestGet as __api_n8n_workflows_js_onRequestGet } from "/mnt/c/Users/abhis/projects/atpp/tpp/functions/api/n8n/workflows.js"
import { onRequestPost as __api_serp_rank_check_js_onRequestPost } from "/mnt/c/Users/abhis/projects/atpp/tpp/functions/api/serp/rank-check.js"
import { onRequestOptions as __api_competitor_analysis_js_onRequestOptions } from "/mnt/c/Users/abhis/projects/atpp/tpp/functions/api/competitor-analysis.js"
import { onRequestPost as __api_competitor_analysis_js_onRequestPost } from "/mnt/c/Users/abhis/projects/atpp/tpp/functions/api/competitor-analysis.js"
import { onRequestPost as __api_contact_js_onRequestPost } from "/mnt/c/Users/abhis/projects/atpp/tpp/functions/api/contact.js"
import { onRequestPost as __api_content_generator_js_onRequestPost } from "/mnt/c/Users/abhis/projects/atpp/tpp/functions/api/content-generator.js"
import { onRequestPost as __api_seo_audit_js_onRequestPost } from "/mnt/c/Users/abhis/projects/atpp/tpp/functions/api/seo-audit.js"
import { onRequestPost as __api_speed_test_js_onRequestPost } from "/mnt/c/Users/abhis/projects/atpp/tpp/functions/api/speed-test.js"
import { onRequestGet as __health_js_onRequestGet } from "/mnt/c/Users/abhis/projects/atpp/tpp/functions/health.js"

export const routes = [
    {
      routePath: "/api/n8n/trigger",
      mountPath: "/api/n8n",
      method: "POST",
      middlewares: [],
      modules: [__api_n8n_trigger_js_onRequestPost],
    },
  {
      routePath: "/api/n8n/workflows",
      mountPath: "/api/n8n",
      method: "GET",
      middlewares: [],
      modules: [__api_n8n_workflows_js_onRequestGet],
    },
  {
      routePath: "/api/serp/rank-check",
      mountPath: "/api/serp",
      method: "POST",
      middlewares: [],
      modules: [__api_serp_rank_check_js_onRequestPost],
    },
  {
      routePath: "/api/competitor-analysis",
      mountPath: "/api",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_competitor_analysis_js_onRequestOptions],
    },
  {
      routePath: "/api/competitor-analysis",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_competitor_analysis_js_onRequestPost],
    },
  {
      routePath: "/api/contact",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_contact_js_onRequestPost],
    },
  {
      routePath: "/api/content-generator",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_content_generator_js_onRequestPost],
    },
  {
      routePath: "/api/seo-audit",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_seo_audit_js_onRequestPost],
    },
  {
      routePath: "/api/speed-test",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_speed_test_js_onRequestPost],
    },
  {
      routePath: "/health",
      mountPath: "/",
      method: "GET",
      middlewares: [],
      modules: [__health_js_onRequestGet],
    },
  ]