# Desktop Layout Fix - Game World Full Width

## Issue
The game world (floor plan) had a fixed width of 600px on desktop, leaving unused space between the sidebars.

## Changes Made

### 1. Game World Sizing (style.css)
- Changed `#game-world` width from `600px` to `100%`
- Changed max-width from `600px` to `100%`
- Kept height at `600px` for consistency

### 2. Main Game Area (style.css)
- Added `min-width: 0` to `.main-game-area` to allow proper flex shrinking
- This ensures the flex container can properly size the game world

### 3. Desktop-Specific Layout (style.css)
Added a new media query for desktop screens (min-width: 1025px):
- `flex-wrap: nowrap` on `.game-container` to prevent wrapping
- Explicit ordering:
  - Ultimate Reward Banner: `order: -1` (full width, first)
  - Left Sidebar: `order: 0` (second)
  - Main Game Area: `order: 1` (third, takes remaining space with `flex: 1`)
  - Right Sidebar: `order: 2` (fourth)
- Set `flex-shrink: 0` on both sidebars to maintain their fixed widths (260px left, 280px right)
- Set `flex: 1` on main game area to fill all remaining horizontal space

## Result
On desktop (screens wider than 1024px):
- Ultimate Reward Banner spans the full width at the top
- Below it, the layout is: [Left Sidebar (260px)] [Game World (flexible)] [Right Sidebar (280px)]
- Game world now expands to fill all available space between the sidebars
- Responsive design for mobile/tablet remains unchanged

## Layout Flow
```
┌─────────────────────────────────────────────────────┐
│        Ultimate Reward Banner (100% width)          │
├──────────┬──────────────────────────┬───────────────┤
│   Left   │      Game World          │     Right     │
│ Sidebar  │  (fills remaining space) │   Sidebar     │
│  260px   │                          │    280px      │
└──────────┴──────────────────────────┴───────────────┘
```
