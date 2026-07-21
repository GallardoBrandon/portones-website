// Script mínimo para manejar el formulario y mostrar el año actual
document.addEventListener('DOMContentLoaded', function(){
  const yearEl = document.getElementById('year');
  if(yearEl) yearEl.textContent = new Date().getFullYear();

  const form = document.getElementById('contactForm');
  if(form){
    form.addEventListener('submit', function(e){
      e.preventDefault();
      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const phone = form.phone ? form.phone.value.trim() : '';
      const message = form.message.value.trim();
      if(!name || !email || !message){
        alert('Por favor complete los campos requeridos.');
        return;
      }
      const whatsappNumber = '526671034487'; // Internacional: 52 = México. Cambiar si es necesario.
      const text = `Nuevo contacto desde web%0ANombre: ${name}%0AEmail: ${email}%0ATeléfono: ${phone}%0AMensaje: ${message}`;
      const waUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;
      window.open(waUrl, '_blank');
      alert('Se abrirá WhatsApp para enviar tu mensaje.');
      form.reset();
    });
  }
});