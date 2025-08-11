# Instagram Image Downloader

A modern, responsive web application built with React that allows users to download high-quality images from Instagram posts. The app features a beautiful UI with smooth animations and provides an intuitive way to fetch and download multiple images from any Instagram post URL.

## ✨ Features

- **Instagram Image Extraction**: Paste any Instagram post URL to extract all images
- **Bulk Download**: Download individual images or all images at once
- **Responsive Design**: Beautiful, modern UI that works on all devices
- **Real-time Feedback**: Toast notifications and loading states for better UX
- **Error Handling**: Graceful fallbacks for failed image loads
- **Modern UI**: Gradient backgrounds, hover effects, and smooth animations
- **Debug Information**: Built-in debugging tools for development

## 🚀 Tech Stack

- **Frontend Framework**: React 18.3.1
- **Build Tool**: Vite 5.4.2
- **Styling**: Tailwind CSS 3.4.1
- **Icons**: Lucide React
- **Development**: ESLint, PostCSS, Autoprefixer

## 📁 Project Structure

```
picSaver/
├── src/
│   ├── App.jsx          # Main application component
│   ├── main.jsx         # React entry point
│   └── index.css        # Global styles and Tailwind imports
├── public/
│   └── index.html       # HTML template
├── package.json          # Dependencies and scripts
├── vite.config.js       # Vite configuration
├── tailwind.config.js   # Tailwind CSS configuration
├── postcss.config.js    # PostCSS configuration
└── eslint.config.js     # ESLint configuration
```

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Pradeesh1108/image-saver.git
   cd image-saver
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` (or the port shown in your terminal)

## 📱 Usage

1. **Enter Instagram Post URL**: Paste any Instagram post URL in the input field
2. **Fetch Images**: Click "Download Images" to extract all images from the post
3. **Preview Images**: View all extracted images in a responsive grid layout
4. **Download Options**:
   - **Individual Download**: Click the download button on any image
   - **Bulk Download**: Use "Download All Images" to get all images at once
   - **Copy URL**: For failed images, copy the direct URL to clipboard

## 🔧 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality

## 🎨 UI Components

### Main Features
- **Header**: Instagram branding with gradient text
- **Input Section**: URL input with validation and Enter key support
- **Image Grid**: Responsive grid layout for displaying extracted images
- **Toast Notifications**: Success/error messages with auto-dismiss
- **Loading States**: Spinners and progress indicators throughout the app

### Interactive Elements
- **Hover Effects**: Scale transforms and shadow changes on hover
- **Download Buttons**: Overlay buttons that appear on image hover
- **Error Handling**: Fallback UI for failed image loads
- **Responsive Design**: Adapts to different screen sizes

## 🌐 API Integration

The app integrates with a backend service (via ngrok) to:
- Extract image URLs from Instagram posts
- Proxy image downloads to avoid CORS issues
- Handle authentication and rate limiting

**Note**: Update the `NGROK_API` constant in `src/App.jsx` if your backend URL changes.

## 🎯 Key Features Explained

### Image Fetching
- Sends POST request to backend with Instagram URL
- Processes response to extract media URLs
- Handles errors gracefully with user feedback

### Download System
- Individual image downloads with progress tracking
- Bulk download functionality for multiple images
- Fallback to direct download for failed images

### State Management
- React hooks for managing application state
- Loading states for better user experience
- Error handling with user-friendly messages

## 🔒 Security Features

- CORS handling for cross-origin requests
- Input validation for URLs
- Secure image proxy through backend
- No client-side Instagram API keys

## 🚧 Development Notes

- **Debug Mode**: Built-in debug information display for development
- **Console Logging**: Comprehensive logging for troubleshooting
- **Error Boundaries**: Graceful error handling throughout the app
- **Performance**: Lazy loading and optimized image rendering



