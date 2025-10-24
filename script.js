 const typeEl = document.getElementById('type');
    const textBlock = document.getElementById('text-input-block');
    const locBlock = document.getElementById('location-input-block');
    const textEl = document.getElementById('text');
    const latEl = document.getElementById('lat');
    const lngEl = document.getElementById('lng');
    const useLocationBtn = document.getElementById('use-location');
    const makeGeoBtn = document.getElementById('make-geo-link');
    const sizeEl = document.getElementById('size');
    const generateBtn = document.getElementById('generate');
    const clearBtn = document.getElementById('clear');
    const canvas = document.getElementById('qr-canvas');
    const downloadLink = document.getElementById('download-link');
    const copyBtn = document.getElementById('copy-text');
    const payloadPreview = document.getElementById('payload-preview');

    // Switch between text and location input
    typeEl.addEventListener('change', () => {
      if (typeEl.value === 'text') {
        textBlock.style.display = '';
        locBlock.style.display = 'none';
      } else {
        textBlock.style.display = 'none';
        locBlock.style.display = '';
      }
    });

    // Use current location
    useLocationBtn.addEventListener('click', () => {
      if (!navigator.geolocation) {
        alert('Geolocation not supported in this browser.');
        return;
      }
      useLocationBtn.textContent = 'Locating…';
      navigator.geolocation.getCurrentPosition(pos => {
        latEl.value = pos.coords.latitude.toFixed(6);
        lngEl.value = pos.coords.longitude.toFixed(6);
        useLocationBtn.textContent = 'Use my location';
      }, err => {
        alert('Could not get location: ' + err.message);
        useLocationBtn.textContent = 'Use my location';
      }, { enableHighAccuracy: true, timeout: 10000 });
    });

    // Make Navigation QR
    makeGeoBtn.addEventListener('click', () => {
      const lat = latEl.value.trim();
      const lng = lngEl.value.trim();
      if (!lat || !lng) {
        alert('Enter both latitude and longitude (or use my location).');
        return;
      }
      const mapsNavUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
      textEl.value = mapsNavUrl;
      typeEl.value = 'text';
      textBlock.style.display = '';
      locBlock.style.display = 'none';
      payloadPreview.textContent = 'Created payload: ' + mapsNavUrl;
    });

    // Generate QR
    generateBtn.addEventListener('click', async () => {
      let payload = '';
      const size = parseInt(sizeEl.value) || 300;

      if (typeEl.value === 'text') {
        payload = textEl.value.trim();
        if (!payload) {
          alert('Enter text or URL to encode.');
          return;
        }
      } else {
        const lat = latEl.value.trim();
        const lng = lngEl.value.trim();
        if (!lat || !lng) {
          alert('Enter latitude and longitude or use your location.');
          return;
        }
        // Direct navigation link
        payload = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
      }

      payloadPreview.textContent = 'Payload: ' + payload;

      try {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.width = size;
        canvas.height = size;

        await QRCode.toCanvas(canvas, payload, {
          width: size,
          margin: 1
        });

        downloadLink.href = canvas.toDataURL('image/png');
        downloadLink.download = 'qrcode.png';
      } catch (err) {
        console.error(err);
        alert('Failed to create QR: ' + err);
      }
    });

    // Clear fields
    clearBtn.addEventListener('click', () => {
      textEl.value = '';
      latEl.value = '';
      lngEl.value = '';
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      payloadPreview.textContent = '';
    });

    // Copy payload
    copyBtn.addEventListener('click', async () => {
      let payload = payloadPreview.textContent.replace(/^Payload:\s*/, '');
      if (!payload) {
        if (typeEl.value === 'text') payload = textEl.value.trim();
        else payload = `https://www.google.com/maps/dir/?api=1&destination=${latEl.value.trim()},${lngEl.value.trim()}`;
      }
      if (!payload) {
        alert('No payload to copy');
        return;
      }
      try {
        await navigator.clipboard.writeText(payload);
        copyBtn.textContent = 'Copied!';
        setTimeout(() => copyBtn.textContent = 'Copy payload', 1200);
      } catch (e) {
        alert('Clipboard failed: ' + e);
      }
    });

    // Ctrl+Enter shortcut
    textEl.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        generateBtn.click();
      }
    });
