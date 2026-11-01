// Datos de contacto verificados contra linktr.ee/hectordavidbaldo.pas — no
// inventar otros: si cambian, actualizar acá (única fuente de verdad de las
// páginas públicas: landing y /ramas).
export const WHATSAPP_NUMBER = "5493406415230";
export const WHATSAPP_DISPLAY = "(3406) 41-5230";
export const WHATSAPP_HREF = (msg: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
export const INSTAGRAM_HREF = "https://www.instagram.com/baldo.seguros";
export const FACEBOOK_HREF = "https://www.facebook.com/profile.php?id=100027309113999";
export const EMAIL = "hectordavidbaldo.pas@gmail.com";
// "Compartir con un amigo": abre WhatsApp sin destinatario, con el link a la web.
export const SHARE_HREF = `https://api.whatsapp.com/send?text=${encodeURIComponent(
  "Mirá la página de Baldo Seguros: seguros para autos, hogar, comercio, vida y más 👉 https://baldoseguros.vercel.app",
)}`;
