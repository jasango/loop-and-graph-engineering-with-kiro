import { createElement } from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

function AppPlaceholder() {
  return createElement('main', null, createElement('h1', null, 'Kahoot! de Kiro'))
}

describe('application scaffold', () => {
  it('renders the application title', () => {
    render(createElement(AppPlaceholder))
    expect(screen.getByRole('heading', { name: 'Kahoot! de Kiro' })).toBeTruthy()
  })
})
