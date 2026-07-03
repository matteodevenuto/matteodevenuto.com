---
title: "Forexizer Command Center: Trading Workspace & Journal"
featured: true
draft: true
tags: ["web", "forex", "trading", "journal", "dashboard", "saas"]
image: ""
websiteUrl: ""
videoDemo: ""
githubUrl: ""
pubDatetime: 2025-01-01
technologies: ["Next.js", "TypeScript", "Supabase", "Prisma", "Recharts", "TipTap", "shadcn/ui", "TailwindCSS"]
status: "ongoing"
---

## 🎯 Problem & Solution

### **The Challenge**
Funded traders managing multiple prop accounts face a fragmented workflow. Trade journaling happens in spreadsheets, screenshots pile up in folders, performance analysis requires manual exports, and position sizing lives in a separate app, all while switching between multiple broker dashboards. This friction makes it hard to review decisions, spot patterns, and improve systematically.

### **Our Solution**
The Forexizer Command Center is a unified web trading workspace that brings everything into one place:
- **Structured trade journal** with rich entry/exit metadata, emotion tracking, and setup tagging
- **Multi-account dashboard** with per-account equity curves, drawdown, and P&L breakdowns
- **Pre-market forecasting** to capture biases, key levels, and planned setups before the session
- **Position size calculator** ported from the Forexizer mobile app, scoped per account risk profile
- **Customizable dashboard** with drag-and-drop widgets and saveable layout templates

## 🚀 Key Features

### **Core Functionality**
- **Trade Journal**: Log trades with entry/exit price, R-multiple, emotion, mistakes, and setup type (linked to journal notes)
- **Multi-Account Management**: Track personal, prop, demo, and backtest accounts with distinct risk parameters
- **Forecasting**: Daily pre-market forecast form with bias, key levels, watchlist, planned setups, and pre-trade checklist
- **Dashboard Widgets**: Equity curve, drawdown chart, monthly P&L, setup performance, each filterable by instrument, account, and date range
- **Dashboard Templates**: Save and switch between named layout presets (Daily, Analysis, Quick View)

### **Advanced Features**
- **Position Size Calculator**: Per-account risk sizing with instrument-specific pip value and currency conversion
- **Backtesting Support**: Tag trades as backtest entries; all analytics apply equally to live and backtest data
- **Journal + Trades Integration**: Free-form journal entries linked to trades or standalone; searchable by date and trade
- **Dark / Light Mode**: Full theme support via `next-themes`
- **Workspace Import/Export**: Backup and restore your full workspace state from Settings
- **Supabase Auth**: Sign-up, sign-in, and password reset, with user-scoped data bootstrapped on first login

## 🛠 Technical Implementation

### **Frontend Stack**
- **Next.js (App Router)**: Server and client components with TypeScript throughout
- **shadcn/ui + Radix UI**: Accessible, composable component primitives
- **TailwindCSS**: Utility-first styling with custom design tokens
- **Recharts**: Equity curves, drawdown, and P&L charts
- **TipTap**: Rich text editor for journal entries (Markdown, task lists, images)
- **TanStack Query**: Server state management and cache invalidation

### **Backend & Data**
- **Supabase**: Postgres database, auth, and row-level security
- **Prisma**: Type-safe ORM with schema migrations
- **Next.js API Routes**: REST endpoints for workspace, trades, journal, forecasts, templates

### **Architecture**
- Per-user `WorkspaceState` bootstrapped on first login from the authenticated Supabase user ID
- Dashboard layout and templates persisted as JSON in Supabase
- Global and per-widget filtering (instrument, account, date range) applied at the query level

## 🔮 Development Roadmap

### **V1 (Current Focus)**
- [ ] **Multi-Account Trade Consolidation**: group the same trade across accounts for review, with per-account breakdowns
- [ ] **TradingView Chart Integration & Trade Replay**: embed charts on trade detail, auto-capture drawings at entry/exit, bar-by-bar replay
- [ ] **Broker Account Sync**: connect live MT4/MT5, MatchTrader, and FTMO accounts to pull trade history and balances automatically
- [ ] **CSV Import**: bulk import from MT4/MT5 export format with column mapping and deduplication

### **Reports**
- [ ] Monthly, quarterly, and custom date-range performance reports
- [ ] PDF export with equity curve, drawdown, win rate, and setup breakdown
- [ ] Branded export footer ("Powered by Forexizer")

### **Post-V1**
- [ ] **Trade Copier**: auto-execute trades across multiple accounts with per-account position sizing from the charting view
- [ ] **Daily Goals & Habits**: checklist widget with streak tracking and habit templates
- [ ] **News Event Alerts**: in-app notifications for upcoming economic events with configurable advance timing
- [ ] **Forecast vs. Actual Review**: compare pre-market predictions to real trade outcomes
