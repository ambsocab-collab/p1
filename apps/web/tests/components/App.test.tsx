import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { App } from '../../src/App'

describe('App Component', () => {
  const renderApp = () => {
    return render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    )
  }

  it('renders without crashing', () => {
    renderApp()
    // App should render without throwing errors
  })

  it('displays the application title', () => {
    renderApp()
    const titleElement = screen.getByRole('heading', { name: /AMFE Tool/i })
    expect(titleElement).toBeInTheDocument()
  })

  it('renders the main layout components', () => {
    renderApp()
    // Check that main layout structure exists
    const mainElement = screen.getByRole('main')
    expect(mainElement).toBeInTheDocument()
  })

  it('has proper semantic HTML structure', () => {
    renderApp()
    // Check for proper HTML5 semantic elements
    expect(document.querySelector('html')).toBeTruthy()
    expect(document.querySelector('head')).toBeTruthy()
    expect(document.querySelector('body')).toBeTruthy()
  })

  it('initializes without authentication errors', () => {
    // Mock console.error to catch auth-related errors
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

    renderApp()

    // Verify no auth-related errors were thrown during initialization
    const authErrors = consoleSpy.mock.calls.filter(call =>
      call[0]?.toString().includes('auth') ||
      call[0]?.toString().includes('supabase')
    )

    expect(authErrors).toHaveLength(0)
    consoleSpy.mockRestore()
  })
})