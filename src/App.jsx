import React, { useState } from 'react';
import { Download, Instagram, Loader, AlertCircle, CheckCircle } from 'lucide-react';

const NGROK_API = "https://3dc3e97f5453.ngrok-free.app"; // Update this if your ngrok URL changes

// Fetch Instagram images from backend
const fetchInstagramImages = async (postUrl) => {
  const response = await fetch(`${NGROK_API}/download`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: postUrl }),
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || "Failed to fetch images");
  }
  
  console.log("Backend returned URLs:", data.media);
  const images = data.media.map((url, idx) => ({
    id: idx + 1,
    url,
    alt: `Instagram image ${idx + 1}`,
    loading: true,
    error: false,
  }));
  return images;
};

// Toast notification component
const Toast = ({ message, type, onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-slide-in ${
      type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
    }`}>
      {type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
      <span>{message}</span>
    </div>
  );
};

function App() {
  const [postUrl, setPostUrl] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [downloadingAll, setDownloadingAll] = useState(false);

  const handleDownloadImages = async () => {
    if (!postUrl.trim()) {
      setToast({ message: 'Please enter an Instagram post URL', type: 'error' });
      return;
    }

    setLoading(true);
    setError('');
    setImages([]);

    try {
      console.log("Fetching images for URL:", postUrl);
      const fetchedImages = await fetchInstagramImages(postUrl);
      console.log("Setting images in state:", fetchedImages);
      setImages(fetchedImages);
      setToast({ message: `Successfully loaded ${fetchedImages.length} images!`, type: 'success' });
    } catch (err) {
      console.error("Error fetching images:", err);
      setError(err instanceof Error ? err.message : 'Failed to fetch images');
      setToast({ message: 'Failed to load images. Please check the URL and try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadImage = async (imageUrl, imageId) => {
    try {
      console.log("Downloading from:", imageUrl);
      
      // Show loading state
      setToast({ message: 'Downloading image...', type: 'success' });
      
      // Create the proxy URL
      const proxyUrl = `${NGROK_API}/proxy-image?url=${encodeURIComponent(imageUrl)}`;
      console.log("Using proxy URL:", proxyUrl);
      
      // Fetch the image data from the proxy
      const response = await fetch(proxyUrl, {
        mode: 'cors',
        headers: {
          'Accept': 'image/*',
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Get the image data as blob
      const blob = await response.blob();
      console.log("Image blob size:", blob.size);
      
      // Create a download link with the blob
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `instagram-image-${imageId}.jpg`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      window.URL.revokeObjectURL(url);

      setToast({ message: 'Image downloaded successfully!', type: 'success' });
      console.log("Download completed successfully");
    } catch (err) {
      console.error("Download error:", err);
      
      // Fallback: try opening in new tab
      try {
        const proxyUrl = `${NGROK_API}/proxy-image?url=${encodeURIComponent(imageUrl)}`;
        window.open(proxyUrl, '_blank');
        setToast({ message: 'Opened image in new tab. Right-click and save as...', type: 'success' });
      } catch (fallbackErr) {
        setToast({ message: 'Failed to download image. The URL may be expired.', type: 'error' });
        console.error("Fallback error:", fallbackErr);
      }
    }
  };

  const handleDirectDownload = async (imageUrl, imageId) => {
    try {
      console.log("Attempting direct download from:", imageUrl);
      
      // Method 1: Try to create a download link with proper headers
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `instagram-image-${imageId}.jpg`;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      
      // Add Instagram referrer to help with access
      link.setAttribute('referrerpolicy', 'no-referrer');
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setToast({ message: 'Download link created! Check your downloads folder.', type: 'success' });
      console.log("Direct download initiated");
    } catch (err) {
      console.error("Direct download error:", err);
      
      // Method 2: Open in new tab as last resort
      try {
        window.open(imageUrl, '_blank');
        setToast({ message: 'Opened image in new tab. Right-click and save as...', type: 'success' });
      } catch (finalErr) {
        setToast({ message: 'Failed to download image. Copy the URL manually.', type: 'error' });
        console.error("Final fallback error:", finalErr);
      }
    }
  };

  const handleDownloadAll = async () => {
    if (images.length === 0) return;
    
    setDownloadingAll(true);
    try {
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        console.log(`Downloading image ${i + 1}/${images.length}`);
        await handleDownloadImage(image.url, image.id);
        // Add a small delay between downloads to avoid overwhelming the server
        if (i < images.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
      setToast({ message: `All ${images.length} images downloaded successfully!`, type: 'success' });
    } catch (err) {
      setToast({ message: 'Some images failed to download. Please try again.', type: 'error' });
    } finally {
      setDownloadingAll(false);
    }
  };

  const handleImageLoad = (imageId) => {
    console.log(`Image ${imageId} loaded successfully`);
    setImages(prev => prev.map(img => 
      img.id === imageId ? { ...img, loading: false, error: false } : img
    ));
  };

  const handleImageError = (imageId) => {
    console.log(`Image ${imageId} failed to load`);
    setImages(prev => prev.map(img => 
      img.id === imageId ? { ...img, loading: false, error: true } : img
    ));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleDownloadImages();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      {/* Toast notifications */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Instagram className="text-pink-500" size={40} />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Instagram Image Downloader
            </h1>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Download high-quality images from any Instagram post. Simply paste the post URL and get all images instantly.
          </p>
        </div>

        {/* Input Section */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="mb-6">
              <label htmlFor="postUrl" className="block text-sm font-semibold text-gray-700 mb-3">
                Instagram Post URL
              </label>
              <input
                type="url"
                id="postUrl"
                value={postUrl}
                onChange={(e) => setPostUrl(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="https://www.instagram.com/p/..."
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none text-lg"
                disabled={loading}
              />
            </div>
            
            <button
              onClick={handleDownloadImages}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg shadow-lg"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin" size={24} />
                  Fetching Images...
                </>
              ) : (
                <>
                  <Download size={24} />
                  Download Images
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-center gap-3">
              <AlertCircle className="text-red-500" size={24} />
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-3 bg-white rounded-full px-8 py-4 shadow-lg">
              <Loader className="animate-spin text-blue-500" size={24} />
              <span className="text-gray-700 font-medium">Loading images from Instagram...</span>
            </div>
          </div>
        )}

        {/* Images Grid */}
        {images.length > 0 && (
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">
              Found {images.length} image{images.length !== 1 ? 's' : ''}
            </h2>
            
            {/* Debug section - show raw URLs */}
            <div className="mb-6 p-4 bg-gray-100 rounded-lg">
              <h3 className="font-semibold mb-2">Debug Info:</h3>
              {images.map((image, index) => (
                <div key={image.id} className="text-sm mb-2">
                  <strong>Image {image.id}:</strong> {image.url.substring(0, 100)}...
                  <br />
                  <strong>Status:</strong> {image.loading ? 'Loading' : image.error ? 'Error' : 'Loaded'}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {images.map((image) => (
                <div
                  key={image.id}
                  className="relative group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className="aspect-square overflow-hidden bg-gray-100">
                    {image.loading && (
                      <div className="w-full h-full flex items-center justify-center">
                        <Loader className="animate-spin text-blue-500" size={32} />
                      </div>
                    )}
                    
                    {image.error && (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
                        <div className="text-center p-4">
                          <AlertCircle size={48} />
                          <p className="mt-2 text-sm font-medium">Image not accessible</p>
                          <p className="text-xs mt-1">Try downloading directly</p>
                          <button
                            onClick={() => handleDownloadImage(image.url, image.id)}
                            className="mt-3 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs"
                          >
                            Download
                          </button>
                        </div>
                      </div>
                    )}
                    
                    <img
                      src={image.url}
                      alt={image.alt}
                      className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${
                        image.error ? 'hidden' : ''
                      }`}
                      loading="lazy"
                      onLoad={() => handleImageLoad(image.id)}
                      onError={() => handleImageError(image.id)}
                      style={{ display: image.loading ? 'none' : 'block' }}
                      onLoadStart={() => console.log(`Image ${image.id} starting to load:`, image.url)}
                      crossOrigin="anonymous"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  
                  {/* Download Button Overlay */}
                  <button
                    onClick={() => handleDownloadImage(image.url, image.id)}
                    disabled={image.error}
                    className={`absolute top-3 right-3 bg-black/70 hover:bg-black/90 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 shadow-lg hover:scale-110 ${
                      image.error ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    title={image.error ? "Cannot download - image failed to load" : "Download image"}
                  >
                    <Download size={20} />
                  </button>
                  
                  {/* Copy URL Button for failed images */}
                  {image.error && (
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(image.url);
                        setToast({ message: 'Image URL copied to clipboard!', type: 'success' });
                      }}
                      className="absolute top-3 left-3 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 shadow-lg hover:scale-110"
                      title="Copy image URL"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                    </button>
                  )}
                  
                  {/* Image info overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <p className="text-white text-sm font-medium truncate">
                      Image {image.id}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Download All Button */}
            <div className="text-center mt-10">
              <button
                onClick={handleDownloadAll}
                disabled={downloadingAll || images.some(img => img.error)}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center gap-3 mx-auto shadow-lg"
              >
                {downloadingAll ? (
                  <>
                    <Loader className="animate-spin" size={24} />
                    Downloading All...
                  </>
                ) : (
                  <>
                    <Download size={24} />
                    Download All Images
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default App;