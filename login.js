console.log("login.js cargado ✅");

async function login(e) {
  if (e) e.preventDefault();

  const email = document.getElementById("email")?.value.trim();
  const password = document.getElementById("password")?.value.trim();
  const msg = document.getElementById("loginMessage");
  const btn = document.querySelector("#loginForm button[type=submit]");

  if (msg) {
    msg.textContent = "";
    msg.style.color = "";
  }

  if (!email || !password) {
    if (msg) {
      msg.style.color = "red";
      msg.textContent = "Por favor completa email y contraseña.";
    }
    return;
  }

  if (!firebase?.auth) {
    console.error("❌ Firebase no inicializado.");
    alert("Error interno: autenticación no disponible");
    return;
  }

  try {
    if (btn) btn.disabled = true;

    const auth = firebase.auth();
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    const user = userCredential.user;

    console.log("✅ Sesión iniciada", user.email);

    // 🔒 Restringir acceso solo a admin
    if (user.email !== "admin@caritas.com") {
      await auth.signOut();
      if (msg) {
        msg.style.color = "red";
        msg.textContent = "No tienes permisos para acceder.";
      }
      return;
    }

    if (msg) {
      msg.style.color = "green";
      msg.textContent = "Inicio de sesión exitoso. Redirigiendo...";
    }
    setTimeout(() => (window.location.href = "index.html"), 1000);
  } catch (error) {
    console.error("Error de login:", error);
    if (msg) {
      msg.style.color = "red";
      if (error.code === "auth/user-not-found") {
        msg.textContent = "Usuario no registrado.";
      } else if (error.code === "auth/wrong-password") {
        msg.textContent = "Contraseña incorrecta.";
      } else {
        msg.textContent = "Error al iniciar sesión.";
      }
    }
  } finally {
    if (btn) btn.disabled = false;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  if (form) form.addEventListener("submit", login);
});
