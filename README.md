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

### 2. Hosting (Free Forever)
You can host this website for **$0 cost**:
- **GitHub Pages:** Upload your files to a GitHub repository. Go to **Settings > Pages** and set the source to your main branch.
- **Vercel:** Connect your GitHub to [Vercel](https://vercel.com) for a fast, free `https://your-site.vercel.app` link.

### 3. Custom Domain (Optional)
If you ever decide to buy a `.com` domain in the future, you can easily connect it to GitHub Pages or Vercel for free.

## 📁 File Structure
- `index.html`: Main customer-facing website.
- `admin.html`: Secure admin dashboard.
- `style.css`: Premium styling and animations.
- `script.js`: Frontend logic and Firebase integration.
- `legacy/`: Contains files from the previous Mini App version.
