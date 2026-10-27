package com.darkmisfit.omni.theme

import androidx.compose.material3.darkColorScheme
import androidx.compose.ui.graphics.Color

/**
 * Dark Misfit Studios: Absolute Black Cyberpunk Kotlin Compose Design Tokens
 */

// 1. APPLICATION CANVAS SURFACES (THE CORE BASE)
val CanvasRootBlack = Color(0xFF000000)      // Pure Shiny Black (#000000)
val ObsidianPurple = Color(0xFF0A071B)       // Deep Obsidian-Purple (#0a071b)
val BorderPurple = Color(0xFF1E1642)         // Structural Purple Border (#1e1642)
val BorderHighlight = Color(0xFF2A2254)

// 2. PRIMARY BUTTON & NAVIGATION ACCENTS (PURPLISH-BLUE #0C00CA)
val PurplishBlue = Color(0xFF0C00CA)         // Signature Purplish-Blue (#0C00CA)
val PurplishBlueGlow = Color(0xFF1A0FE0)

// 3. DIAGNOSTIC METRICS & STATUS TEXT (BABY BLUE #00FFFF)
val BabyBlue = Color(0xFF00FFFF)             // High-contrast Baby Blue (#00FFFF)
val TextPrimary = Color(0xFFF1F5F9)
val TextMuted = Color(0xFF948EB5)

val OmniAbsoluteBlackCyberpunkColorScheme = darkColorScheme(
    primary = PurplishBlue,
    onPrimary = Color.White,
    primaryContainer = ObsidianPurple,
    secondary = BabyBlue,
    onSecondary = Color.Black,
    background = CanvasRootBlack,
    onBackground = TextPrimary,
    surface = ObsidianPurple,
    onSurface = TextPrimary,
    surfaceVariant = ObsidianPurple,
    outline = BorderPurple
)
