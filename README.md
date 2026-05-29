# Kim Service Center - Premium Agency Website

A modern, premium order and payment system for Kim Service Center.

## 🌟 Features
- **Premium UI/UX:** Purple + White theme with smooth animations and professional agency feel.
- **Dynamic Order System:** Supports multiple categories including Graphics Design, Editing, Coding, Marketing, Management, and Digital Products.
- **Inspired Mode:** Specific to Graphics Design, allowing users to upload reference images.
- **Multi-Region Payment:** Supports Local (KBZ Pay, Wave Pay, AYA Pay) and International (PayPal) payments.
- **Real-time Backend:** Integrated with Firebase Firestore and Storage for order processing.
- **Admin Dashboard:** Secure dashboard with Google Auth to manage orders, update statuses, and control website settings (Maintenance/Privacy modes).

## 🚀 Setup Instructions

### 1. Firebase Configuration
To make the backend work, you need to create a Firebase project:
1. Go to [Firebase Console](https://console.firebase.google.com/).
2. Create a new project named `kim-service`.
3. Enable **Firestore Database**, **Storage**, and **Authentication** (Google).
4. Register a "Web App" in your Firebase project.
5. Copy the `firebaseConfig` object and replace the placeholders in:
   - `script.js`
   - `admin.html`

### 2. Hosting
Upload `index.html`, `admin.html`, `style.css`, and `script.js` to your hosting provider (e.g., GitHub Pages).

### 3. Custom Domain (.com)
If you bought a custom domain (like `kimservice.com`):
1. **GitHub Pages:** Go to your repo **Settings > Pages**.
2. Under **Custom Domain**, type your domain name.
3. In your Domain Registrar (Namecheap/GoDaddy), add **CNAME** and **A Records** pointing to GitHub's servers.

## 📁 File Structure
- `index.html`: Main customer-facing website.
- `admin.html`: Secure admin dashboard.
- `style.css`: Premium styling and animations.
- `script.js`: Frontend logic and Firebase integration.
- `legacy/`: Contains files from the previous Mini App version.
