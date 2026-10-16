import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('should_render_brand_name_when_mounted', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Bloom' })).toBeInTheDocument()
  })
})
