// Loads Google Fonts as TTF for next/og (it can't read woff2). Falls back to the built-in font offline.

type OgFont = { name: string; data: ArrayBuffer; style: "normal" | "italic"; weight: 400 | 600 }

async function load(name: string, query: string, weight: 400 | 600): Promise<OgFont[]> {
  const css = await fetch(`https://fonts.googleapis.com/css2?family=${query}`).then((r) => r.text())
  const faces = [...css.matchAll(/font-style:\s*(normal|italic);[\s\S]*?src:\s*url\(([^)]+)\)/g)]
  return Promise.all(
    faces.map(async ([, style, url]) => ({
      name,
      data: await fetch(url).then((r) => r.arrayBuffer()),
      style: style as "normal" | "italic",
      weight,
    })),
  )
}

/** "Display" = the serif (normal + italic), "Sport" = the condensed face, matching app/fonts.ts. */
export async function loadOgFonts(): Promise<OgFont[]> {
  try {
    const [display, sport] = await Promise.all([
      load("Display", "Instrument+Serif:ital@0;1", 400),
      load("Sport", "Barlow+Condensed:wght@600", 600),
    ])
    return [...display, ...sport]
  } catch {
    return []
  }
}
