import { onRequest as __api_casefiles_live_js_onRequest } from "/Volumes/HQ/Claude/paris-pullen/functions/api/casefiles-live.js"
import { onRequest as __api_charlotte_live_js_onRequest } from "/Volumes/HQ/Claude/paris-pullen/functions/api/charlotte-live.js"
import { onRequest as __api_clients_js_onRequest } from "/Volumes/HQ/Claude/paris-pullen/functions/api/clients.js"
import { onRequest as __api_content_js_onRequest } from "/Volumes/HQ/Claude/paris-pullen/functions/api/content.js"
import { onRequest as __api_create_invoice_js_onRequest } from "/Volumes/HQ/Claude/paris-pullen/functions/api/create-invoice.js"
import { onRequest as __api_deploy_js_onRequest } from "/Volumes/HQ/Claude/paris-pullen/functions/api/deploy.js"
import { onRequest as __api_house_channels_live_js_onRequest } from "/Volumes/HQ/Claude/paris-pullen/functions/api/house-channels-live.js"
import { onRequest as __api_house_music_live_js_onRequest } from "/Volumes/HQ/Claude/paris-pullen/functions/api/house-music-live.js"
import { onRequest as __api_house_rooms_live_js_onRequest } from "/Volumes/HQ/Claude/paris-pullen/functions/api/house-rooms-live.js"
import { onRequest as __api_inquiries_js_onRequest } from "/Volumes/HQ/Claude/paris-pullen/functions/api/inquiries.js"
import { onRequest as __api_invoices_js_onRequest } from "/Volumes/HQ/Claude/paris-pullen/functions/api/invoices.js"
import { onRequest as __api_journal_live_js_onRequest } from "/Volumes/HQ/Claude/paris-pullen/functions/api/journal-live.js"
import { onRequest as __api_network_js_onRequest } from "/Volumes/HQ/Claude/paris-pullen/functions/api/network.js"
import { onRequest as __api_orders_js_onRequest } from "/Volumes/HQ/Claude/paris-pullen/functions/api/orders.js"
import { onRequest as __api_proposals_js_onRequest } from "/Volumes/HQ/Claude/paris-pullen/functions/api/proposals.js"
import { onRequest as __api_stripe_webhook_js_onRequest } from "/Volumes/HQ/Claude/paris-pullen/functions/api/stripe-webhook.js"
import { onRequest as __api_wardrobe_live_js_onRequest } from "/Volumes/HQ/Claude/paris-pullen/functions/api/wardrobe-live.js"
import { onRequest as ___middleware_js_onRequest } from "/Volumes/HQ/Claude/paris-pullen/functions/_middleware.js"

export const routes = [
    {
      routePath: "/api/casefiles-live",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_casefiles_live_js_onRequest],
    },
  {
      routePath: "/api/charlotte-live",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_charlotte_live_js_onRequest],
    },
  {
      routePath: "/api/clients",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_clients_js_onRequest],
    },
  {
      routePath: "/api/content",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_content_js_onRequest],
    },
  {
      routePath: "/api/create-invoice",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_create_invoice_js_onRequest],
    },
  {
      routePath: "/api/deploy",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_deploy_js_onRequest],
    },
  {
      routePath: "/api/house-channels-live",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_house_channels_live_js_onRequest],
    },
  {
      routePath: "/api/house-music-live",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_house_music_live_js_onRequest],
    },
  {
      routePath: "/api/house-rooms-live",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_house_rooms_live_js_onRequest],
    },
  {
      routePath: "/api/inquiries",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_inquiries_js_onRequest],
    },
  {
      routePath: "/api/invoices",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_invoices_js_onRequest],
    },
  {
      routePath: "/api/journal-live",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_journal_live_js_onRequest],
    },
  {
      routePath: "/api/network",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_network_js_onRequest],
    },
  {
      routePath: "/api/orders",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_orders_js_onRequest],
    },
  {
      routePath: "/api/proposals",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_proposals_js_onRequest],
    },
  {
      routePath: "/api/stripe-webhook",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_stripe_webhook_js_onRequest],
    },
  {
      routePath: "/api/wardrobe-live",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_wardrobe_live_js_onRequest],
    },
  {
      routePath: "/",
      mountPath: "/",
      method: "",
      middlewares: [___middleware_js_onRequest],
      modules: [],
    },
  ]