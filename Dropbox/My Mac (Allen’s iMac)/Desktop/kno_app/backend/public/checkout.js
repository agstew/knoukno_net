document.addEventListener('DOMContentLoaded', function(){
  const forms = document.querySelectorAll('form.checkout-form');
  forms.forEach(form => {
    form.addEventListener('submit', async function(e){
      e.preventDefault();
      const tier = form.dataset.tier;
      const btn = form.querySelector('button[type="submit"]');
      if (btn) { btn.disabled = true; btn.textContent = 'Please wait...'; }
      try {
        const res = await fetch('/payments/create-checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tier })
        });
        if (!res.ok) throw new Error('Failed to create session');
        const data = await res.json();
        if (data.url) {
          // redirect to Stripe Checkout
          window.location = data.url;
        } else {
          throw new Error('No redirect URL returned');
        }
      } catch (err) {
        console.error(err);
        if (btn) { btn.disabled = false; btn.textContent = 'Buy Now'; }
        alert('Unable to start checkout. Please try again.');
      }
    });
  });
});
