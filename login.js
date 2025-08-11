// login.js
console.log("login.js cargado ✅");

function login(e) {
  if (e) e.preventDefault(); // Evita recarga

  const email = document.getElementById('email')?.value.trim();
  const password = document.getElementById('password')?.value.trim();

  if (!email || !password) {
    alert("Completa email y contraseña");
    return;
  }

  // Verificar que Firebase Auth está disponible
  if (typeof firebase === "undefined" || !firebase.auth) {
    console.error("❌ Firebase no inicializado.");
    alert("Error interno: autenticación no disponible");
    return;
  }

  const auth = firebase.auth();
  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      console.log("✅ Sesión iniciada");
      window.location.href = "index.html";
    })
    .catch(err => {
      console.error(err);
      const msg = document.getElementById('loginMessage');
      if (msg) msg.textContent = "Usuario o contraseña incorrectos";
    });
}
