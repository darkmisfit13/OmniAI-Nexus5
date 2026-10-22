import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  Sparkles, 
  Bot, 
  Mic, 
  Square, 
  Play, 
  Check, 
  Save, 
  Sliders, 
  Volume2, 
  Flame, 
  Smile, 
  Zap, 
  RotateCcw, 
  UserCheck, 
  ChevronRight, 
  X,
  Radio,
  Activity,
  ShieldCheck,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Sun,
  Moon,
  Briefcase
} from 'lucide-react';
import { HoloOrb } from './HoloOrb';

export interface CalibrationQuestion {
  id: string;
  category: string;
  question: string;
  options: Array<{
    id: string;
    label: string;
    example: string;
  }>;
}

export const CALIBRATION_QUESTIONS: CalibrationQuestion[] = [
  {
    id: 'pacing',
    category: 'Length & Structure',
    question: 'How do you typically structure your text responses?',
    options: [
      { id: 'bullet', label: 'Crisp & Punchy', example: '1-2 short sentences or decisive bullet points. Zero fluff.' },
      { id: 'conversational', label: 'Balanced & Natural', example: 'Friendly paragraph with contextual nuance and warm transitions.' },
      { id: 'minimalist', label: 'Ultra Minimalist', example: '"On it." / "Done." / "Sounds good."' }
    ]
  },
  {
    id: 'humor',
    category: 'Wit & Tone',
    question: 'What is your humor and sarcasm level?',
    options: [
      { id: 'dry', label: 'Dry & Fast Wit', example: 'Deadpan humor, sharp observation, playful confidence.' },
      { id: 'raw', label: 'Unvarnished Realist', example: 'Straight shooter. Calls things as they are without sugarcoating.' },
      { id: 'warm', label: 'Warm & Uplifting', example: 'Encouraging, supportive, positive energy.' },
      { id: 'none', label: 'Strictly Professional', example: 'Corporate-grade milestone reporting with zero sarcasm.' }
    ]
  },
  {
    id: 'greetings',
    category: 'Salutations & Sign-offs',
    question: 'How do you open and close your messages?',
    options: [
      { id: 'no_greeting', label: 'Direct Entry (No greeting)', example: 'Jumps straight into the core point.' },
      { id: 'casual', label: 'Casual ("Hey", "Cheers")', example: '"Hey Alex," / "Talk soon,"' },
      { id: 'formal', label: 'Formal ("Hi [Name], Best")', example: '"Hi Sarah, Hope you are well. Best,"' }
    ]
  },
  {
    id: 'slang',
    category: 'Vocabulary Style',
    question: 'What vocabulary style feels most authentic to you?',
    options: [
      { id: 'tech_nocturnal', label: 'Modern Tech & Midnight Studio', example: 'High signal, milestone-driven, crisp contemporary phrasing.' },
      { id: 'business_executive', label: 'Executive Clarity', example: 'Deliverables, ETA, accountability, metrics.' },
      { id: 'casual_street', label: 'Casual & Relaxed', example: 'Laid back, relatable, conversational lowercase.' }
    ]
  },
  {
    id: 'emoji',
    category: 'Emoji Frequency',
    question: 'What is your emoji usage frequency?',
    options: [
      { id: 'subtle', label: 'Subtle Accent', example: '1-2 purposeful emojis max (e.g. ⚡, 🚀, 👍)' },
      { id: 'zero', label: 'Zero Emojis', example: 'Pure text only. Absolutely no icons.' },
      { id: 'expressive', label: 'Expressive', example: 'Frequent reaction emojis (🔥, 💀, 😂, 🙌)' }
    ]
  }
];

export type ScheduleTimeSlot = 'morning' | 'afternoon' | 'evening';

export const TIME_SLOT_DEFS: Array<{
  id: ScheduleTimeSlot;
  label: string;
  subLabel: string;
  hours: string;
  icon: string;
}> = [
  { id: 'morning', label: 'Morning', subLabel: '8am - 12pm', hours: '08:00 - 12:00', icon: '🌅' },
  { id: 'afternoon', label: 'Afternoon', subLabel: '12pm - 5pm', hours: '12:00 - 17:00', icon: '☀️' },
  { id: 'evening', label: 'Evening', subLabel: '5pm - 10pm', hours: '17:00 - 22:00', icon: '🌙' },
];

export const DEFAULT_QUICK_GRID: Record<string, ScheduleTimeSlot[]> = {
  Mon: ['morning', 'afternoon'],
  Tue: ['morning', 'afternoon'],
  Wed: ['morning', 'afternoon'],
  Thu: ['morning', 'afternoon'],
  Fri: ['morning', 'afternoon'],
  Sat: ['afternoon'],
  Sun: ['afternoon'],
};

export interface AutoModeScheduleConfig {
  enabled: boolean;
  preset: 'office_hours' | 'deep_work' | 'night_watch' | 'weekend' | 'always_on' | 'custom';
  presetLabel: string;
  startTime: string; // "09:00"
  endTime: string;   // "17:00"
  days: string[];    // ["Mon", "Tue", "Wed", "Thu", "Fri"]
  takeoverCalls: boolean;
  takeoverMessages: boolean;
  quickGrid?: Record<string, ScheduleTimeSlot[]>;
}

