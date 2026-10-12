// Node typings are intentionally not a project dependency; Vitest supplies these APIs at runtime.
// @ts-expect-error Node types are not required by the browser application.
import { readFileSync } from 'node:fs'
// @ts-expect-error Node types are not required by the browser application.
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

declare const process: { cwd: () => string }

const stylesDir = resolve(process.cwd(), 'src/styles')
const readStyle = (name: string) => readFileSync(resolve(stylesDir, name), 'utf8')

describe('global visual theme and accessibility styles', () => {
  it('defines the visual tokens and semantic timer colors', () => {
    const theme = readStyle('theme.css')

    expect(theme).toContain('--color-primary:')
    expect(theme).toContain('--color-success:')
    expect(theme).toContain('--color-warning:')
    expect(theme).toContain('--color-danger:')
    expect(theme).toContain('--color-focus:')
    expect(theme).toContain('--content-max-width:')
  })

  it('provides a responsive shell and imports the shared layers', () => {
    const global = readStyle('global.css')

    expect(global).toContain("@import './theme.css';")
    expect(global).toContain("@import './accessibility.css';")
    expect(global).toContain('.app-shell')
    expect(global).toContain('@media (max-width: 600px)')
    expect(global).toContain('min-height: 100vh')
  })

  it('supports keyboard focus, reduced motion, and high contrast modes', () => {
    const accessibility = readStyle('accessibility.css')

    expect(accessibility).toContain(':focus-visible')
    expect(accessibility).toContain('var(--color-focus)')
    expect(accessibility).toContain('@media (prefers-reduced-motion: reduce)')
    expect(accessibility).toContain('@media (forced-colors: active)')
    expect(accessibility).toContain('.visually-hidden')
  })
})
