
# GODWILL SHOP POS

**Retail & Wholesale Point of Sale, Inventory & Financial System**

---

## 📌 Overview

**Godwill Shop POS** is a robust, offline-first **Point of Sale (POS) system** designed for businesses that operate **both retail and wholesale simultaneously**.
It handles **unit-based pricing**, **wholesale thresholds**, **real-time inventory control**, **receipt generation**, **OS-level printing**, and **end-of-day financial accountability**.

This system is built for **accuracy, auditability, and real shop workflows**, not demos.

---

## 🎯 Purpose of the System

The purpose of Godwill Shop POS is to:

* Eliminate pricing confusion between retail and wholesale
* Prevent selling stock that does not exist
* Maintain accurate inventory in real time
* Ensure every sale is traceable, immutable, and auditable
* Support receipt generation even when printers fail
* Enforce proper end-day cash and sales reconciliation
* Operate reliably in low-connectivity environments

---

## 🏪 Business Model Supported

This POS supports **hybrid retail + wholesale stores**, where:

* Products are sold in **kilograms, liters, or pieces**
* Retail pricing applies at low quantities
* Wholesale pricing activates automatically at a defined quantity threshold
* One product can have **multiple pricing behaviors**

Example:

* Flour:

  * Retail price: 100 KES per kg
  * Wholesale threshold: 4 kg
  * Wholesale price: 80 KES per kg (once threshold is met)

The system automatically switches pricing **during checkout**, without manual intervention.

---

## 🧩 Core Features

### 1️⃣ Point of Sale (POS)

* Unified cart + checkout interface
* Unit-aware sales (kg, liters, pieces)
* Automatic wholesale price activation
* Live stock validation (cannot sell beyond available stock)
* Real-time total recalculation
* Payment handling (Cash, M-Pesa, etc.)

---

### 2️⃣ Inventory Management

* Product creation with:

  * Unit type
  * Retail price
  * Wholesale threshold
  * Wholesale price
  * Initial stock quantity
* Automatic stock deduction on sale
* Stock adjustments and restocking
* Low-stock and out-of-stock alerts
* Inventory is the **single source of truth**

---

### 3️⃣ Receipt Generation (Local Storage First)

* Receipts are generated **once per sale**
* Saved automatically to **local storage**
* Stored in multiple formats:

  * JSON (system truth)
  * TXT (ESC/POS print-ready)
  * Metadata (audit info)
* Receipts are immutable (cannot be edited)
* Printing is optional and can be done later

This design ensures:

* No data loss during printer failure
* Full offline reliability
* Strong audit trail

---

### 4️⃣ OS-Level Printing

* Uses the **Operating System print service**
* Supports ESC/POS thermal printers
* Handles:

  * Receipt printing
  * Duplicate receipt printing
  * End-day report printing
* Printing failures are detected and handled explicitly
* End-day cannot close without successful report printing

---

### 5️⃣ Sales History

* Complete record of all sales
* Filter by:

  * Date
  * Cashier
  * Payment method
* View saved receipts
* Reprint receipts (marked as DUPLICATE)
* Sales records are read-only after completion

---

### 6️⃣ Dashboard (Accuracy-Driven)

The dashboard provides **real-time, verified data only**:

* Today’s sales totals
* Cash vs digital payments
* Retail vs wholesale performance
* Live inventory alerts
* Fast-moving products
* Cash variance tracking
* End-day control button

No cached estimates. No editable numbers.

---

### 7️⃣ End-Day Reporting (Z-Report)

* Mandatory end-day process
* Generates authoritative Z-report
* Enforces:

  * Cash reconciliation
  * Printer availability
  * One-time closure per day
* Locks the day permanently after completion
* Prevents post-day sales manipulation

---

## 🧠 System Design Philosophy

This system is built on these principles:

* **Accuracy over convenience**
* **Local storage before cloud**
* **Hardware failures must not corrupt data**
* **Every sale must be explainable**
* **No silent failures**
* **No recalculating history**

If something fails, the system tells you — clearly.

---

## 🎨 UI / UX Design

Color palette:

* `#222222` – primary background (focus & clarity)
* `#FF6D1F` – actions, alerts, money
* `#ABE0F0` – informational elements & analytics

UX priorities:

* One-glance clarity
* Minimal clicks
* Large readable numbers
* Clear warnings
* No hidden actions

---

## 🔐 Data Integrity & Audit Safety

* Receipts are immutable
* Inventory changes are logged
* End-day reports cannot be regenerated
* OS print job IDs are tracked
* File checksums detect tampering
* Historical data is read-only

This makes the system suitable for:

* Owner audits
* Disputes
* Accountant review
* Legal verification

---

## 🖨 Hardware Compatibility

* ESC/POS thermal printers (58mm / 80mm)
* Cash drawers (printer-triggered)
* Windows & Linux POS terminals
* Offline-first operation

---

## 🚀 Who This System Is For

* Retail + wholesale shops
* Grocery stores
* Hardware shops
* Agro-vet stores
* Mini-supermarkets
* High-volume cash businesses

---

## ⚠️ What This System Will NOT Do

* Allow selling out-of-stock items
* Allow editing past sales
* Allow closing a day without reconciliation
* Fake printer success
* Guess prices or quantities

---

## 📦 Future Extensions (Optional)

* Cloud sync & backups
* Multi-branch reporting
* Mobile dashboard
* Supplier purchase tracking
* Tax/VAT modules

---

