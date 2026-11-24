# MiniMail website

The one-page site for [MiniMail](https://github.com/nicolasakf/MiniMail). Every scene is drawn with the app's own
styles and parts, not screenshots, and plays a short loop of the real UI with invented mail.

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # static files in dist/
```

- `npm run sync-ui` copies the app's look from `../MiniMail` (or `MINIMAIL_DIR`) into `src/minimail/`: the theme tokens and
  plastic classes, the grain, the Tailwind theme, the button and key styles, the provider marks and the icons. Run it when
  the app's look changes; do not edit `src/minimail/` by hand.
- `src/scenes/` holds one file per section, `src/parts/` the copies of the app's rows, cards, window and header.
- All names, subjects and addresses in `src/lib/demo.ts` are made up.
- Scenes pause off screen and show their last frame with reduced motion. In development, `?freeze=<step>` holds every scene on one step.