export const SCHEDULE_PRESETS: Array<{
  id: AutoModeScheduleConfig['preset'];
  label: string;
  hours: string;
  days: string[];
  startTime: string;
  endTime: string;
  description: string;
  icon: any;
}> = [
  {
    id: 'office_hours',
    label: 'Office Hours (9am-5pm)',
    hours: '09:00 - 17:00',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    startTime: '09:00',
    endTime: '17:00',
    description: 'Autonomous handling of work chats and Slack inquiries during the core business day.',
    icon: Briefcase
  },
  {
    id: 'deep_work',
    label: 'Deep Work (1pm-5pm)',
    hours: '13:00 - 17:00',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    startTime: '13:00',
    endTime: '17:00',
    description: 'Blocks notifications and deploys your clone while you build without interruption.',
    icon: Zap
  },
  {
    id: 'night_watch',
    label: 'Night Watch (10pm-6am)',
    hours: '22:00 - 06:00',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    startTime: '22:00',
    endTime: '06:00',
    description: 'Auto-pilot guards late night urgent pings while preserving nocturnal rest.',
    icon: Moon
  },
  {
    id: 'weekend',
    label: 'Weekend Shield (Sat-Sun)',
    hours: '09:00 - 21:00',
    days: ['Sat', 'Sun'],
    startTime: '09:00',
    endTime: '21:00',
    description: 'Politely defers work matters until Monday while fielding personal calls.',
    icon: Sun
  },
  {
    id: 'always_on',
    label: 'Always On (24/7)',
    hours: '00:00 - 23:59',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    startTime: '00:00',
    endTime: '23:59',
    description: 'Continuous 24/7 digital shadow autonomous takeover for maximum throughput.',
    icon: Flame
  },
  {
    id: 'custom',
    label: 'Custom Calendar Hours',
    hours: 'Custom range',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    startTime: '08:30',
    endTime: '18:30',
    description: 'Specify your bespoke hourly schedule and calendar day availability.',
    icon: Clock
  }
];

export const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export interface AutoModeScheduleSubComponentProps {
  schedule: AutoModeScheduleConfig;
  onChangeSchedule: (updated: AutoModeScheduleConfig) => void;
  isCurrentlyActive: boolean;
  isFlickering?: boolean;
}

