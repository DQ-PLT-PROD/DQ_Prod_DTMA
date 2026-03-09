# Backend API Architecture

## Overview

The DTMA backend API has a dual-mode architecture that works seamlessly in both local development and production (Vercel) environments.

## Architecture Comparison

### Local Development
```
┌─────────────────┐         ┌──────────────────┐
│  Vite Dev       │         │  Node.js HTTP    │
│  Server         │────────▶│  Server          │
│  :3000          │         │  :3001           │
└─────────────────┘         └──────────────────┘
                                     │
                                     ▼
                            ┌──────────────────┐
                            │  Supabase        │
 