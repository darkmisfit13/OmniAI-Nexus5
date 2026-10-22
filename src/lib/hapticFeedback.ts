/**
 * 3D Keyboard Tactile Haptic Vibration Engine
 * Uses the Web Navigator.vibrate API with calibrated pattern arrays
 * scaled across user-adjustable intensity levels (1 - 10).
 */

export function getHapticPattern(
  level: number, 
  type: 'tap' | 'enter' | 'delete' | 'space' | 'pulse' = 'tap'
): number | number[] {
  // Clamp level strictly between 1 and 10
  const lvl = Math.max(1, Math.min(10, Math.round(level)));

  if (type === 'enter') {
    // Decisive dual-tone confirmation
    return [Math.round(8 + lvl * 1.5), 18, Math.round(12 + lvl * 2.2)];
  }

  if (type === 'delete') {
    // Crisp retraction tick
    return Math.round(6 + lvl * 1.8);
  }

  if (type === 'space') {
    // Resonant bar strike
    return Math.round(8 + lvl * 2.0);
  }

  if (type === 'pulse') {
    // Comprehensive diagnostic wave
    return [Math.round(8 + lvl), 15, Math.round(12 + lvl * 2), 15, Math.round(10 + lvl)];
  }

  // Standard Key Tap (Levels 1 to 10)
  switch (lvl) {
    case 1:
      return 5; // Ultra-crisp minimal tick
    case 2:
      return 8; // Featherlight
    case 3:
      return 11; // Soft click
    case 4:
      return 15; // Natural tactile
    case 5:
      return 18; // Balanced mechanical
    case 6:
      return 22; // Firm response
    case 7:
      return 27; // Strong pulse
    case 8:
      return [12, 10, 16]; // Textured double-pulse
    case 9:
      return [16, 12, 22]; // Heavy dual impulse
    case 10:
    default:
      return [20, 10, 26, 10, 20]; // Maximum volumetric wave
  }
}

export function triggerTactileHaptic(
  level?: number, 
  type: 'tap' | 'enter' | 'delete' | 'space' | 'pulse' = 'tap'
) {
  try {
    if (typeof window === 'undefined' || typeof navigator === 'undefined' || !('vibrate' in navigator)) {
      return;
    }
    const enabled = localStorage.getItem('omni_haptic_enabled') !== 'false';
    if (!enabled) return;

    const currentLevel = level ?? parseInt(localStorage.getItem('omni_haptic_level') || '6', 10);
    const pattern = getHapticPattern(currentLevel, type);
    navigator.vibrate(pattern);
  } catch {
    // Vibrate suppressed or unpermitted
  }
}
