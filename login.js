// login.js
console.log("login.js cargado ✅");

async function login(e) {
  if (e) e.preventDefault();

  const email = document.getElementById('email')?.value.trim();
  const password = document.getElementById('password')?.value.trim();
  const msg = document.getElementById('loginMessage');

  if (msg) msg.textContent = ""; // limpiar mensaje previo

  if (!email || !password) {
    alert("Por favor completa email y contraseña");
    return;
  }

  if (typeof firebase === "undefined" || !firebase.auth) {
    console.error("❌ Firebase no inicializado.");
    alert("Error interno: autenticación no disponible");
    return;
  }

  try {
    const auth = firebase.auth();
    await auth.signInWithEmailAndPassword(email, password);
    console.log("✅ Sesión iniciada");
    window.location.href = "index.html";
  } catch (error) {
    console.error("Error de login:", error);
    if (msg) {
      msg.style.color = "red";
      msg.textContent = "Usuario o contraseña incorrectos";
    } else {
      alert("Usuario o contraseña incorrectos");
    }
  }
}

// Agregar event listener cuando DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  if (form) form.addEventListener("submit", login);
});
