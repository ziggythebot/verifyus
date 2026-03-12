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

  // Default configuration
  const DEFAULT_CONFIG = {
    baseUrl: window.location.origin,
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
      const params = new URLSearchParams({
        origin: window.location.origin,
      });

      if (this.config.walletAddress) {
        params.append('wallet', this.config.walletAddress);
      }

      const iframeUrl = `${this.config.baseUrl}/embed?${params.toString()}`;

      // Create iframe
      this.iframe = document.createElement('iframe');
      this.iframe.src = iframeUrl;
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
      window.addEventListener('message', (event) => {
        // Verify message origin matches baseUrl
        if (event.origin !== this.config.baseUrl) {
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
      });
    }

    /**
     * Destroy the widget
     */
    destroy() {
      if (this.iframe && this.container) {
        this.container.removeChild(this.iframe);
        this.iframe = null;
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
