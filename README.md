# Manual QA Labs

An interactive web application designed to help manual QA engineers and developers practice identifying edge cases, boundary values, and security vulnerabilities.

## 🚀 Live Demo
**[Link will be here once deployed]**

## 🎯 The Goal
Most testing focuses on the "Happy Path." This project focuses on the other 80%—the weird inputs, security injection attacks, and logic dependencies that cause real-world production bugs.

## 🛠 Features
- **6 Interactive Scenarios**:
    - **Age Gate**: Boundary Value Analysis (17, 18, 0, Negative).
    - **Username Validator**: Input sanitization, length, and SQLi.
    - **Search Box**: XSS, HTML injection, and buffer overflows.
    - **File Upload**: Double extensions, size limits, and empty files.
    - **Coupon Code**: Logic state, stacking, and negative totals.
    - **Role Manager**: RBAC, dependency logic, and privilege escalation.
- **Real-time Feedback**: Dynamic logs explain *why* an input triggered a bug.
- **Progress Tracking**: Score the tester's performance as they find hidden edge cases.
- **Professional Dark Theme**: Built with React and Tailwind CSS v4.

## 💻 Local Setup

1. **Clone and Install**
   ```bash
   git clone <your-repo-url>
   cd qa-edge-case-challenge
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```

3. **Build for Production**
   ```bash
   npm run build
   ```

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).

## 🤝 Contributing
Found a cool edge case? Pull requests are welcome! 
1. Create a new scenario in `src/scenarios/`.
2. Add it to the configuration map in `src/pages/ChallengeView.jsx`.
3. Update the `Home.jsx` listing.

---
Created with ❤️ for the QA Community.
