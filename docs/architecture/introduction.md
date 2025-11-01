# Introduction

This document outlines the complete fullstack architecture for **Herramienta AMFE para Mejora Continua**, including backend systems, frontend implementation, and their integration. It serves as the single source of truth for AI-driven development, ensuring consistency across the entire technology stack.

This unified approach combines what would traditionally be separate backend and frontend architecture documents, streamlining the development process for modern fullstack applications where these concerns are increasingly intertwined.

## Starter Template or Existing Project

Based on the PRD review, this is a **greenfield project** with specific technology choices already defined:

- **Platform Choice:** Supabase + Vercel fullstack architecture
- **Frontend:** React 18 + TypeScript with Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Edge Functions)
- **Deployment:** Vercel for frontend, Supabase for backend/database
- **Repository Structure:** Monorepo with `/frontend`, `/docs`, and `/functions`

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-10-31 | 1.0 | Initial architecture creation | Winston (Architect) |
