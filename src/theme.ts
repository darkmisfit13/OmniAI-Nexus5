/**
 * Dark Misfit Studios - Absolute Black Cyberpunk Global Design Tokens
 * Single source of truth for OmniAI - Nexus Mobile & Desktop Architecture
 */

export const OBSIDIAN_TOKENS = {
  // 1. APPLICATION CANVAS SURFACES (THE CORE BASE)
  canvas: {
    // Pure Shiny Black (#000000): Root window canvas of every screen viewport, phone pane & web layout
    root: '#000000',
    // Obsidian-Purple (#0a071b): Secondary cards, chat bubble layers, container panels, dropdown menus, sidebars
    surface: '#0a071b',
    card: '#0a071b',
    cardHover: '#130d2d',
    panel: '#0a071b',
    sidebar: '#0a071b',
    border: '#1e1642',
    borderHighlight: '#2a2254',
    borderMuted: '#140f2e',
  },

  // 2. PRIMARY BUTTON & NAVIGATION ACCENTS (PURPLISH-BLUE #0C00CA)
  accents: {
    // Signature Purplish-Blue (#0C00CA / Electric Ultramarine)
    primary: '#0C00CA',
    primaryHover: '#1a0fe0',
    primaryActive: '#08008f',
    haloShadow: '0 0 16px rgba(12, 0, 202, 0.45), inset 0 0 10px rgba(12, 0, 202, 0.18)',
    boundaryGlow: '0 0 14px rgba(12, 0, 202, 0.55)',
    ring: 'rgba(12, 0, 202, 0.45)',
    sliderTrack: '#1e1642',
    sliderProgress: '#0C00CA',
    navTabLine: '#0C00CA',
  },

  // 3. DIAGNOSTIC METRICS & STATUS TEXT (BABY BLUE / LIGHT BLUE #00FFFF)
  diagnostics: {
    // Baby Blue / Light Blue (#00FFFF): Monospaced telemetry lines, data tickers, streaming terminals, active status
    babyBlue: '#00FFFF',
    lightBlue: '#00FFFF',
    babyBlueGlow: '0 0 10px rgba(0, 255, 255, 0.55)',
    statusPillBg: 'rgba(0, 255, 255, 0.12)',
    statusPillBorder: 'rgba(0, 255, 255, 0.4)',
    safeZoneOutline: '#00FFFF',
  },

  // Agent Labels (All rendered in Baby Blue #00FFFF)
  agents: {
    strategist: {
      name: 'THE STRATEGIST',
      color: '#00FFFF',
      badgeBg: 'rgba(0, 255, 255, 0.15)',
      badgeBorder: 'rgba(0, 255, 255, 0.4)',
    },
    empath: {
      name: 'THE EMPATH',
      color: '#00FFFF',
      badgeBg: 'rgba(0, 255, 255, 0.15)',
      badgeBorder: 'rgba(0, 255, 255, 0.4)',
    },
    ghost: {
      name: 'THE GHOST',
      color: '#00FFFF',
      badgeBg: 'rgba(0, 255, 255, 0.15)',
      badgeBorder: 'rgba(0, 255, 255, 0.4)',
    },
  },

  // Android Styles XML Template Export
  androidStylesXml: `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <!-- Dark Misfit Studios: Absolute Black Cyberpunk Android Palette -->
    <color name="omni_canvas_black">#000000</color>
    <color name="omni_obsidian_purple">#0A071B</color>
    <color name="omni_purplish_blue">#0C00CA</color>
    <color name="omni_baby_blue">#00FFFF</color>
    <color name="omni_border_purple">#1E1642</color>

    <style name="Theme.OmniAI.Nexus" parent="Theme.MaterialComponents.DayNight.NoActionBar">
        <item name="android:windowBackground">@color/omni_canvas_black</item>
        <item name="android:colorBackground">@color/omni_canvas_black</item>
        <item name="colorPrimary">@color/omni_purplish_blue</item>
        <item name="colorSecondary">@color/omni_baby_blue</item>
        <item name="android:statusBarColor">@color/omni_canvas_black</item>
        <item name="android:navigationBarColor">@color/omni_canvas_black</item>
    </style>
</resources>`,

  // Kotlin Compose Theme Template Export
  kotlinComposeTheme: `package com.darkmisfit.omni.theme

import androidx.compose.material3.darkColorScheme
import androidx.compose.ui.graphics.Color

val CanvasBlack = Color(0xFF000000)
val ObsidianPurple = Color(0xFF0A071B)
val PurplishBlue = Color(0xFF0C00CA)
val BabyBlue = Color(0xFF00FFFF)
val BorderPurple = Color(0xFF1E1642)

val OmniAbsoluteBlackCyberpunkColorScheme = darkColorScheme(
    primary = PurplishBlue,
    secondary = BabyBlue,
    background = CanvasBlack,
    surface = ObsidianPurple,
    surfaceVariant = ObsidianPurple,
    outline = BorderPurple
)
`
};
