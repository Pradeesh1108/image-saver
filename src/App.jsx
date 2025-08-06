import React, { useState } from 'react';
import { Download, Instagram, Loader, AlertCircle, CheckCircle } from 'lucide-react';

const NGROK_API = "https://ed6388f41cc0.ngrok-free.app"; // Update this if your ngrok URL changes

// Fetch Instagram images from backend
const fetchInstagramImages = async (postUrl) => {
  const response = await fetch(`${NGROK_API}/download`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: postUrl }),
  });
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || "Failed to fetch images");
  }
  console.log("Backend returned URLs:", data.media);
  const images = data.media.map((url, idx) => {
    const proxyUrl = `${NGROK_API}/proxy-image?url=${encodeURIComponent(url)}`;
    console.log(`Image ${idx + 1} proxy URL:`, proxyUrl);
    return {
      id: idx + 1,
      url,
      alt: `Instagram image ${idx + 1}`,
    };
  });
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

  const handleDownloadImages = async () => {
    if (!postUrl.trim()) {
      setToast({ message: 'Please enter an Instagram post URL', type: 'error' });
      return;
    }

    setLoading(true);
    setError('');
    setImages([]);

    try {
      const fetchedImages = await fetchInstagramImages(postUrl);
      setImages(fetchedImages);
      setToast({ message: `Successfully loaded ${fetchedImages.length} images!`, type: 'success' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch images');
      setToast({ message: 'Failed to load images. Please check the URL and try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadImage = async (imageUrl, imageId) => {
    try {
      const proxyUrl = `${NGROK_API}/proxy-image?url=${encodeURIComponent(imageUrl)}`;
      console.log("Downloading from:", proxyUrl);
      const response = await fetch(proxyUrl, { mode: "cors", cache: "no-store" });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      console.log("Response headers:", response.headers);
      const arrayBuffer = await response.arrayBuffer();
      console.log("ArrayBuffer size:", arrayBuffer.byteLength);
      const blob = new Blob([arrayBuffer], { type: response.headers.get("content-type") || "image/jpeg" });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `instagram-image-${imageId}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setToast({ message: 'Image downloaded successfully!', type: 'success' });
      console.log("Status:", response.status);
        console.log("Content-Type:", response.headers.get("content-type"));
    } catch (err) {
      setToast({ message: 'Failed to download image. Please try again.', type: 'error' });
      console.error("Download error:", err);
    }
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
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {images.map((image) => (
                <div
                  key={image.id}
                  className="relative group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={`${NGROK_API}/proxy-image?url=${encodeURIComponent(image.url)}`}
                      alt={image.alt}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                      onError={(e) => {
                        console.error(`Failed to load image ${image.id}:`, e);
                        e.target.style.display = 'none';
                        // Show error placeholder
                        const errorDiv = document.createElement('div');
                        errorDiv.className = 'w-full h-full flex items-center justify-center bg-gray-200 text-gray-500';
                        errorDiv.innerHTML = '<div class="text-center"><AlertCircle size="48" /><p class="mt-2">Failed to load image</p></div>';
                        e.target.parentNode.appendChild(errorDiv);
                      }}
                      onLoad={() => {
                        console.log(`Successfully loaded image ${image.id}`);
                      }}
                    />
                  </div>
                  
                  {/* Download Button Overlay */}
                  <button
                    onClick={() => handleDownloadImage(image.url, image.id)}
                    className="absolute top-3 right-3 bg-black/70 hover:bg-black/90 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 shadow-lg hover:scale-110"
                    title="Download image"
                  >
                    <Download size={20} />
                  </button>
                  
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
                onClick={() => {
                  images.forEach((image) => {
                    setTimeout(() => handleDownloadImage(image.url, image.id), image.id * 500);
                  });
                }}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 flex items-center gap-3 mx-auto shadow-lg"
              >
                <Download size={24} />
                Download All Images
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