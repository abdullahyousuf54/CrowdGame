# Live Leaderboard Visual Guide

## 🖼️ Layout Overview

```
┌────────────────────────────────────────────────────────────────────┐
│                    MAIN SCREEN (Big Screen)                         │
├────────────────────────────────────────┬───────────────────────────┤
│                                        │                           │
│         GAME CONTENT AREA              │   LIVE LEADERBOARD        │
│                                        │                           │
│  ┌──────────────────────────────┐     │  ┌─────────────────────┐ │
│  │  HUD: Activity | Progress    │     │  │  🏆 LIVE RANKINGS   │ │
│  └──────────────────────────────┘     │  │  REAL-TIME SCORES   │ │
│                                        │  └─────────────────────┘ │
│  ┌──────────────────────────────┐     │                           │
│  │                              │     │  ┌─────────────────────┐ │
│  │                              │     │  │ 🥇 [Avatar] Alex    │ │
│  │      PUZZLE CANVAS           │     │  │        300 PTS      │ │
│  │      (1200x800)              │     │  ├─────────────────────┤ │
│  │                              │     │  │ 🥈 [Avatar] Sarah   │ │
│  │                              │     │  │        250 PTS      │ │
│  │                              │     │  ├─────────────────────┤ │
│  └──────────────────────────────┘     │  │ 🥉 [Avatar] Mike    │ │
│                                        │  │        200 PTS      │ │
│  ┌──────────────────────────────┐     │  ├─────────────────────┤ │
│  │  Activity Ticker              │     │  │ #4 [Avatar] Jane    │ │
│  └──────────────────────────────┘     │  │        150 PTS      │ │
│                                        │  ├─────────────────────┤ │
│                                        │  │ #5 [Avatar] Bob     │ │
│                                        │  │        100 PTS      │ │
│                                        │  └─────────────────────┘ │
└────────────────────────────────────────┴───────────────────────────┘
```

---

## 🎨 Leaderboard Item Anatomy

### Standard Item (Rank 4+)
```
┌──────────────────────────────────────┐
│  ┌────┐  ┌────┐  ┌──────────────┐   │
│  │ #4 │  │ 👤 │  │ PLAYER NAME  │   │
│  └────┘  └────┘  │  150 PTS     │   │
│  Rank    Avatar  └──────────────┘   │
│  Badge           Player Info        │
└──────────────────────────────────────┘
```

### First Place
```
┌──────────────────────────────────────┐
│  ┌────┐  ┌────┐  ┌──────────────┐   │
│  │ 🥇 │  │ 👤 │  │ CHAMPION     │   │  ← Pulsing glow
│  └────┘  └────┘  │  500 PTS     │   │  ← Gold border
│  Gold    Avatar  └──────────────┘   │  ← Larger badge
└──────────────────────────────────────┘
```

### Second Place
```
┌──────────────────────────────────────┐
│  ┌────┐  ┌────┐  ┌──────────────┐   │
│  │ 🥈 │  │ 👤 │  │ RUNNER-UP    │   │  ← Silver glow
│  └────┘  └────┘  │  400 PTS     │   │  ← Silver border
└──────────────────────────────────────┘
```

### Third Place
```
┌──────────────────────────────────────┐
│  ┌────┐  ┌────┐  ┌──────────────┐   │
│  │ 🥉 │  │ 👤 │  │ THIRD PLACE  │   │  ← Bronze glow
│  └────┘  └────┘  │  300 PTS     │   │  ← Bronze border
└──────────────────────────────────────┘
```

---

## 🎭 Component Details

### Rank Badge
```
┌──────────┐
│          │  Size: 40x40px
│    #1    │  Font: Share Tech Mono
│          │  Background: Semi-transparent
└──────────┘  Border: 2px solid

Top 3 Variations:
🥇 Gold   - Yellow glow, pulsing animation
🥈 Silver - Silver/gray glow, static
🥉 Bronze - Bronze glow, static
```

### Avatar
```
┌──────────┐
│          │  Size: 50x50px
│   👤     │  Shape: Circular
│          │  Border: 2px cyan glow
└──────────┘  Source: DiceBear API

Fallback (no avatar):
┌──────────┐
│          │  Colored circle
│    A     │  Player's initial
│          │  Player's color
└──────────┘
```

