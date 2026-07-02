# AI Applicant Tracking System (AI ATS) - Real-time Socket.io & Email Notification Documentation

## Executive Summary
**Phase Objective**: Implement the Real-time Socket.io & Email Notification Engine. Delivers instant WebSocket push notifications and formatted HTML email dispatches for **Application Updates**, **Interview Schedule**, **Offer Letters**, **Rejections**, and **Mentions**, featuring a Notification Center drawer with an unread badge counter and mark-as-read controls.

---

## 1. Notification Types & Badges

| Notification Type | Trigger Event | Badge Styling | Email Dispatch Format |
|---|---|---|---|
| **`APPLICATION_UPDATE`** | Application status transition (`Applied` -> `Screening`) | Indigo Badge | Formatted HTML update summary email |
| **`INTERVIEW_SCHEDULE`** | Interview round scheduled or updated | Amber Badge | Calendar event details & location/link email |
| **`OFFER_LETTER`** | Job offer extended to candidate | Emerald Badge | Official offer confirmation email |
| **`APPLICATION_REJECTED`** | Application status set to rejected | Rose Badge | Respectful candidate rejection notice email |
| **`MENTION`** | Recruiter @mentioned team member in notes | Cyan Badge | Team activity mention notification email |

---

## 2. API Endpoint Specification

All endpoints under `/api/notifications` require JWT Authentication (`Authorization: Bearer <token>`).

| Method | Endpoint | Description | Response / Payload |
|---|---|---|---|
| `GET` | `/api/notifications` | Fetch user notifications list & unread count | `{ notifications: [], unreadCount: number }` |
| `PATCH` | `/api/notifications/:id/read` | Mark single notification as read | `{ message: "Notification marked as read" }` |
| `PATCH` | `/api/notifications/read-all` | Mark all user notifications as read | `{ message: "All notifications marked as read" }` |
| `POST` | `/api/notifications/test-trigger` | Trigger test notification dispatch | `{ type, title, message }` |

---

## 3. Real-time WebSocket Socket.io Specification
- **Connection**: `io('http://localhost:5000')`
- **Room Subscription**: `socket.emit('join_user_room', userId)` -> Joins `user_<userId>` room.
- **Event Listener**: `socket.on('new_notification', (notification) => { ... })` -> Triggers real-time notification drawer update & unread counter increment without page reload.

---

## 4. Frontend Component ([NotificationCenter.jsx](file:///d:/Chandan/projects/ATS-Resume%20screening%20application/client/src/components/NotificationCenter.jsx))
- **Bell Icon Header Widget**: Live red unread counter badge (`9+`).
- **Notification Center Drawer**:
  - Filter tabs: All vs Unread.
  - Category badges: Application Update, Interview Schedule, Offer Letter, Rejection Notice, Mention.
  - 1-Click "Mark as Read" per item and "Mark All Read" button.
  - "Test Alert" trigger for live testing.
