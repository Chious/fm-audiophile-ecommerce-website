import { edenFetch, treaty } from "@elysiajs/eden";
import type { App } from "@/api/[[...slugs]]/route";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:8080";

export const api = treaty<App>(baseUrl).api;

export const fetch = edenFetch<App>(baseUrl);
