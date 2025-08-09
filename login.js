// login.js
console.log("login.js cargado ✅");

function login() {
  const email = document.getElementById('email')?.value;
  const password = document.getElementById('password')?.value;
  if (!email || !password) return alert("Completa email y contraseña");

  auth.signInWithEmailAndPassword(email, password)
    .then(() => window.location.href = "index.html")
    .catch(err => {
      console.error(err);
      const msg = document.getElementById('loginMessage');
      if (msg) msg.textContent = "Usuario o contraseña incorrectos";
    });
}
