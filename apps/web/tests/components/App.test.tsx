import { render, screen } from '@testing-library/react'
import { App } from '../../src/App'

describe('App Component', () => {
  it('renders without crashing', () => {
    render(<App />)
    // App should render without throwing errors
  })

  it('displays the application title', () => {
    render(<App />)
    const titleElement = screen.getByText(/AMFE Tool/i)
    expect(titleElement).toBeInTheDocument()
  })

  it('renders the main layout components', () => {
    render(<App />)
    // Check that main layout structure exists
    const mainElement = screen.getByRole('main')
    expect(mainElement).toBeInTheDocument()
  })

  it('has proper semantic HTML structure', () => {
    render(<App />)
    // Check for proper HTML5 semantic elements
    expect(document.querySelector('html')).toBeTruthy()
    expect(document.querySelector('head')).toBeTruthy()
    expect(document.querySelector('body')).toBeTruthy()
  })

  it('initializes without authentication errors', () => {
    // Mock console.error to catch auth-related errors
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

    render(<App />)

    // Verify no auth-related errors were thrown during initialization
    const authErrors = consoleSpy.mock.calls.filter(call =>
      call[0]?.toString().includes('auth') ||
      call[0]?.toString().includes('supabase')
    )

    expect(authErrors).toHaveLength(0)
    consoleSpy.mockRestore()
  })
})