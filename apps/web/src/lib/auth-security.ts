/**
 * Enhanced Authentication Security Layer
 * Prevents authentication bypass scenarios and adds security hardening
 */

import { supabase } from './supabase';
import type { User, Session } from '@supabase/supabase-js';

export interface SecurityContext {
  isAuthenticated: boolean;
  userId: string | null;
  sessionId: string | null;
  lastActivity: number;
  securityLevel: 'anonymous' | 'authenticated' | 'elevated';
}

export interface SecurityConfig {
  sessionTimeoutMinutes: number;
  maxSessionAgeHours: number;
  requireReauth: boolean;
  allowedOrigins: string[];
  rateLimitEnabled: boolean;
}

class AuthSecurityManager {
  private securityContext: SecurityContext | null = null;
  private config: SecurityConfig = {
    sessionTimeoutMinutes: 30,
    maxSessionAgeHours: 24,
    requireReauth: false,
    allowedOrigins: [window.location.origin],
    rateLimitEnabled: true
  };

  private rateLimitStore = new Map<string, { count: number; resetTime: number }>();

  constructor() {
    this.initializeSecurityContext();
    this.setupActivityMonitoring();
  }

  /**
   * Initialize security context with current session
   */
  private async initializeSecurityContext(): Promise<void> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      this.updateSecurityContext(session);
    } catch (error) {
      console.error('Failed to initialize security context:', error);
      this.setDefaultSecurityContext();
    }
  }

  /**
   * Update security context based on session
   */
  private updateSecurityContext(session: Session | null): void {
    if (!session) {
      this.setDefaultSecurityContext();
      return;
    }

    // Validate session integrity
    if (!this.validateSession(session)) {
      this.invalidateSession();
      return;
    }

    this.securityContext = {
      isAuthenticated: true,
      userId: session.user.id,
      sessionId: session.access_token.slice(0, 16), // Hash for logging
      lastActivity: Date.now(),
      securityLevel: this.determineSecurityLevel(session)
    };
  }

  /**
   * Set default security context for anonymous users
   */
  private setDefaultSecurityContext(): void {
    this.securityContext = {
      isAuthenticated: false,
      userId: null,
      sessionId: this.generateAnonymousSessionId(),
      lastActivity: Date.now(),
      securityLevel: 'anonymous'
    };
  }

  /**
   * Generate anonymous session identifier
   */
  private generateAnonymousSessionId(): string {
    const sessionId = sessionStorage.getItem('anonymous_session_id');
    if (sessionId) return sessionId;

    const newSessionId = 'anon_' + Math.random().toString(36).substr(2, 16);
    sessionStorage.setItem('anonymous_session_id', newSessionId);
    return newSessionId;
  }

  /**
   * Validate session integrity and age
   */
  private validateSession(session: Session): boolean {
    // Check session age
    const sessionAge = Date.now() - new Date(session.user.created_at).getTime();
    const maxAge = this.config.maxSessionAgeHours * 60 * 60 * 1000;

    if (sessionAge > maxAge) {
      console.warn('Session expired due to age limit');
      return false;
    }

    // Check token structure (basic validation)
    if (!session.access_token || session.access_token.length < 50) {
      console.warn('Invalid access token format');
      return false;
    }

    // Check user ID format
    if (!session.user.id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(session.user.id)) {
      console.warn('Invalid user ID format');
      return false;
    }

    return true;
  }

  /**
   * Determine security level based on session and user properties
   */
  private determineSecurityLevel(session: Session): 'authenticated' | 'elevated' {
    // Elevated security for admin users or specific conditions
    const userMetadata = session.user.user_metadata || {};

    if (userMetadata.role === 'admin' || userMetadata.elevated_privileges === true) {
      return 'elevated';
    }

    return 'authenticated';
  }

  /**
   * Setup activity monitoring for session timeout
   */
  private setupActivityMonitoring(): void {
    let lastActivity = Date.now();

    const updateActivity = () => {
      lastActivity = Date.now();
      if (this.securityContext) {
        this.securityContext.lastActivity = lastActivity;
      }
    };

    // Monitor user activity
    document.addEventListener('click', updateActivity);
    document.addEventListener('keydown', updateActivity);
    document.addEventListener('scroll', updateActivity);
    document.addEventListener('mousemove', updateActivity);

    // Check for session timeout periodically
    setInterval(() => {
      const inactiveTime = Date.now() - lastActivity;
      const timeoutMs = this.config.sessionTimeoutMinutes * 60 * 1000;

      if (inactiveTime > timeoutMs && this.securityContext?.isAuthenticated) {
        console.warn('Session timed out due to inactivity');
        this.invalidateSession();
      }
    }, 60000); // Check every minute
  }

  /**
   * Rate limiting for authentication attempts
   */
  private checkRateLimit(identifier: string, maxAttempts: number = 5, windowMs: number = 900000): boolean {
    if (!this.config.rateLimitEnabled) return true;

    const now = Date.now();
    const key = identifier;
    const record = this.rateLimitStore.get(key);

    if (!record || now > record.resetTime) {
      // Reset or create new record
      this.rateLimitStore.set(key, {
        count: 1,
        resetTime: now + windowMs
      });
      return true;
    }

    if (record.count >= maxAttempts) {
      console.warn(`Rate limit exceeded for ${key}`);
      return false;
    }

    record.count++;
    return true;
  }

  /**
   * Validate origin for security
   */
  private validateOrigin(): boolean {
    const origin = document.referrer || window.location.origin;
    return this.config.allowedOrigins.includes(origin) ||
           this.config.allowedOrigins.some(allowed => origin.startsWith(allowed));
  }

  /**
   * Secure sign in with additional validation
   */
  public async secureSignIn(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    // Validate origin
    if (!this.validateOrigin()) {
      return { success: false, error: 'Invalid request origin' };
    }

    // Rate limiting
    const identifier = email || 'anonymous';
    if (!this.checkRateLimit('signin_' + identifier)) {
      return { success: false, error: 'Too many sign in attempts. Please try again later.' };
    }

    // Input validation
    if (!this.validateEmail(email)) {
      return { success: false, error: 'Invalid email format' };
    }

    if (password.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters' };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error.message);
        return { success: false, error: this.sanitizeErrorMessage(error.message) };
      }

      if (data.session) {
        this.updateSecurityContext(data.session);
        return { success: true };
      } else {
        return { success: false, error: 'No session received' };
      }

    } catch (error) {
      console.error('Unexpected sign in error:', error);
      return { success: false, error: 'Authentication service unavailable' };
    }
  }

  /**
   * Secure sign up with validation
   */
  public async secureSignUp(email: string, password: string, fullName?: string): Promise<{ success: boolean; error?: string }> {
    // Validate origin
    if (!this.validateOrigin()) {
      return { success: false, error: 'Invalid request origin' };
    }

    // Rate limiting
    if (!this.checkRateLimit('signup_' + email)) {
      return { success: false, error: 'Too many sign up attempts. Please try again later.' };
    }

    // Input validation
    if (!this.validateEmail(email)) {
      return { success: false, error: 'Invalid email format' };
    }

    if (!this.validatePassword(password)) {
      return { success: false, error: 'Password must be at least 8 characters with uppercase, lowercase, and number' };
    }

    if (fullName && fullName.length > 100) {
      return { success: false, error: 'Name too long' };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            security_level: 'standard',
            created_at: new Date().toISOString()
          },
        },
      });

      if (error) {
        console.error('Sign up error:', error.message);
        return { success: false, error: this.sanitizeErrorMessage(error.message) };
      }

      if (data.user && !data.session) {
        // Email confirmation required
        return { success: true };
      }

      if (data.session) {
        this.updateSecurityContext(data.session);
        return { success: true };
      } else {
        return { success: false, error: 'Account creation failed' };
      }

    } catch (error) {
      console.error('Unexpected sign up error:', error);
      return { success: false, error: 'Registration service unavailable' };
    }
  }

  /**
   * Secure sign out with cleanup
   */
  public async secureSignOut(): Promise<{ success: boolean; error?: string }> {
    try {
      // Clear security context
      this.securityContext = null;

      // Clear anonymous session data
      sessionStorage.removeItem('anonymous_session_id');

      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Sign out error:', error);
        // Continue with local cleanup even if server sign out fails
      }

      this.setDefaultSecurityContext();
      return { success: true };

    } catch (error) {
      console.error('Unexpected sign out error:', error);
      // Ensure local cleanup happens even if there's an error
      this.setDefaultSecurityContext();
      return { success: true };
    }
  }

  /**
   * Invalidate current session (security measure)
   */
  public async invalidateSession(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error invalidating session:', error);
    } finally {
      this.setDefaultSecurityContext();
      this.clearRateLimits();
    }
  }

  /**
   * Clear rate limiting data
   */
  private clearRateLimits(): void {
    this.rateLimitStore.clear();
  }

  /**
   * Validate email format
   */
  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 255;
  }

  /**
   * Validate password strength
   */
  private validatePassword(password: string): boolean {
    // At least 8 characters, with uppercase, lowercase, and number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }

  /**
   * Sanitize error messages to prevent information leakage
   */
  private sanitizeErrorMessage(message: string): string {
    // Common error messages that don't leak information
    const safeMessages = [
      'Invalid login credentials',
      'Email not confirmed',
      'User already registered',
      'Password reset required'
    ];

    if (safeMessages.some(safe => message.includes(safe))) {
      return message;
    }

    // Return generic error for security-sensitive messages
    return 'Authentication failed. Please check your credentials and try again.';
  }

  /**
   * Get current security context
   */
  public getSecurityContext(): SecurityContext | null {
    return this.securityContext ? { ...this.securityContext } : null;
  }

  /**
   * Check if current session is valid and active
   */
  public isSessionValid(): boolean {
    if (!this.securityContext) return false;

    const inactiveTime = Date.now() - this.securityContext.lastActivity;
    const timeoutMs = this.config.sessionTimeoutMinutes * 60 * 1000;

    return this.securityContext.isAuthenticated && inactiveTime < timeoutMs;
  }

  /**
   * Force re-authentication for sensitive operations
   */
  public requireReauthentication(): boolean {
    if (!this.securityContext?.isAuthenticated) return true;

    if (this.config.requireReauth || this.securityContext.securityLevel === 'elevated') {
      const sessionAge = Date.now() - this.securityContext.lastActivity;
      const reauthTimeout = 15 * 60 * 1000; // 15 minutes for sensitive operations

      return sessionAge > reauthTimeout;
    }

    return false;
  }

  /**
   * Update security configuration
   */
  public updateConfig(newConfig: Partial<SecurityConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get security audit information
   */
  public getSecurityAudit(): {
    sessionValid: boolean;
    securityLevel: string;
    lastActivity: number;
    rateLimitActive: boolean;
  } {
    return {
      sessionValid: this.isSessionValid(),
      securityLevel: this.securityContext?.securityLevel || 'anonymous',
      lastActivity: this.securityContext?.lastActivity || 0,
      rateLimitActive: this.config.rateLimitEnabled
    };
  }
}

// Create singleton instance
export const authSecurity = new AuthSecurityManager();

// Export secure authentication functions
export const secureSignIn = (email: string, password: string) => authSecurity.secureSignIn(email, password);
export const secureSignUp = (email: string, password: string, fullName?: string) => authSecurity.secureSignUp(email, password, fullName);
export const secureSignOut = () => authSecurity.secureSignOut();

// Export security utilities
export const getSecurityContext = () => authSecurity.getSecurityContext();
export const isSessionValid = () => authSecurity.isSessionValid();
export const requireReauthentication = () => authSecurity.requireReauthentication();
export const getSecurityAudit = () => authSecurity.getSecurityAudit();