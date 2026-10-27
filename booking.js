(() => {
  const form = document.querySelector('#booking-form');
  const button = form.querySelector('[type="submit"]');
  const label = button.querySelector('.submit-label');
  const status = document.querySelector('#booking-status');
  const name = form.elements.namedItem('name');
  let sending = false;

  function showStatus(message, state) {
    status.textContent = message;
    status.dataset.state = state;
    status.hidden = false;
  }

  form.addEventListener('input', event => {
    event.target.removeAttribute('aria-invalid');
    if (event.target === name) name.setCustomValidity('');
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending) return;
    name.setCustomValidity(name.value.trim() ? '' : 'Indica o teu nome.');
    if (!form.reportValidity()) return;
    form.querySelectorAll('[aria-invalid]').forEach(field => field.removeAttribute('aria-invalid'));
    const data = new FormData(form);
    data.set('name', name.value.trim());
    sending = true;
    button.disabled = true;
    label.textContent = 'A enviar…';
    form.setAttribute('aria-busy', 'true');
    showStatus('A enviar o teu pedido…', 'sending');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
        signal: controller.signal
      });
      const result = await response.json().catch(() => null);
      if (response.ok) {
        form.reset();
        showStatus('Pedido enviado! O salão entrará em contacto contigo para combinar os detalhes. A tua marcação só fica confirmada após essa resposta.', 'success');
      } else {
        if (Array.isArray(result?.errors)) {
          result.errors.forEach(error => {
            const field = form.elements.namedItem(error.field);
            if (field?.setAttribute) field.setAttribute('aria-invalid', 'true');
          });
        }
        const message = response.status === 429
          ? 'O formulário está temporariamente indisponível. Tenta novamente mais tarde.'
          : response.status === 422 || response.status === 400
            ? 'Não foi possível enviar o pedido. Verifica os campos e tenta novamente.'
            : 'Não foi possível enviar o pedido neste momento. Os teus dados continuam no formulário; tenta novamente mais tarde.';
        showStatus(message, 'error');
      }
    } catch {
      showStatus('Não foi possível confirmar o envio. Verifica a tua ligação à Internet e tenta novamente quando estiver disponível. Os teus dados continuam no formulário.', 'error');
    } finally {
      clearTimeout(timeout);
      sending = false;
      button.disabled = false;
      label.textContent = 'Enviar pedido';
      form.removeAttribute('aria-busy');
      status.focus({ preventScroll: true });
    }
  });
})();
