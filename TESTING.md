# Veritas AI - Test Cases and Results

This document outlines the systematic test cases executed to validate the core functionalities, security, and UI/UX of the Veritas AI application.

## 1. Authentication Module Tests

| Test ID | Feature | Steps to Execute | Expected Result | Actual Result | Status |
|---------|---------|------------------|-----------------|---------------|--------|
| AUTH-01 | User Registration | Submit valid email, username, and password. | Account is created, user is logged in, token stored. | As expected. | ✅ PASS |
| AUTH-02 | Login Validation | Attempt login with invalid credentials. | System rejects request with "Invalid credentials" error. | As expected. | ✅ PASS |
| AUTH-03 | Session Persistence | Refresh the page after logging in. | User remains logged in via JWT stored in localStorage. | As expected. | ✅ PASS |
| AUTH-04 | Logout Functionality| Click "Sign Out" from Profile page. | JWT is cleared, user is redirected to Feed. | As expected. | ✅ PASS |

## 2. Core AI Verification Engine Tests (Text)

| Test ID | Feature | Steps to Execute | Expected Result | Actual Result | Status |
|---------|---------|------------------|-----------------|---------------|--------|
| VER-01 | True Claim | Submit known true claim (e.g., "Water boils at 100°C"). | Verdict: `TRUE`. High confidence score. | As expected. | ✅ PASS |
| VER-02 | False Claim | Submit known false claim (e.g., "The Earth is flat"). | Verdict: `FALSE`. Provides debunking evidence. | As expected. | ✅ PASS |
| VER-03 | Misleading Claim | Submit partially true claim out of context. | Verdict: `MISLEADING / CONTEXT`. Nuance explained. | As expected. | ✅ PASS |
| VER-04 | API Rate Limiting | Submit 15+ requests rapidly. | System throws 429 Too Many Requests. | Handled gracefully. | ✅ PASS |

## 3. Core AI Verification Engine Tests (Image)

| Test ID | Feature | Steps to Execute | Expected Result | Actual Result | Status |
|---------|---------|------------------|-----------------|---------------|--------|
| IMG-01 | Valid Image Check | Upload an image containing text/claims. | AI parses image text and returns a verification verdict. | As expected. | ✅ PASS |
| IMG-02 | Invalid File Type | Upload a PDF or non-image file. | UI prevents upload or throws "Invalid file format". | As expected. | ✅ PASS |
| IMG-03 | Large File Upload | Upload an image > 5MB. | System rejects with "File too large" warning. | As expected. | ✅ PASS |

## 4. UI/UX & Navigation Tests

| Test ID | Feature | Steps to Execute | Expected Result | Actual Result | Status |
|---------|---------|------------------|-----------------|---------------|--------|
| UX-01 | Scroll to Top Helper | Scroll down on Feed/Community. Click floating arrow. | Smoothly animates scrolling back to the top of the page. | As expected. | ✅ PASS |
| UX-02 | Native Web Share | Click "Share" on a verification result on Mobile/Desktop. | Opens native OS share sheet if supported, else copies link. | As expected. | ✅ PASS |
| UX-03 | Custom 404 Error | Navigate to `/this-page-does-not-exist`. | Glitch-animated 404 page is displayed with return buttons. | As expected. | ✅ PASS |
| UX-04 | Theme Switching | Toggle Light/Dark mode via Navbar. | UI colors invert smoothly without reloading the page. | As expected. | ✅ PASS |

## 5. Profile & Data Management Tests

| Test ID | Feature | Steps to Execute | Expected Result | Actual Result | Status |
|---------|---------|------------------|-----------------|---------------|--------|
| PRF-01 | Update Bio/Location | Edit profile details and save. | Changes persist and are reflected across the app. | As expected. | ✅ PASS |
| PRF-02 | Clear Verification Log | Click "Clear Log" in the Profile -> History tab. | History is wiped from UI, backend cleared, success Toast shown. | As expected. | ✅ PASS |
| PRF-03 | Bookmark Articles | Click bookmark icon on Feed articles. | Article appears in "Saved Articles" tab in Profile. | As expected. | ✅ PASS |

## Summary
**Total Test Cases Executed:** 17  
**Pass Rate:** 100%  
**Known Issues:** None at this time. All critical user flows are functioning properly in local development and production environments.
