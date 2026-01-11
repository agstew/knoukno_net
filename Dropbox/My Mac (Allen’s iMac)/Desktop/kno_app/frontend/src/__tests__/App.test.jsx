import { test, expect, beforeAll } from 'vitest'
import React from 'react'
import { render, screen } from '@testing-library/react'
import App from '../main'
import * as matchers from '@testing-library/jest-dom/matchers'

beforeAll(() => {
  expect.extend(matchers)
})
test('renders brand link', () => {
  render(<App />)
  const items = screen.getAllByText(/Kno U Kno/i)
  expect(items[0]).toBeInTheDocument()
})
