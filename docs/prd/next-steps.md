# Next Steps

## UX Expert Prompt

Please review the AMFE tool PRD and create detailed wireframes and user flow diagrams focusing on:
1. Matrix AMFE editor with Excel-like interaction patterns optimized for quality engineers
2. Actions management workflow with clear status progression and cost tracking
3. Dashboard design that provides quick insights for management presentations
4. Mobile-responsive patterns for field engineers needing to access data on shop floor
5. Offline mode indicators and sync status communications

## Architect Prompt

Please review the AMFE tool PRD and create detailed technical architecture including:
1. Supabase database schema design for AMFEs, failure modes, actions, and user data
2. React component architecture with state management strategy (Zustand/React Query)
3. PWA implementation strategy with service worker caching policies
4. Performance optimization plan to achieve <3s load time and <5MB bundle size
5. CI/CD pipeline configuration for Vercel deployment with automated testing
6. Data synchronization strategy between localStorage and Supabase for offline functionality