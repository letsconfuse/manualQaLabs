# Manual QA Labs

## Live Demo
Check out the interactive application here: **[https://manual-qa-labs.vercel.app](https://manual-qa-labs.vercel.app)** 

## Overview
Manual QA Labs is a sophisticated technical demonstration platform designed for Quality Assurance professionals and software engineers. The application provides a suite of interactive scenarios that simulate complex system behaviors, logic dependencies, and security vulnerabilities. It serves as an educational tool for practicing edge case identification and boundary value analysis.

## Core Scenarios

### 1. Age Verification (Boundary Value Analysis)
The Age Gate component evaluates numeric input processing and boundary enforcement. It validates the system's ability to handle exact thresholds, immediate outliers, and invalid numeric states.
- **Parameters Studied:** Minimum boundary enforcement, negative integers, zero-value handling, and non-numeric string rejection.

### 2. User Authentication Validation
This scenario assesses registration input sanitization and business logic constraints.
- **Parameters Studied:** String length constraints, whitespace handling, reserved keyword rejection, and detection of basic SQL injection patterns.

### 3. Search Systems Logic
A deep-dive into query processing and input hygiene.
- **Parameters Studied:** Cross-Site Scripting (XSS) payload detection, HTML injection, buffer overflow simulation, and "no results" state handling.

### 4. File Management and Upload Security
An analysis of file system interaction and MIME-type validation.
- **Parameters Studied:** Double-extension spoofing, maximum file size enforcement, zero-byte file processing, and filename length limits.

### 5. Transactional Logic (Coupon System)
Evaluates state management and mathematical enforcement in a commerce context.
- **Parameters Studied:** Expiration date logic, discount stacking prevention, negative total mitigation, and case-insensitive string resolution.

### 6. Role-Based Access Control (RBAC)
A complex simulation of permission hierarchies and administrative dependency logic.
- **Parameters Studied:** Selection of parent-child permission inheritance, privilege escalation prevention during role downgrade, and account self-lockout scenarios.

### 7. The Booking Architect (Expert Logic)
An extreme challenge focused on date-management systems and time-based constraints. 
- **Parameters Studied:** Time paradoxes, leap year math, midnight boundary updates, locale ambiguity, and mid-stay blackout conflicts.

## Technical Architecture
The application is built using a modern, reactive stack optimized for performance and maintainability.
- **Frontend Framework:** React 19 (Vite)
- **Styling Engine:** Tailwind CSS v4
- **Iconography:** Lucide React
- **Routing:** React Router 7 (Data API)

## Implementation Details
The project utilizes a modular scenario-based architecture. Each scenario is a standalone functional component registered via a centralized configuration map. This design allows for seamless extension and scalability.

## Deployment Instructions
The application is optimized for production environments and can be deployed via the following methods:

### Production Build
Execute the following command to generate optimized assets:
```bash
npm run build
```

### Static Hosting
The resulting `dist/` directory is compatible with standard static hosting providers such as Vercel, Netlify, or GitHub Pages.

## License
This project is licensed under the MIT License. Detailed terms can be found in the [LICENSE](LICENSE) file.
