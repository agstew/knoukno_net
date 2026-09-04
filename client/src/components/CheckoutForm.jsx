import { useState } from 'react';

const CheckoutForm = ({ tier = 'member', bonus = false, onSuccess, onError }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePayPalCheckout = async () => {
    setLoading(true);
    setError(null);

    try {
      // Step 1: Create PayPal order via API
      const orderResponse = await fetch('/api/payments/paypal/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier, bonus }),
      });

      if (!orderResponse.ok) throw new Error('Failed to create PayPal order');
      const { id: orderId, links } = await orderResponse.json();

      // Step 2: Redirect to PayPal for approval
      const approveLink = links.find(link => link.rel === 'approve');
      if (approveLink) {
        window.location.href = approveLink.href;
      } else {
        throw new Error('No approve link found');
      }
    } catch (err) {
      console.error('PayPal checkout error:', err);
      setError(err.message || 'Failed to process PayPal checkout');
      onError?.(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-form">
      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      <button
        className="btn btn-primary btn-lg w-100"
        onClick={handlePayPalCheckout}
        disabled={loading}
      >
        {loading ? 'Processing...' : 'Continue to PayPal'}
      </button>
    </div>
  );
};

export default CheckoutForm;
