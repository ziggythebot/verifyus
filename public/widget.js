/**
 * VerifyUS Embeddable Widget
 *
 * Usage:
 * <div id="verifyus-widget"></div>
 * <script src="https://your-domain.com/widget.js"></script>
 * <script>
 *   VerifyUS.init({
 *     containerId: 'verifyus-widget',
 *     walletAddress: '0x1234...', // Optional
 *     onVerificationComplete: (result) => {
 *       console.log('Verification complete:', result);
 *     },
 *     onVerificationError: (error) => {
 *       console.error('Verification error:', error);
 *     }
 *   });
 * </script>
 */

(function (window) {
  'use strict';

  function getDefaultBaseUrl() {
    const script =
      document.currentScript ||
      Array.from(document.getElementsByTagName('script')).find((entry) =>
        entry.src && entry.src.includes('widget.js')
      );

    if (script && script.src) {
      try {
        return new URL(script.src).origin;
      } catch {
        // Fall back to host page origin
      }
    }

    return window.location.origin;
  }

  // Default configuration
  const DEFAULT_CONFIG = {
    baseUrl: getDefaultBaseUrl(),
    containerId: 'verifyus-widget',
    width: '100%',
    height: '600px',
    walletAddress: null,
    onVerificationComplete: null,
    onVerificationError: null,
  };

  /**
   * VerifyUS Widget Class
   */
  class VerifyUSWidget {
    constructor(config) {
      this.config = { ...DEFAULT_CONFIG, ...config };
      this.iframe = null;
      this.container = null;
      this.messageHandler = null;
      this.baseOrigin = new URL(this.config.baseUrl, window.location.href).origin;
    }

    /**
     * Initialize the widget
     */
    init() {
      // Get container element
      this.container = document.getElementById(this.config.containerId);
      if (!this.container) {
        console.error(`Container element #${this.config.containerId} not found`);
        return;
      }

      // Build iframe URL with parameters
      const iframeUrl = new URL('/embed', this.config.baseUrl);
      iframeUrl.searchParams.set('origin', window.location.origin);

      if (this.config.walletAddress) {
        iframeUrl.searchParams.set('wallet', this.config.walletAddress);
      }

      // Create iframe
      this.iframe = document.createElement('iframe');
      this.iframe.src = iframeUrl.toString();
      this.iframe.style.width = this.config.width;
      this.iframe.style.height = this.config.height;
      this.iframe.style.border = 'none';
      this.iframe.style.borderRadius = '8px';
      this.iframe.setAttribute('allow', 'clipboard-read; clipboard-write');

      // Append iframe to container
      this.container.appendChild(this.iframe);

      // Listen for messages from iframe
      this.setupMessageListener();
    }

    /**
     * Set up message listener for iframe communication
     */
    setupMessageListener() {
      this.messageHandler = (event) => {
        // Verify message origin matches baseUrl
        if (event.origin !== this.baseOrigin) {
          return;
        }

        const { type, result, error } = event.data;

        switch (type) {
          case 'VERIFICATION_COMPLETE':
            if (this.config.onVerificationComplete) {
              this.config.onVerificationComplete(result);
            }
            break;

          case 'VERIFICATION_ERROR':
            if (this.config.onVerificationError) {
              const errorObj = new Error(error.message);
              errorObj.name = error.name;
              this.config.onVerificationError(errorObj);
            }
            break;

          default:
            // Unknown message type
            break;
        }
      };

      window.addEventListener('message', this.messageHandler);
    }

    /**
     * Destroy the widget
     */
    destroy() {
      if (this.iframe && this.container) {
        this.container.removeChild(this.iframe);
        this.iframe = null;
      }

      if (this.messageHandler) {
        window.removeEventListener('message', this.messageHandler);
        this.messageHandler = null;
      }
    }

    /**
     * Update wallet address
     */
    setWalletAddress(walletAddress) {
      this.config.walletAddress = walletAddress;
      // Reload iframe with new wallet address
      if (this.iframe) {
        this.destroy();
        this.init();
      }
    }
  }

  /**
   * Public API
   */
  window.VerifyUS = {
    /**
     * Initialize a new widget
     */
    init: function (config) {
      const widget = new VerifyUSWidget(config);
      widget.init();
      return widget;
    },

    /**
     * Widget version
     */
    version: '1.0.0',
  };
})(window);
