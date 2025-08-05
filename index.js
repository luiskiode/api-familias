
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });



import dotenv from "dotenv";
dotenv.config();


import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// 🔹 Configura con tus variables de entorno de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// 📌 Ruta de prueba
app.get("/", (req, res) => {
  res.send("API de familias funcionando ✅");
});

// 📌 Obtener todas las familias
app.get("/familias", async (req, res) => {
  const { data, error } = await supabase
    .from("familias")
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    return res.status(500).json(error);
  }
  res.json(data);
});

// 📌 Insertar nueva familia (campos nuevos)
app.post("/familias", async (req, res) => {
  const { 
    nombres_apellidos,
    dni_solicitante,
    apellido_familia,
    fecha_registro,
    telefono_contacto,
    observaciones
  } = req.body;

  const { data, error } = await supabase
    .from("familias")
    .insert([{
      nombres_apellidos,
      dni_solicitante,
      apellido_familia,
      fecha_registro,
      telefono_contacto,
      observaciones
    }]);

  if (error) {
    return res.status(500).json(error);
  }
  res.json(data);
});

// 📌 Puerto dinámico para Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ API funcionando en puerto ${PORT}`);
});


<script>
document.getElementById("formFamilia").addEventListener("submit", async function(e) {
    e.preventDefault();

    const formData = new FormData(this);

    const mensaje = document.getElementById("mensaje");
    mensaje.textContent = "⏳ Enviando...";
    mensaje.style.color = "blue";

    try {
        const response = await fetch("https://api-familias.onrender.com/familias", {
            method: "POST",
            body: formData
        });

        if (response.ok) {
            mensaje.textContent = "✅ Registro guardado con éxito";
            mensaje.style.color = "green";
            this.reset();
        } else {
            mensaje.textContent = "❌ Error al guardar";
            mensaje.style.color = "red";
        }
    } catch (error) {
        mensaje.textContent = "❌ Error de conexión";
        mensaje.style.color = "red";
    }
});
</script>

app.post("/familias", upload.single("archivo"), async (req, res) => {
    try {
        const { nombres_apellidos, dni_solicitante, apellido_familia, fecha_registro, telefono_contacto, observaciones } = req.body;

        let archivoURL = null;

        // Si el usuario adjuntó archivo
        if (req.file) {
            const nombreArchivo = Date.now() + "_" + req.file.originalname;

            const { data, error } = await supabase.storage
                .from("documentos_familias")
                .upload(nombreArchivo, req.file.buffer, {
                    contentType: req.file.mimetype
                });

            if (error) throw error;

            archivoURL = `${process.env.SUPABASE_URL}/storage/v1/object/public/documentos_familias/${nombreArchivo}`;
        }

        // Guardar en la base de datos junto con la URL del archivo
        const { error: dbError } = await supabase
            .from("familias")
            .insert([{
                nombres_apellidos,
                dni_solicitante,
                apellido_familia,
                fecha_registro,
                telefono_contacto,
                observaciones,
                archivo_url: archivoURL
            }]);

        if (dbError) throw dbError;

        res.status(200).json({ message: "Familia registrada con éxito", archivo: archivoURL });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al registrar familia" });
    }
});
