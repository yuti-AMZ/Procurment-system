"use client";

import { useEffect } from "react";
import { getTenantBranding, type TenantBrandingResponse } from "@/lib/api";
import type { ReactNode } from "react";

function hexToRgb(hex: string) {
  const normalized = hex.replace("#", "").trim();
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
    return null;
  }
  return {
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16),
  };
}

function shadeColor(hex: string, percent: number) {
  const rgb = hexToRgb(hex);
  if (!rgb) {
    return hex;
  }
  const mix = (channel: number) => {
    const value = Math.round(channel + (percent / 100) * (percent > 0 ? 255 - channel : channel));
    return Math.max(0, Math.min(255, value));
  };
  return `#${[mix(rgb.r), mix(rgb.g), mix(rgb.b)]
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("")}`;
}

function applyBrandingVariables(branding: TenantBrandingResponse) {
  const root = document.documentElement;
  const primary = branding.primaryColor || "#c9a84c";
  const secondary = branding.secondaryColor || shadeColor(primary, 18);
  const dark = shadeColor(primary, -18);

  root.style.setProperty("--gold", primary);
  root.style.setProperty("--gold-light", secondary);
  root.style.setProperty("--gold-dark", dark);
  root.style.setProperty("--gold-glow", `${primary}33`);
  root.lang = branding.language || root.lang || "en";
  root.dataset.currency = branding.currency || "USD";
  root.dataset.timezone = branding.timezone || "UTC";
  root.dataset.dateFormat = branding.dateFormat || "YYYY-MM-DD";

  if (branding.faviconUrl) {
    let link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = branding.faviconUrl;
  }
}

export function TenantBrandingProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    let cancelled = false;

    getTenantBranding()
      .then((branding) => {
        if (!cancelled && branding) {
          applyBrandingVariables(branding);
        }
      })
      .catch(() => {
        // keep built-in theme defaults if branding is unavailable
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return children;
}