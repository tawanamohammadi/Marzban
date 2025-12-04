---
title: "Marzban UI/UX Enhancement - Implementation Walkthrough"
generated_by: "Antigravity Agent"
author: "Tawana Mohammadi (توانا محمدی)"
role: "AI Researcher & Ethical AI/Data Transparency Specialist"
project: "Marzban Panel (Xray/V2Ray Management)"
date: "2025-12-05"
status: "Implemented (Feature 1 & 2) — Pending Review/Tests"
---
<img width="2559" height="1286" alt="{AB8763D7-F1B5-4AE2-9A50-F79D1A521787}" src="https://github.com/user-attachments/assets/635cbe6d-b6bd-4a9f-afe1-40f2229df175" />

> **Note**  
> This walkthrough documents UI/UX improvements authored with the help of **Antigravity Agent**.  
> Prepared and curated by **Tawana Mohammadi (توانا محمدی)** for future auditing, analysis, and maintenance.



# Marzban UI/UX Enhancement – Implementation Walkthrough

Two major features implemented to enhance the Marzban user experience.

---

## Feature 1: Drag & Drop Sorting for Host Settings

### Summary

Persistent ordering for inbounds and hosts. The configured order now persists to the database and reflects in generated subscription links.

### Backend Changes

| File               | Changes                                                                                             |
| ------------------ | --------------------------------------------------------------------------------------------------- |
| `models.py`        | Added `sort_index` column to `ProxyInbound` and `ProxyHost`.                                        |
| `migration`        | Alembic migration for new `sort_index` columns.                                                     |
| `crud.py`          | Added ordering + reorder helpers: `get_hosts_ordered`, `update_host_order`, `update_inbound_order`. |
| `hosts.py`         | New router with ordering API endpoints.                                                             |
| `system.py`        | Updated `GET /hosts` to return ordered results.                                                     |
| `xray/__init__.py` | `xray.hosts` now uses ordered DB queries so subscriptions respect order.                            |

### Frontend

Already implemented — `HostsDialog.tsx` includes drag & drop (native HTML5 DnD + framer-motion) and move up/down controls.

---

## Feature 2: UI-Based Xray Config Creation

### Summary

A visual inbound builder was added to the Core Settings modal, enabling users to create Xray inbounds without manually editing JSON.

### New Components

#### `InboundBuilder.tsx`

Visual form for creating inbounds with:

* **Protocol selector:** VMess, VLESS, Trojan, Shadowsocks
* **Transport selector:** TCP, WebSocket, gRPC, HTTP/2, QUIC, KCP, SplitHTTP
* **Security selector:** None, TLS, Reality
* **Dynamic settings panels** based on selected protocol/transport/security
* **Validation + error messages** for incorrect/invalid inputs

#### `ConfigBuilder.tsx`

Tab-based wrapper inside Core Settings:

* **Tab 1:** JSON Editor (existing functionality)
* **Tab 2:** Visual Builder (new)
* Displays existing inbounds as cards
* Supports add/delete inbound actions

### Modified Files

| File                    | Changes                                                       |
| ----------------------- | ------------------------------------------------------------- |
| `CoreSettingsModal.tsx` | Replaced direct `JsonEditor` usage with `ConfigBuilder` tabs. |
| `en.json`               | Added 30+ i18n translation keys for the new UI.               |

---

## To Apply Changes

```bash
# 1. Run database migration
alembic upgrade head

# 2. Build frontend (if needed)
cd app/dashboard
npm install
npm run build

# 3. Restart application
```

---

## New API Endpoints

| Endpoint                 | Method | Description                                            |
| ------------------------ | ------ | ------------------------------------------------------ |
| `/api/inbounds`          | GET    | Get all inbounds ordered by `sort_index`.              |
| `/api/inbounds/order`    | PUT    | Update inbound ordering (bulk update of `sort_index`). |
| `/api/hosts/{tag}`       | GET    | Get hosts for an inbound ordered by `sort_index`.      |
| `/api/hosts/{tag}/order` | PUT    | Update host ordering within an inbound.                |
