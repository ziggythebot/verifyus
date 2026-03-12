# Embeddable Verification Widget

The VerifyUS verification widget can be embedded on any website using either an iframe or the JavaScript widget loader.

## Method 1: JavaScript Widget (Recommended)

The JavaScript widget provides a simple API for embedding the verification component on your website.

### Installation

Add the widget script to your HTML:

```html
<script src="https://your-domain.com/widget.js"></script>
```

### Basic Usage

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Website</title>
</head>
<body>
  <!-- Widget container -->
  <div id="verifyus-widget"></div>

  <!-- Load widget script -->
  <script src="https://your-domain.com/widget.js"></script>

  <!-- Initialize widget -->
  <script>
    VerifyUS.init({
      containerId: 'verifyus-widget',
      walletAddress: '0x1234...', // Optional
      onVerificationComplete: function(result) {
        console.log('Verification complete:', result);
        // Handle successful verification
      },
      onVerificationError: function(error) {
        console.error('Verification error:', error);
        // Handle verification error
      }
    });
  </script>
</body>
</html>
```

### Configuration Options

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `containerId` | `string` | Yes | `'verifyus-widget'` | ID of the container element |
| `baseUrl` | `string` | No | Current origin | Base URL of the verification service |
| `walletAddress` | `string` | No | `null` | Pre-fill wallet address (optional) |
| `width` | `string` | No | `'100%'` | Widget width (CSS value) |
| `height` | `string` | No | `'600px'` | Widget height (CSS value) |
| `onVerificationComplete` | `function` | No | `null` | Callback when verification succeeds |
| `onVerificationError` | `function` | No | `null` | Callback when verification fails |

### Advanced Example

```javascript
// Initialize widget with all options
const widget = VerifyUS.init({
  containerId: 'my-widget-container',
  baseUrl: 'https://verify.example.com',
  walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  width: '100%',
  height: '700px',
  onVerificationComplete: function(result) {
    // Send verification result to your backend
    fetch('/api/verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ result })
    }).then(response => {
      console.log('Verification saved');
    });
  },
  onVerificationError: function(error) {
    // Show error message to user
    alert('Verification failed: ' + error.message);
  }
});

// Later: update wallet address dynamically
widget.setWalletAddress('0xNewAddress...');

// Later: destroy the widget
widget.destroy();
```

## Method 2: Direct iframe Embedding

You can also embed the verification page directly using an iframe:

```html
<iframe
  src="https://your-domain.com/embed?origin=https://your-site.com"
  width="100%"
  height="600"
  frameborder="0"
  allow="clipboard-read; clipboard-write"
  style="border: none; border-radius: 8px;"
></iframe>
```

### iframe URL Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `origin` | Yes | Your website's origin (for postMessage security) |
| `wallet` | No | Pre-fill wallet address |

### Receiving Messages from iframe

```javascript
window.addEventListener('message', function(event) {
  // Verify message origin
  if (event.origin !== 'https://your-domain.com') {
    return;
  }

  const { type, result, error } = event.data;

  if (type === 'VERIFICATION_COMPLETE') {
    console.log('Verification complete:', result);
  } else if (type === 'VERIFICATION_ERROR') {
    console.error('Verification error:', error);
  }
});
```

## Security Considerations

1. **Origin Validation**: The widget validates postMessage origins to prevent cross-site attacks.

2. **HTTPS Only**: Always use HTTPS in production to protect sensitive data.

3. **Content Security Policy**: Ensure your CSP allows iframes from the verification domain:
   ```
   Content-Security-Policy: frame-src https://your-domain.com
   ```

4. **API Key**: For production deployments, implement API key authentication to prevent unauthorized usage.

## Styling

### Custom Container Styling

You can style the widget container to match your website:

```css
#verifyus-widget {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background: #f9fafb;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
```

### Responsive Design

The widget is responsive by default. For mobile optimization:

```css
#verifyus-widget {
  width: 100%;
  max-width: 600px;
}

@media (max-width: 640px) {
  #verifyus-widget {
    padding: 12px;
  }
}
```

## Testing

### Local Development

For local testing, use:

```javascript
VerifyUS.init({
  containerId: 'verifyus-widget',
  baseUrl: 'http://localhost:3000',  // Local dev server
});
```

### Production

For production, use your deployed domain:

```javascript
VerifyUS.init({
  containerId: 'verifyus-widget',
  baseUrl: 'https://verify.yourdomain.com',
});
```

## Example Integration

See `/examples/widget-demo.html` for a complete working example.

## Support

For issues or questions:
- Email: support@yourcompany.com
- Documentation: https://docs.yourcompany.com
- GitHub: https://github.com/yourcompany/verifyus

## Version

Current widget version: 1.0.0

Check version in JavaScript:
```javascript
console.log(VerifyUS.version);
```
