# ui_component.md — StockFramework

## Purpose
Build new UI components that match the existing design system.

## Design System

### Colors (CSS variables)
```css
--bg:#07070f       /* page background */
--bg2:#0d0d1e      /* card background */
--bg3:#13132a      /* input / hover background */
--bg4:#1a1a35      /* deep inset / track */
--border:#ffffff10
--border2:#ffffff1e
--border3:#ffffff30
--text:#e8e8f8
--text2:#9090b0
--text3:#5a5a80
--gold:#d4a843     /* primary accent */
--gold2:#f0c870
--blue:#4d9de0
--green:#4cbb8a
--red:#e05555
--purple:#9b72cf
--radius:14px
--radius-sm:9px
```

### Typography
- Body: `Space Grotesk, sans-serif`
- Monospace / labels / data: `Space Mono, monospace`
- Eyebrow labels: `font-size:9-10px; letter-spacing:2px; color:var(--text3); font-family:'Space Mono'`

### Component Patterns
- **Cards**: `background:var(--bg2); border:1px solid var(--border2); border-radius:var(--radius)`
- **Accent top border**: `position:absolute; top:0; left:0; right:0; height:3px; background:<color>`
- **Loading spinner**: `border:2px solid var(--bg4); border-top-color:var(--gold); border-radius:50%; animation:spin`
- **Badges**: small pill with `background:rgba(color,.1); border:1px solid rgba(color,.3); font-family:'Space Mono'`
- **Buttons primary**: `background:linear-gradient(135deg,var(--gold),var(--gold2)); color:#07070f; font-weight:700`
- **Buttons secondary**: `background:var(--bg3); border:1px solid var(--border2); color:var(--text2)`

### Animations
- `fadeUp`: opacity 0→1 + translateY 10px→0 over 0.3s
- `spin`: rotate 360deg linear infinite
- `secLoad`: loading bar sweep animation

## Rules
- Always include loading state, empty state, and error state
- Use `escH()` for any dynamic string placed in innerHTML
- New modals follow the `.modal-overlay` / `.modal-box` pattern
- Dropdown menus follow the `.ac-dropdown` pattern
