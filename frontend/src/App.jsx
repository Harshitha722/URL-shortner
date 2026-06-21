import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [toast, setToast] = useState(null);
  const [inputError, setInputError] = useState("");

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem("urlHistory");
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("urlHistory", JSON.stringify(history));
  }, [history]);

  // Show toast notification
  const showToast = (message, type = "success") => {
    const id = Date.now();
    setToast({ id, message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // Validate URL format with stricter rules
  const isValidUrl = (urlString) => {
    try {
      // Check URL length (max 2048 characters)
      if (!urlString || urlString.length > 2048) {
        return false;
      }

      const url = new URL(urlString);
      
      // Check for valid protocol
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        return false;
      }
      
      // Check if hostname exists and is valid
      if (!url.hostname || url.hostname.length === 0 || url.hostname.length > 253) {
        return false;
      }
      
      // Check for valid domain format (must have at least one dot and valid characters)
      const hostname = url.hostname;
      
      // Check if hostname has at least one dot (domain.com format)
      if (!hostname.includes(".")) {
        return false;
      }
      
      // Check if hostname has valid characters (alphanumeric, dots, hyphens)
      if (!/^[a-z0-9.-]+$/i.test(hostname)) {
        return false;
      }
      
      // Check if it ends with a valid TLD (at least 2 characters after last dot)
      const parts = hostname.split(".");
      const tld = parts[parts.length - 1];
      if (tld.length < 2 || /[0-9]/.test(tld)) {
        return false;
      }

      // Block suspicious/dangerous protocols disguised in URLs
      const suspiciousPatterns = [
        /javascript:/i,
        /data:/i,
        /vbscript:/i,
        /about:/i,
      ];
      if (suspiciousPatterns.some(pattern => pattern.test(urlString))) {
        return false;
      }
      
      return true;
    } catch {
      return false;
    }
  };

  // Shorten URL
  const shortenUrl = async () => {
    setInputError("");

    if (!url.trim()) {
      setInputError("Please enter a URL");
      showToast("Please enter a URL", "error");
      return;
    }

    let urlToProcess = url;
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      urlToProcess = "https://" + url;
    }

    if (!isValidUrl(urlToProcess)) {
      setInputError("Please enter a valid URL");
      showToast("Invalid URL format", "error");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post("http://localhost:5000/shorten", {
        originalUrl: urlToProcess,
      });

      setShortUrl(res.data.shortUrl);
      setUrl("");
      setInputError("");

      // Add to history
      const newHistoryItem = {
        id: Date.now(),
        original: urlToProcess,
        short: res.data.shortUrl,
        createdAt: new Date().toLocaleString(),
      };
      setHistory([newHistoryItem, ...history]);

      showToast("URL shortened successfully!", "success");
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Failed to shorten URL";
      setInputError(errorMsg);
      showToast(errorMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  // Copy to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      showToast("✓ Copied to clipboard!", "success");
    } catch {
      showToast("Failed to copy", "error");
    }
  };

  // Copy history item to clipboard
  const copyHistoryItem = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      showToast("✓ Copied to clipboard!", "success");
    } catch {
      showToast("Failed to copy", "error");
    }
  };

  // Delete history item
  const deleteHistoryItem = (id) => {
    setHistory(history.filter((item) => item.id !== id));
    showToast("History item removed", "info");
  };

  // Clear all history
  const clearHistory = () => {
    if (window.confirm("Are you sure you want to clear all history?")) {
      setHistory([]);
      setShortUrl("");
      showToast("History cleared", "info");
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !loading) {
      shortenUrl();
    }
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-container">
          <div className="logo">
            <span className="logo-icon">🔗</span>
            <span className="logo-text">Shortify</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Shorten Your Links</h1>
          <p>Create short, shareable URLs in seconds. Track analytics and manage your links from one place.</p>
        </div>

        {/* Main Input Card */}
        <div className="shortener-card">
          {/* Input Section */}
          <div className="input-wrapper">
            <input
              type="text"
              placeholder="Paste your long URL here"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setInputError("");
              }}
              onKeyPress={handleKeyPress}
              disabled={loading}
              className="url-input"
            />
            <button onClick={shortenUrl} disabled={loading} className="shorten-btn">
              {loading ? (
                <>
                  <span className="spinner"></span>
                </>
              ) : (
                "Shorten"
              )}
            </button>
          </div>

          {/* Error Message */}
          {inputError && (
            <div className="input-error-message">
              <span>{inputError}</span>
            </div>
          )}

          {/* Result Section */}
          {shortUrl && (
            <div className="result-section">
              <div className="result-group">
                <label>Your short URL</label>
                <div className="result-display">
                  <input type="text" value={shortUrl} readOnly className="result-input" />
                  <button className="copy-btn" onClick={copyToClipboard} title="Copy to clipboard">
                    <span>📋</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* History Section */}
      {history.length > 0 && (
        <section className="history-section" id="history">
          <div className="history-container">
            <div className="history-header">
              <h2>Your Recent Links</h2>
              <button className="clear-btn" onClick={clearHistory}>
                Clear History
              </button>
            </div>
            <div className="history-table">
              <div className="table-header">
                <div className="table-cell">Original URL</div>
                <div className="table-cell">Short URL</div>
                <div className="table-cell">Actions</div>
              </div>
              {history.map((item) => (
                <div key={item.id} className="table-row">
                  <div className="table-cell">
                    <span className="url-text" title={item.original}>
                      {item.original.length > 40
                        ? item.original.substring(0, 40) + "..."
                        : item.original}
                    </span>
                  </div>
                  <div className="table-cell">
                    <code className="short-url">{item.short}</code>
                  </div>
                  <div className="table-cell actions">
                    <button
                      className="action-btn copy"
                      onClick={() => copyHistoryItem(item.short)}
                      title="Copy short URL"
                    >
                      Copy
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => deleteHistoryItem(item.id)}
                      title="Delete"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="app-footer">
        <p>Your URLs are saved locally in your browser · Built with ❤️</p>
      </footer>

      {/* Toast Notification */}
      {toast && (
        <div className={`toast ${toast.type}`}>
          <span className="toast-icon">
            {toast.type === "success" && "✓"}
            {toast.type === "error" && "✕"}
            {toast.type === "info" && "ℹ"}
          </span>
          <div className="toast-message">{toast.message}</div>
          <button className="toast-close" onClick={() => setToast(null)}>
            ×
          </button>
        </div>
      )}
    </div>
  );
}

export default App;