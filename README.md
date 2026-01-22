# GODWILL SHOP POS  
Retail & Wholesale Point of Sale • Inventory • Financial System

---

## Overview

Godwill Shop POS is a **production-ready POS system** designed for businesses that operate **retail and wholesale at the same time**.  
It supports **unit-based selling (kg, liters, pieces)**, **automatic wholesale pricing thresholds**, **real-time inventory control**, **receipt generation**, **OS-level printing**, and **end-day financial reconciliation**.

The system is built **offline-first**, with strong emphasis on **accuracy, reliability, and audit safety**.

---

## Purpose

This system exists to solve real shop problems:

- Different pricing rules for retail vs wholesale
- Selling in measurable units (kg / ltr / pcs)
- Preventing sales beyond available stock
- Avoiding lost receipts when printers fail
- Enforcing correct end-day cash reporting
- Maintaining clean, auditable sales records

---

## Core Features

### Point of Sale (POS)
- Unified cart + checkout
- Unit-aware selling (kg, liters, pieces)
- Automatic wholesale pricing when quantity threshold is reached
- Live stock validation (cannot sell out-of-stock items)
- Supports cash and digital payments

### Inventory Management
- Product setup with:
  - Unit type
  - Retail price
  - Wholesale threshold
  - Wholesale price
  - Stock quantity
- Automatic stock deduction on sale
- Restocking and stock adjustments
- Low-stock and out-of-stock alerts

### Receipt System (Local-First)
- Receipts are generated once per sale
- Saved automatically to local storage
- Stored as:
  - JSON (system truth)
  - TXT (ESC/POS print-ready)
- Receipts are immutable (cannot be edited)
- Printing is optional and can be done later

### Printing (OS-Level)
- Uses the operating system’s print service
- Supports ESC/POS thermal printers
- Handles:
  - Receipt printing
  - Duplicate receipt printing
  - End-day report printing
- End-day cannot close unless report printing succeeds

### Sales History
- Complete, read-only sales log
- View saved receipts
- Reprint receipts (clearly marked as DUPLICATE)
- Filter by date, cashier, or payment method

### Dashboard
- Real-time, verified data only
- Today’s sales totals
- Cash vs digital breakdown
- Retail vs wholesale performance
- Inventory alerts
- Cash variance tracking
- End-day control button

### End-Day Reporting (Z-Report)
- Mandatory end-day process
- Generates authoritative Z-report
- Enforces cash reconciliation
- Locks the day permanently after completion
- Prevents post-day sales manipulation

---

## System Architecture (Job-Ready)

### Systems
- POS Engine
- Inventory Engine
- Receipt Engine
- Reporting Engine
- OS Print Integration

### APIs / Services
- `SalesService`
- `InventoryService`
- `ReceiptService`
- `ReportService`
- `PrintService`

Services communicate through clear boundaries, making the system modular and maintainable.

### Database & Storage
- Relational database for sales, products, inventory, and reports
- Local file storage for receipts and reports
- File checksums used to detect tampering
- Inventory is the single source of truth

---

## Reliability & Safety

- Offline-first operation
- Immutable receipts and reports
- Cannot sell beyond available stock
- OS print job confirmation enforced
- End-day cannot close without successful report print
- Crash-safe local storage

---

## UI / UX

- Dark interface optimized for long shop hours
- Money-first dashboard design
- Minimal clicks, clear actions
- Color palette:
  - `#222222` – background
  - `#FF6D1F` – actions & alerts
  - `#ABE0F0` – analytics & info

---

## Why This Project Is Job-Ready

- Real-world retail + wholesale logic
- Strong systems and service separation
- OS and hardware integration
- Database + file-system design
- Failure-aware workflows
- Audit-safe financial reporting

This is not a demo POS — it’s a **real systems engineering project**.

---

## Suitable Use Cases

- Retail & wholesale shops
- Mini-supermarkets
- Agro-vet stores
- Hardware shops
- High-volume cash businesses