### Player Info
```
┌─────────────────┐
│ PLAYER NAME     │  Font: Share Tech Mono (16px)
│                 │  Color: Player's assigned color
│ 150 PTS         │  Font: Share Tech Mono (18px)
└─────────────────┘  Glow: Pink shadow
```

---

## 🎬 Animations

### Rank Change Animation
```
Timeline:
0ms   → Normal position
150ms → Slide left (-8px)
450ms → Slide right (+8px)
600ms → Return to normal

Visual:
[Item]  →  [  Item]  →  [Item  ]  →  [Item]
Normal    Left slide   Right slide   Restored

+ Background flash (cyan)
+ Border glow increase
```

### First Place Pulse
```
Continuous loop (2 seconds):

Scale & Glow:
  0%   → scale(1)   opacity(1)
  50%  → scale(1.05) opacity(0.8)
  100% → scale(1)   opacity(1)

Effect:
[Badge] → [Badge+] → [Badge]
Normal    Larger     Normal
```

### Score Update
```
When score changes:
  Old: 100 PTS
    ↓  (fade out 200ms)
  New: 200 PTS
    ↓  (fade in 200ms)

No animation on actual number - just instant update
```

---

## 🌈 Color Palette

### Background & Panels
```
Background:       #060313 (very dark purple)
Panel BG:         rgba(11, 6, 28, 0.85) (dark purple, 85% opacity)
Border:           rgba(0, 243, 255, 0.3) (cyan, 30% opacity)
```

### Rank Badge Colors
```
Default:          #94a3b8 (gray-blue)
Gold (1st):       #ffb800 (bright yellow)
Silver (2nd):     #c0c0c0 (silver)
Bronze (3rd):     #cd7f32 (bronze)
```

### Text Colors
```
Leaderboard Title:  #00f3ff (cyan)
Subtitle:           #64748b (muted blue-gray)
Player Names:       [Player's assigned color] (varies)
Scores:             #ffffff (white) with pink glow
```

### Glow Effects
```
Cyan Glow:  0 0 10px rgba(0, 243, 255, 0.6)
Pink Glow:  0 0 8px rgba(255, 0, 127, 0.6)
Gold Glow:  0 0 15px rgba(255, 184, 0, 0.4)
```

---

## 📐 Dimensions

### Leaderboard Panel
```
Width:            350px (300px on <1600px screens)
Max Height:       calc(100vh - 40px)
Padding:          20px
Border Radius:    16px
Border Width:     2px
```

### Leaderboard Item
```
Height:           auto (min 64px with padding)
Padding:          12px
Margin Bottom:    10px
Border Radius:    8px
Gap:              12px (between elements)
```

### Rank Badge
```
Width:            40px
Height:           40px
Border Radius:    8px
Border Width:     2px
Font Size:        18px (default)
Font Size:        24px (1st place)
Font Size:        22px (2nd place)
Font Size:        20px (3rd place)
```

### Avatar
```
Width:            50px
Height:           50px
Border Radius:    50% (circular)
Border Width:     2px
```

### Text Sizes
```
Title:            24px (Share Tech Mono)
Subtitle:         12px (Share Tech Mono)
Player Name:      16px (Share Tech Mono)
Score:            18px (Share Tech Mono)
```

---

## 🎯 Responsive Breakpoints

### Standard Screens (1600px+)
```
Leaderboard Width:  350px
Player Name:        16px
Score:              18px
```

### Smaller Screens (<1600px)
```
Leaderboard Width:  300px
Player Name:        14px
Score:              16px
```

### Canvas Adaptation
```
Puzzle canvas scales to fit remaining space:
max-width: 100%
max-height: 100%
Maintains aspect ratio
```

---

## 🔄 Update Flow Visualization

### Initial Render (Game Start)
```
1. Activity starts
   ↓
2. Participants array received
   ↓
3. Populate participants Map
   ↓
4. Call updateLiveLeaderboard()
   ↓
5. Render all players (score: 0)
   ↓
6. Display: Everyone at bottom with 0 points
```

### Score Update (Piece Placed)
```
1. Player places piece correctly
   ↓
2. Socket: piece-placed event
   ↓
3. Update participant.score in Map
   ↓
4. Schedule debounced update (500ms)
   ↓
5. After 500ms: updateLiveLeaderboard()
   ↓
6. Sort participants by score
   ↓
7. Detect rank changes
   ↓
8. Re-render leaderboard
   ↓
9. Apply rank-changed animation if moved
```

