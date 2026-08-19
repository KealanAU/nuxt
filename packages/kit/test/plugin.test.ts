import { describe, expect, it } from 'vitest'
import { Diagnostic } from 'nostics'
import type { NuxtPlugin } from '@nuxt/schema'

import { normalizePlugin } from '../src/plugin.ts'

describe('normalizePlugin', () => {
  it('throws when src is missing', () => {
    let caught: unknown
    try {
      // @ts-expect-error intentionally invalid plugin
      normalizePlugin({ mode: 'all' })
    } catch (err) {
      caught = err
    }
    expect(caught).toBeInstanceOf(Diagnostic)
    expect((caught as Diagnostic).name).toBe('NUXT_B2011')
    expect((caught as Diagnostic).fix).toContain('addPlugin()')
  })

  // https://github.com/nuxt/nuxt/issues/11025
  const cases: Array<[src: string, dev: boolean | undefined, mode: NuxtPlugin['mode']]> = [
    ['plugins/a11y.dev.ts', true, 'all'],
    ['plugins/a11y.dev.client.ts', true, 'client'],
    ['plugins/a11y.dev.server.ts', true, 'server'],
    ['plugins/a11y.ts', undefined, 'all'],
    ['plugins/a11y.client.ts', undefined, 'client'],
    // `.dev` is only a suffix, not a substring
    ['plugins/dev-tools.ts', undefined, 'all'],
    ['plugins/a11y.development.ts', undefined, 'all'],
  ]
  it.each(cases)('infers env and mode from %s', (src, dev, mode) => {
    const plugin = normalizePlugin(src)
    expect(plugin.dev).toBe(dev)
    expect(plugin.mode).toBe(mode)
  })

  it('does not override an explicit `dev`', () => {
    expect(normalizePlugin({ src: 'plugins/a11y.dev.ts', dev: false }).dev).toBe(false)
  })
})