export const AutoModeScheduleSubComponent: React.FC<AutoModeScheduleSubComponentProps> = ({
  schedule,
  onChangeSchedule,
  isCurrentlyActive,
  isFlickering = false,
}) => {
  const currentGrid = schedule.quickGrid || DEFAULT_QUICK_GRID;

  const handleSelectPreset = (presetId: AutoModeScheduleConfig['preset']) => {
    const found = SCHEDULE_PRESETS.find((p) => p.id === presetId);
    if (!found) return;
    const nextConfig: AutoModeScheduleConfig = {
      ...schedule,
      preset: presetId,
      presetLabel: found.label,
      startTime: found.startTime,
      endTime: found.endTime,
      days: found.days,
    };
    onChangeSchedule(nextConfig);
  };

  const handleToggleDay = (day: string) => {
    const nextDays = schedule.days.includes(day)
      ? schedule.days.filter((d) => d !== day)
      : [...schedule.days, day];
    onChangeSchedule({
      ...schedule,
      preset: 'custom',
      presetLabel: 'Custom Calendar Hours',
      days: nextDays
    });
  };

  // Toggle slot in the 7-day visual Quick Schedule grid
  const handleToggleQuickSlot = (day: string, slotId: ScheduleTimeSlot) => {
    const daySlots = currentGrid[day] || [];
    const isSlotActive = daySlots.includes(slotId);
    const updatedDaySlots = isSlotActive
      ? daySlots.filter((s) => s !== slotId)
      : [...daySlots, slotId];

    const updatedGrid: Record<string, ScheduleTimeSlot[]> = {
      ...currentGrid,
      [day]: updatedDaySlots,
    };

    // Calculate active days from quick grid
    const updatedDays = DAYS_OF_WEEK.filter((d) => (updatedGrid[d] && updatedGrid[d].length > 0));

    const updatedSchedule: AutoModeScheduleConfig = {
      ...schedule,
      preset: 'custom',
      presetLabel: 'Custom Quick Schedule Grid',
      days: updatedDays.length > 0 ? updatedDays : schedule.days,
      quickGrid: updatedGrid,
    };

    onChangeSchedule(updatedSchedule);
  };

  const handleApplyAllWorkdays = () => {
    const updatedGrid: Record<string, ScheduleTimeSlot[]> = {
      ...currentGrid,
      Mon: ['morning', 'afternoon'],
      Tue: ['morning', 'afternoon'],
      Wed: ['morning', 'afternoon'],
      Thu: ['morning', 'afternoon'],
      Fri: ['morning', 'afternoon'],
      Sat: [],
      Sun: [],
    };
    onChangeSchedule({
      ...schedule,
      preset: 'office_hours',
      presetLabel: 'Office Hours (9am-5pm)',
      startTime: '09:00',
      endTime: '17:00',
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      quickGrid: updatedGrid,
    });
  };

  const handleApply247Shield = () => {
    const updatedGrid: Record<string, ScheduleTimeSlot[]> = {};
    DAYS_OF_WEEK.forEach((d) => {
      updatedGrid[d] = ['morning', 'afternoon', 'evening'];
    });
    onChangeSchedule({
      ...schedule,
      preset: 'always_on',
      presetLabel: 'Always On (24/7)',
      startTime: '00:00',
      endTime: '23:59',
      days: [...DAYS_OF_WEEK],
      quickGrid: updatedGrid,
    });
  };

  const handleClearAllSlots = () => {
    const updatedGrid: Record<string, ScheduleTimeSlot[]> = {};
    DAYS_OF_WEEK.forEach((d) => {
      updatedGrid[d] = [];
    });
    onChangeSchedule({
      ...schedule,
      preset: 'custom',
      presetLabel: 'Custom (All Cleared)',
      days: [],
      quickGrid: updatedGrid,
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* MASTER TOGGLE & LIVE STATUS BANNER WITH SUBTLE FLICKER-ON ANIMATION */}
      <div className={`p-4 rounded-2xl border transition-all ${
        isFlickering ? 'animate-flicker-on ring-2 ring-[#00ffcc]/70' : ''
      } ${
        schedule.enabled 
          ? isCurrentlyActive 
            ? 'bg-emerald-950/30 border-emerald-500/50 shadow-[0_0_18px_rgba(16,185,129,0.2)]'
            : 'bg-[#14121f] border-[#00ffcc]/50 shadow-[0_0_15px_rgba(0,255,204,0.15)]'
          : 'bg-[#14121f]/60 border-[#211d34]'
      }`}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold transition ${
              isFlickering ? 'animate-flicker-on' : ''
            } ${
              schedule.enabled
                ? isCurrentlyActive
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                  : 'bg-[#00ffcc]/15 text-[#00ffcc] border border-[#00ffcc]/40'
                : 'bg-[#211d34] text-[#9490ac]'
            }`}>
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-[#e8e6f2]">Autonomous Schedule Mode</h4>
                {schedule.enabled && (
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold flex items-center gap-1 transition-all ${
                    isFlickering ? 'animate-flicker-on ring-1 ring-[#00ffcc]' : ''
                  } ${
                    isCurrentlyActive
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse'
                      : 'bg-[#00ffcc]/20 text-[#00ffcc] border border-[#00ffcc]/40'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isCurrentlyActive ? 'bg-emerald-400 animate-ping' : 'bg-[#00ffcc]'}`} />
                    {isCurrentlyActive ? 'SCHEDULE ACTIVE NOW' : 'STANDBY (SCHEDULED)'}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#9490ac] mt-0.5">
                Automatically toggles Autonomous Autopilot ON during configured hours and OFF when outside.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onChangeSchedule({ ...schedule, enabled: !schedule.enabled })}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition flex items-center gap-2 ${
              schedule.enabled
                ? 'bg-[#00ffcc] hover:bg-[#00ffcc]/90 text-black shadow-md shadow-[#00ffcc]/30'
                : 'bg-[#211d34] hover:bg-[#211d34]/80 text-[#9490ac]'
            }`}
          >
            {schedule.enabled ? (
              <>
                <ToggleRight className="w-4 h-4 text-black" /> Enabled
              </>
            ) : (
              <>
                <ToggleLeft className="w-4 h-4 text-[#9490ac]" /> Disabled
              </>
            )}
          </button>
        </div>

        {/* Real-time status sub-note */}
        {schedule.enabled && (
          <div className={`mt-3 pt-3 border-t border-[#211d34] flex flex-wrap items-center justify-between text-[11px] text-[#e8e6f2] gap-2 ${
            isFlickering ? 'animate-flicker-on' : ''
          }`}>
            <span className="flex items-center gap-1.5 font-mono">
              <Clock className="w-3.5 h-3.5 text-[#00ffcc]" />
              Active Window: <strong className="text-[#00ffcc]">{schedule.startTime} – {schedule.endTime}</strong> ({schedule.days.join(', ') || 'None'})
            </span>
            <span className="text-[10px] text-[#9490ac] font-mono flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${isCurrentlyActive ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'}`} />
              Mode: {isCurrentlyActive ? '⚡ Autonomous Takeover Engaged' : '💤 Manual / Standby Mode'}
            </span>
          </div>
        )}
      </div>

      {/* QUICK SCHEDULE 7-DAY VISUAL WIDGET (MORNING, AFTERNOON, EVENING TIME-SLOTS) */}
      <div className="p-4 rounded-2xl bg-[#14121f] border border-[#211d34] space-y-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-xs font-mono text-[#00ffcc] uppercase tracking-wider font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#00ffcc]" /> Quick Schedule (7-Day Time Slot Matrix)
            </label>
            <p className="text-[10.5px] text-[#9490ac] mt-0.5">
              Tap any cell to toggle Autopilot for that time slot. Syncs directly to device storage.
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleApplyAllWorkdays}
              className="px-2 py-1 rounded-lg text-[10px] font-mono bg-[#0b0a14] border border-[#211d34] hover:border-[#00ffcc]/50 text-[#00ffcc] transition"
              title="Activate Mon-Fri Morning & Afternoon"
            >
              Workdays
            </button>
            <button
              type="button"
              onClick={handleApply247Shield}
              className="px-2 py-1 rounded-lg text-[10px] font-mono bg-[#0b0a14] border border-[#211d34] hover:border-[#00ffcc]/50 text-[#00ffcc] transition"
              title="Activate All 7 Days All Slots"
            >
              24/7 All
            </button>
            <button
              type="button"
              onClick={handleClearAllSlots}
              className="px-2 py-1 rounded-lg text-[10px] font-mono bg-[#0b0a14] border border-[#211d34] hover:border-red-500/50 text-[#9490ac] hover:text-red-400 transition"
              title="Clear All Slots"
            >
              Clear
            </button>
          </div>
        </div>

        {/* 7-DAY MATRIX GRID */}
        <div className="overflow-x-auto pb-1">
          <div className="min-w-[420px] space-y-1.5">
            {/* Days Header */}
            <div className="grid grid-cols-8 gap-1.5 items-center text-center font-mono text-[10.5px]">
              <div className="text-left text-[#9490ac] text-[9.5px] font-bold uppercase pl-1">Slot</div>
              {DAYS_OF_WEEK.map((day) => {
                const hasAnySlot = (currentGrid[day] && currentGrid[day].length > 0);
                return (
                  <div
                    key={day}
                    className={`py-1 rounded-md font-bold transition-all ${
                      hasAnySlot
                        ? 'text-[#00ffcc] bg-[#00ffcc]/10 border border-[#00ffcc]/30'
                        : 'text-[#9490ac] bg-[#0b0a14] border border-[#211d34]'
                    }`}
                  >
                    {day}
                  </div>
                );
              })}
            </div>

            {/* Time Slot Rows */}
            {TIME_SLOT_DEFS.map((slot) => (
              <div key={slot.id} className="grid grid-cols-8 gap-1.5 items-center">
                {/* Row Header */}
                <div className="flex flex-col pr-1">
                  <span className="text-[11px] font-bold text-[#e8e6f2] flex items-center gap-1">
                    <span>{slot.icon}</span>
                    <span className="truncate">{slot.label}</span>
                  </span>
                  <span className="text-[9px] font-mono text-[#9490ac]">{slot.subLabel}</span>
                </div>

                {/* Day Cells */}
                {DAYS_OF_WEEK.map((day) => {
                  const daySlots = currentGrid[day] || [];
                  const isActive = daySlots.includes(slot.id);

                  return (
                    <button
                      key={`${day}-${slot.id}`}
                      type="button"
                      onClick={() => handleToggleQuickSlot(day, slot.id)}
                      className={`h-9 rounded-xl border flex flex-col items-center justify-center transition-all active:scale-90 relative ${
                        isActive
                          ? 'bg-[#00ffcc]/20 border-[#00ffcc] text-[#00ffcc] shadow-[0_0_10px_rgba(0,255,204,0.25)]'
                          : 'bg-[#0b0a14] border-[#211d34] text-[#9490ac] hover:border-[#00ffcc]/40 hover:text-[#e8e6f2]'
                      }`}
                      title={`${day} ${slot.label} (${slot.hours}): ${isActive ? 'Active (Tap to disable)' : 'Inactive (Tap to activate)'}`}
                    >
                      {isActive ? (
                        <>
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span className="text-[7.5px] font-mono font-bold leading-none">ON</span>
                        </>
                      ) : (
                        <span className="text-[8px] font-mono text-[#9490ac]/60 leading-none">off</span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PRESET CALENDAR BLOCKS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-mono text-[#8b7fff] uppercase tracking-wider font-bold flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5" /> 2. Operating Calendar Presets
          </label>
          <span className="text-[11px] text-[#9490ac] font-mono">1-Tap Fast Setup</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {SCHEDULE_PRESETS.map((preset) => {
            const isSelected = schedule.preset === preset.id;
            const PresetIcon = preset.icon;

            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset.id)}
                className={`p-3 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#14121f] border-[#6c63ff] shadow-md shadow-[#6c63ff]/20'
                    : 'bg-[#14121f] border-[#211d34] hover:border-[#6c63ff]/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                        isSelected ? 'bg-[#6c63ff] text-white' : 'bg-[#211d34] text-[#9490ac]'
                      }`}>
                        <PresetIcon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold text-[#e8e6f2]">{preset.label}</span>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-[#8b7fff] shrink-0" />
                    )}
                  </div>
                  <p className="text-[10.5px] text-[#9490ac] leading-relaxed mb-2">
                    {preset.description}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono pt-2 border-t border-[#211d34] text-[#9490ac]">
                  <span>{preset.hours}</span>
                  <span className="text-[#8b7fff]">{preset.days.slice(0, 3).join(', ')}{preset.days.length > 3 ? '...' : ''}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* CUSTOM RANGE ADJUSTMENT & DAYS OF WEEK */}
      <div className="p-4 rounded-2xl bg-[#14121f] border border-[#211d34] space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-mono text-[#e8e6f2] font-bold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#8b7fff]" /> 2. Fine-Tune Daily Hours & Days
          </label>
          <span className="text-[10px] font-mono text-[#9490ac]">24h format</span>
        </div>

        {/* Start / End Time Inputs */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-2.5 rounded-xl bg-[#0b0a14] border border-[#211d34] flex flex-col gap-1">
            <span className="text-[10px] font-mono text-[#9490ac] uppercase">Auto-Turn ON Time</span>
            <input
              type="time"
              value={schedule.startTime}
              onChange={(e) => {
                onChangeSchedule({
                  ...schedule,
                  preset: 'custom',
                  presetLabel: 'Custom Calendar Hours',
                  startTime: e.target.value
                });
              }}
              className="bg-transparent text-sm font-mono font-bold text-[#e8e6f2] focus:outline-none"
            />
          </div>

          <div className="p-2.5 rounded-xl bg-[#0b0a14] border border-[#211d34] flex flex-col gap-1">
            <span className="text-[10px] font-mono text-[#9490ac] uppercase">Auto-Turn OFF Time</span>
            <input
              type="time"
              value={schedule.endTime}
              onChange={(e) => {
                onChangeSchedule({
                  ...schedule,
                  preset: 'custom',
                  presetLabel: 'Custom Calendar Hours',
                  endTime: e.target.value
                });
              }}
              className="bg-transparent text-sm font-mono font-bold text-[#e8e6f2] focus:outline-none"
            />
          </div>
        </div>

        {/* Day Selector Chips */}
        <div>
          <span className="text-[10.5px] font-mono text-[#9490ac] mb-2 block">Active Days of Week:</span>
          <div className="grid grid-cols-7 gap-1.5">
            {DAYS_OF_WEEK.map((day) => {
              const isDayActive = schedule.days.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleToggleDay(day)}
                  className={`py-2 rounded-xl text-xs font-mono font-bold transition text-center ${
                    isDayActive
                      ? 'bg-[#6c63ff] text-white shadow-sm shadow-[#6c63ff]/30 border border-[#8b7fff]'
                      : 'bg-[#0b0a14] text-[#9490ac] hover:text-[#e8e6f2] border border-[#211d34]'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        {/* Coverage Scope Options */}
        <div className="pt-2 border-t border-[#211d34] flex flex-col sm:flex-row gap-3">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-[#e8e6f2] select-none">
            <input
              type="checkbox"
              checked={schedule.takeoverMessages}
              onChange={(e) => onChangeSchedule({ ...schedule, takeoverMessages: e.target.checked })}
              className="w-4 h-4 rounded text-[#6c63ff] bg-[#0b0a14] border-[#211d34] focus:ring-0 accent-[#6c63ff]"
            />
            <span>Auto-Pilot Chat & Messages (Slack/WhatsApp/SMS)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-xs text-[#e8e6f2] select-none">
            <input
              type="checkbox"
              checked={schedule.takeoverCalls}
              onChange={(e) => onChangeSchedule({ ...schedule, takeoverCalls: e.target.checked })}
              className="w-4 h-4 rounded text-[#6c63ff] bg-[#0b0a14] border-[#211d34] focus:ring-0 accent-[#6c63ff]"
            />
            <span>Autonomous Voice Call Screening & Answering</span>
          </label>
        </div>
      </div>

    </div>
  );
};

export interface OmniNexusSetupModelProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveProfile?: (profile: any) => void;
}

/**
 * OmniNexusSetupModel (formerly OmniAutoPilotSetupModal)
 * Complete persona calibration, voice clone training, and autonomous auto-mode schedule.
 */
export const OmniNexusSetupModel: React.FC<OmniNexusSetupModelProps> = ({
  isOpen,
  onClose,
  onSaveProfile
}) => {
  const [activeStep, setActiveStep] = useState<'calibrate' | 'voice_clone' | 'schedule'>('calibrate');

  // Calibration answers
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('omni_persona_calibration');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return {
      pacing: 'bullet',
      humor: 'dry',
      greetings: 'no_greeting',
      slang: 'tech_nocturnal',
      emoji: 'subtle'
    };
  });

  // Voice Cloning State
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [clonedPitch, setClonedPitch] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      return parseFloat(localStorage.getItem('omni_clone_pitch') || '1.0');
    }
    return 1.0;
  });
  const [clonedRate, setClonedRate] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      return parseFloat(localStorage.getItem('omni_clone_rate') || '1.05');
    }
    return 1.05;
  });
  const [isTestingVoice, setIsTestingVoice] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isFlickering, setIsFlickering] = useState(false);

  // Auto-Mode Schedule State with Quick Schedule Grid support
  const [schedule, setSchedule] = useState<AutoModeScheduleConfig>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('omni_autopilot_schedule');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return {
      enabled: true,
      preset: 'office_hours',
      presetLabel: 'Office Hours (9am-5pm)',
      startTime: '09:00',
      endTime: '17:00',
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      takeoverCalls: true,
      takeoverMessages: true,
      quickGrid: DEFAULT_QUICK_GRID
    };
  });

  // Schedule change handler syncing to localStorage and triggering subtle flicker-on animation
  const handleScheduleChange = useCallback((updated: AutoModeScheduleConfig) => {
    setSchedule(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('omni_autopilot_schedule', JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('omni_schedule_changed', { detail: updated }));
    }
    // Trigger subtle flicker-on CSS animation for immediate visual confirmation
    setIsFlickering(true);
    setTimeout(() => {
      setIsFlickering(false);
    }, 550);
  }, []);

  // Check if current time falls within schedule (supporting both 7-day quickGrid and hour spans)
  const isCurrentlyActive = useMemo(() => {
    if (!schedule.enabled) return false;
    const now = new Date();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const currentDay = dayNames[now.getDay()];

    // Check Quick Schedule 7-day slot matrix first if configured
    if (schedule.quickGrid && schedule.quickGrid[currentDay]) {
      const activeSlots = schedule.quickGrid[currentDay];
      if (activeSlots.length === 0) return false;
      const currentHour = now.getHours();
      const inMorning = currentHour >= 8 && currentHour < 12 && activeSlots.includes('morning');
      const inAfternoon = currentHour >= 12 && currentHour < 17 && activeSlots.includes('afternoon');
      const inEvening = currentHour >= 17 && currentHour < 22 && activeSlots.includes('evening');
      if (inMorning || inAfternoon || inEvening) return true;
    }

    if (!schedule.days || !schedule.days.includes(currentDay)) return false;

    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const [startH, startM] = (schedule.startTime || '09:00').split(':').map(Number);
    const [endH, endM] = (schedule.endTime || '17:00').split(':').map(Number);
    const startTotal = (startH || 0) * 60 + (startM || 0);
    const endTotal = (endH || 0) * 60 + (endM || 0);

    if (startTotal <= endTotal) {
      return currentMinutes >= startTotal && currentMinutes <= endTotal;
    } else {
      // Overnight span (e.g. 22:00 to 06:00)
      return currentMinutes >= startTotal || currentMinutes <= endTotal;
    }
  }, [schedule]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  const testScript = "OmniAI, this is my natural speaking cadence and tone. Learn my pacing, take over my messages when I am busy, and always speak with unvarnished clarity.";

  const handleSelectAnswer = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  // Live Microphone Recording for Voice Sample Training
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(audioUrl);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);
    } catch (err) {
      console.warn('Microphone access denied or unsupported:', err);
      setIsRecording(true);
      timerRef.current = setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);
      setTimeout(() => {
        stopRecording();
      }, 5000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);
  };

  const handleTestClonedVoice = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsTestingVoice(true);
      const utterance = new SpeechSynthesisUtterance("Voice synthesis calibrated. This is your cloned autonomous voice profile ready for live call takeover.");
      utterance.pitch = clonedPitch;
      utterance.rate = clonedRate;
      utterance.onend = () => setIsTestingVoice(false);
      utterance.onerror = () => setIsTestingVoice(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setIsTestingVoice(true);
      setTimeout(() => setIsTestingVoice(false), 2000);
    }
  };

  const handleSaveAll = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('omni_persona_calibration', JSON.stringify(answers));
      localStorage.setItem('omni_clone_pitch', clonedPitch.toString());
      localStorage.setItem('omni_clone_rate', clonedRate.toString());
      localStorage.setItem('omni_autopilot_schedule', JSON.stringify(schedule));
      window.dispatchEvent(new CustomEvent('omni_schedule_changed', { detail: schedule }));
    }

    onSaveProfile?.({
      calibration: answers,
      voiceSettings: {
        pitch: clonedPitch,
        rate: clonedRate,
        sampleRecorded: Boolean(recordedAudioUrl),
      },
      schedule
    });

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#0b0a14]/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 font-sans select-none animate-in fade-in duration-200">
      
      <div className="w-full max-w-2xl bg-[#0b0a14] border border-[#211d34] rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* MODAL HEADER */}
        <div className="p-4 bg-[#14121f] border-b border-[#211d34] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#6c63ff]/20 border border-[#6c63ff]/50 flex items-center justify-center text-[#8b7fff] font-black shadow-lg shadow-[#6c63ff]/20">
              <Zap className="w-4 h-4 text-[#8b7fff] fill-current" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[#e8e6f2] flex items-center gap-2">
                OMNINEXUS AUTO-PILOT MODEL
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#14121f] text-[#8b7fff] border border-[#6c63ff]/40">
                  NEXUS 4.0
                </span>
              </h2>
              <p className="text-[11px] text-[#9490ac]">Configure personality calibration, voice synthesis, and calendar schedules</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-[#14121f] hover:bg-[#211d34] text-[#9490ac] hover:text-[#e8e6f2] transition"
            title="Close Setup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP TOGGLE SWITCHER */}
        <div className="p-2 bg-[#0b0a14] border-b border-[#211d34] flex items-center justify-center gap-1.5 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveStep('calibrate')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 shrink-0 ${
              activeStep === 'calibrate'
                ? 'bg-[#6c63ff] text-white shadow-md shadow-[#6c63ff]/40'
                : 'text-[#9490ac] hover:text-[#e8e6f2]'
            }`}
          >
            <Bot className="w-3.5 h-3.5" /> 1. Style Calibration
          </button>
          <button
            onClick={() => setActiveStep('voice_clone')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 shrink-0 ${
              activeStep === 'voice_clone'
                ? 'bg-[#6c63ff] text-white shadow-md shadow-[#6c63ff]/40'
                : 'text-[#9490ac] hover:text-[#e8e6f2]'
            }`}
          >
            <Mic className="w-3.5 h-3.5" /> 2. Voice Clone
          </button>
          <button
            onClick={() => setActiveStep('schedule')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 shrink-0 ${
              activeStep === 'schedule'
                ? 'bg-[#6c63ff] text-white shadow-md shadow-[#6c63ff]/40'
                : 'text-[#9490ac] hover:text-[#e8e6f2]'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" /> 3. Auto-Mode Schedule
          </button>
        </div>

        {/* MODAL SCROLLABLE BODY */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* STEP 1: CALIBRATION QUESTIONS */}
          {activeStep === 'calibrate' && (
            <div className="space-y-6">
              <div className="p-3.5 rounded-2xl bg-[#14121f] border border-[#6c63ff]/40 flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-[#8b7fff] shrink-0" />
                <p className="text-xs text-[#e8e6f2] leading-relaxed">
                  OmniAI analyzes these responses to calibrate its internal prompt cascade. When <strong>Auto-Pilot Mode</strong> answers messages for you, it sounds unequivocally like you.
                </p>
              </div>

              {CALIBRATION_QUESTIONS.map((q, qIndex) => (
                <div key={q.id} className="p-4 rounded-2xl bg-[#14121f] border border-[#211d34] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#8b7fff] uppercase tracking-wider font-bold">
                      Question {qIndex + 1} • {q.category}
                    </span>
                    <span className="text-xs text-[#8b7fff] font-mono">
                      {answers[q.id] ? '✓ Configured' : 'Required'}
                    </span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-[#e8e6f2] leading-snug">
                    {q.question}
                  </h3>

                  <div className="grid grid-cols-1 gap-2 pt-1">
                    {q.options.map((opt) => {
                      const isSelected = answers[q.id] === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleSelectAnswer(q.id, opt.id)}
                          className={`p-3 rounded-xl border text-left transition-all flex items-start justify-between ${
                            isSelected
                              ? 'bg-[#14121f] border-[#6c63ff] shadow-sm shadow-[#6c63ff]/20'
                              : 'bg-[#0b0a14] border-[#211d34] hover:border-[#6c63ff]/40'
                          }`}
                        >
                          <div className="space-y-0.5 pr-2">
                            <span className="text-xs font-bold text-[#e8e6f2] block">
                              {opt.label}
                            </span>
                            <span className="text-[11px] text-[#9490ac] font-mono italic block">
                              {opt.example}
                            </span>
                          </div>
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                            isSelected
                              ? 'border-[#8b7fff] bg-[#6c63ff] text-white'
                              : 'border-[#211d34] bg-[#14121f]'
                          }`}>
                            {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* STEP 2: VOICE CLONING TRAINING */}
          {activeStep === 'voice_clone' && (
            <div className="space-y-6">
              <div className="p-3.5 rounded-2xl bg-[#14121f] border border-[#6c63ff]/40 flex items-center gap-3">
                <Mic className="w-5 h-5 text-[#8b7fff] shrink-0" />
                <p className="text-xs text-[#e8e6f2] leading-relaxed">
                  Record a 10-second reference audio clip to synthesize your biometric voice signature for <strong>Real-Time Call Answering</strong> and verbal voice notes.
                </p>
              </div>

              {/* SCRIPT TO READ OUT LOUD */}
              <div className="p-4 rounded-2xl bg-[#14121f] border border-[#211d34] space-y-2">
                <span className="text-[10px] font-mono text-[#9490ac] uppercase tracking-wider block">
                  Reference Script (Read Aloud Clearly):
                </span>
                <p className="text-xs sm:text-sm text-[#e8e6f2] font-mono bg-[#0b0a14] p-3 rounded-xl border border-[#211d34] leading-relaxed italic">
                  "{testScript}"
                </p>
              </div>

              {/* RECORDER BUTTON & TIMER */}
              <div className="p-6 rounded-2xl bg-[#14121f] border border-[#211d34] flex flex-col items-center justify-center gap-4">
                <div className="relative">
                  <button
                    type="button"
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-xl ${
                      isRecording
                        ? 'bg-[#6c63ff] text-white animate-pulse shadow-[#6c63ff]/50'
                        : 'bg-[#211d34] hover:bg-[#211d34]/80 text-[#e8e6f2] border border-[#6c63ff]/40'
                    }`}
                  >
                    {isRecording ? <Square className="w-6 h-6 fill-current" /> : <Mic className="w-6 h-6" />}
                  </button>
                  {isRecording && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#8b7fff] animate-ping" />
                  )}
                </div>

                <div className="text-center">
                  <div className="text-lg font-mono font-bold text-[#e8e6f2]">
                    {isRecording ? `00:${recordingSeconds.toString().padStart(2, '0')}` : recordedAudioUrl ? 'Sample Recorded ✓' : 'Tap to Record'}
                  </div>
                  <span className="text-[11px] text-[#9490ac]">
                    {isRecording ? 'Speak clearly at normal conversational volume' : 'At least 5 seconds recommended'}
                  </span>
                </div>

                {recordedAudioUrl && !isRecording && (
                  <audio src={recordedAudioUrl} controls className="w-full max-w-sm mt-2 h-8" />
                )}
              </div>

              {/* SYNTHESIS TUNERS */}
              <div className="p-4 rounded-2xl bg-[#14121f] border border-[#211d34] space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#e8e6f2] flex items-center gap-1.5 font-mono">
                    <Sliders className="w-3.5 h-3.5 text-[#8b7fff]" /> Synthesizer Fine-Tuning
                  </h4>
                  <button
                    type="button"
                    onClick={handleTestClonedVoice}
                    disabled={isTestingVoice}
                    className="px-3 py-1 rounded-lg bg-[#211d34] hover:bg-[#211d34]/80 text-xs font-mono text-[#e8e6f2] flex items-center gap-1.5 transition"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-[#8b7fff]" />
                    {isTestingVoice ? 'Speaking...' : 'Test Cloned Voice'}
                  </button>
                </div>

                {/* Pitch Slider */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[#9490ac]">Pitch Modulator</span>
                    <span className="text-[#e8e6f2] font-bold">{clonedPitch.toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="1.5"
                    step="0.05"
                    value={clonedPitch}
                    onChange={(e) => setClonedPitch(parseFloat(e.target.value))}
                    className="w-full accent-[#6c63ff] h-1.5 bg-[#0b0a14] rounded-lg cursor-pointer"
                  />
                </div>

                {/* Cadence Rate Slider */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[#9490ac]">Cadence & Speech Speed</span>
                    <span className="text-[#e8e6f2] font-bold">{clonedRate.toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.75"
                    max="1.4"
                    step="0.05"
                    value={clonedRate}
                    onChange={(e) => setClonedRate(parseFloat(e.target.value))}
                    className="w-full accent-[#6c63ff] h-1.5 bg-[#0b0a14] rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: AUTO-MODE SCHEDULE SUB-COMPONENT */}
          {activeStep === 'schedule' && (
            <AutoModeScheduleSubComponent
              schedule={schedule}
              onChangeSchedule={handleScheduleChange}
              isCurrentlyActive={isCurrentlyActive}
              isFlickering={isFlickering}
            />
          )}

        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 bg-[#14121f] border-t border-[#211d34] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-[#9490ac]">
              {activeStep === 'calibrate' ? 'Step 1 of 3' : activeStep === 'voice_clone' ? 'Step 2 of 3' : 'Step 3 of 3'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {activeStep === 'calibrate' && (
              <button
                type="button"
                onClick={() => setActiveStep('voice_clone')}
                className="px-4 py-2 rounded-xl bg-[#211d34] hover:bg-[#211d34]/80 text-xs font-bold text-[#e8e6f2] transition flex items-center gap-1.5"
              >
                Next: Voice Clone <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}

            {activeStep === 'voice_clone' && (
              <button
                type="button"
                onClick={() => setActiveStep('schedule')}
                className="px-4 py-2 rounded-xl bg-[#211d34] hover:bg-[#211d34]/80 text-xs font-bold text-[#e8e6f2] transition flex items-center gap-1.5"
              >
                Next: Auto-Mode Schedule <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              type="button"
              onClick={handleSaveAll}
              className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition flex items-center gap-1.5 ${
                saveSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#6c63ff] hover:bg-[#8b7fff] text-white shadow-lg shadow-[#6c63ff]/30'
              }`}
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4" /> OmniNexus Calibrated!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save Model Profile
                </>
              )}
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};

// Backwards compatibility alias for any existing code
export const OmniAutoPilotSetupModal = OmniNexusSetupModel;