### Multiple Updates (Rapid Fire)
```
Player A scores → Schedule update (500ms)
Player B scores → Cancel previous, schedule new (500ms)
Player C scores → Cancel previous, schedule new (500ms)
(500ms passes)
Single render → All 3 scores updated at once
```

---

## 🎨 Visual States

### Normal State
```
┌──────────────────────────────────────┐
│  #5  [Avatar]  PLAYER     100 PTS    │  ← Muted colors
└──────────────────────────────────────┘  ← Subtle border
```

### Rank Changed State
```
┌══════════════════════════════════════┐
│  #3  [Avatar]  PLAYER     300 PTS    │  ← Bright cyan bg
└══════════════════════════════════════┘  ← Glowing border
     ← Slide animation playing
```

### First Place State
```
┌══════════════════════════════════════┐
│  🥇  [Avatar]  CHAMPION   500 PTS    │  ← Gold glow
└══════════════════════════════════════┘  ← Pulsing
     ← Continuously animated
```

### Empty State (No Players)
```
┌──────────────────────────────────────┐
│  🏆 LIVE RANKINGS                     │
│  REAL-TIME SCORES                    │
├──────────────────────────────────────┤
│                                      │
│  (empty - waiting for players)       │
│                                      │
└──────────────────────────────────────┘
```

---

## 📱 Scrolling Behavior

### Few Players (< 10)
```
┌─────────────────────┐
│  🏆 LIVE RANKINGS   │
├─────────────────────┤
│  🥇 Player 1        │
│  🥈 Player 2        │
│  🥉 Player 3        │
│  #4 Player 4        │
│  #5 Player 5        │
│                     │  ← No scroll needed
│                     │
└─────────────────────┘
```

### Many Players (10+)
```
┌─────────────────────┐
│  🏆 LIVE RANKINGS   │
├─────────────────────┤
│  🥇 Player 1        │ ▲
│  🥈 Player 2        │ │ Scrollable
│  🥉 Player 3        │ │ area
│  #4 Player 4        │ │
│  #5 Player 5        │ │
│  #6 Player 6        │ │
│  #7 Player 7        │ │
└─────────────────────┘ ▼
   └──┘ ← Scrollbar (6px)
```

---

## 🎭 Example Scenarios

### Scenario: Player Rises to #1
```
Before:
┌──────────────────────┐
│ 🥇 Alice     500 PTS │
│ 🥈 Bob       450 PTS │ ← Bob about to score
│ 🥉 Charlie   300 PTS │
└──────────────────────┘

Bob scores 100 points (now 550):

After:
┌══════════════════════┐
│ 🥇 Bob       550 PTS │ ← New leader! (rank-changed animation)
├──────────────────────┤
│ 🥈 Alice     500 PTS │
│ 🥉 Charlie   300 PTS │
└──────────────────────┘

Bob's row slides left-right and glows cyan
Alice's row moves down (smooth transition)
```

### Scenario: Tied Scores
```
┌──────────────────────┐
│ 🥇 Alice     300 PTS │
│ 🥈 Bob       300 PTS │ ← Same score
│ 🥉 Charlie   200 PTS │
└──────────────────────┘

Tie-breaking:
- First to reach score = higher rank
- Original join order preserved
```

---

## 💡 Design Philosophy

### Spectator-First
- **Large text**: Readable from 20+ feet away
- **High contrast**: Dark bg, bright text
- **Clear hierarchy**: Rank → Avatar → Name → Score

### Non-Intrusive
- **Right side placement**: Doesn't block game
- **Consistent size**: Doesn't expand/collapse
- **Subtle animations**: Noticeable but not distracting

### Real-Time Feel
- **Instant updates**: <1 second from score to display
- **Smooth transitions**: No jarring jumps
- **Visual feedback**: Animations confirm changes

### Professional Appearance
- **Game show aesthetic**: Polished, broadcast-ready
- **Consistent branding**: Matches CrowdPlay theme
- **Attention to detail**: Rounded corners, glows, shadows

---

## 🎉 Summary

The live leaderboard provides a polished, real-time spectator experience with:
- ✅ Clear visual hierarchy
- ✅ Smooth animations
- ✅ High readability
- ✅ Professional appearance
- ✅ Non-intrusive placement
- ✅ Real-time updates

Perfect for projected displays, live events, and competitive gameplay!
