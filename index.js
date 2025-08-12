// index.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ CORS dinámico (permitir solo orígenes confiables)
const allowedOrigins = [
  "https://luiskiode.github.io",
  "http://localhost:3000",
  "http://127.0.0.1:3000"
];
app.use(cors({
  origin: function(origin, callback) {
    // Permite requests sin origen (como Postman o CURL)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `El CORS para el origen ${origin} no está permitido.`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));

const upload = multer({ storage: multer.memoryStorage() });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Las variables SUPABASE_URL y SUPABASE_KEY deben estar definidas en .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Servir archivos estáticos desde /public
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.send("✅ Backend Cáritas CNC activo");
});

// 📌 Obtener familias
app.get("/familias", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("familias")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error("❌ Error al obtener familias:", error);
      return res.status(500).json({ error: error.message || error });
    }

    res.json(data);
  } catch (error) {
    console.error("🔥 Error inesperado al obtener familias:", error);
    res.status(500).json({ error: error.message || error });
  }
});

// 📌 Registrar familia con archivo opcional
app.post("/familias", upload.single("archivo"), async (req, res) => {
  try {
    // Campos obligatorios
    const camposObligatorios = [
      "nombres_apellidos",
      "dni_solicitante",
      "apellido_familia",
      "direccion",
      "fecha_registro",
      "telefono_contacto"
    ];

    for (const campo of camposObligatorios) {
      if (!req.body[campo] || req.body[campo].trim() === "") {
        return res.status(400).json({ error: `Falta el campo obligatorio: ${campo}` });
      }
    }

    let archivoURL = null;

    if (req.file) {
      const nombreArchivoSeguro = `${Date.now()}_${req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

      // Eliminar archivo si ya existe antes de subir (opcional)
      // await supabase.storage.from("documentosfamilias").remove([nombreArchivoSeguro]);

      const { error: uploadError } = await supabase.storage
        .from("documentosfamilias")
        .upload(nombreArchivoSeguro, req.file.buffer, {
          contentType: req.file.mimetype,
          cacheControl: "3600",
          upsert: false
        });

      if (uploadError) {
        console.error("❌ Error al subir archivo:", uploadError);
        return res.status(500).json({ error: "Error al subir el archivo." });
      }

      archivoURL = `${supabaseUrl}/storage/v1/object/public/documentosfamilias/${nombreArchivoSeguro}`;
    }

    // Insertar en base de datos
    const { error: dbError } = await supabase
      .from("familias")
      .insert([{ ...req.body, archivo_url: archivoURL }]);

    if (dbError) {
      console.error("❌ Error al insertar familia:", dbError);
      return res.status(500).json({ error: dbError.message || dbError });
    }

    res.status(200).json({ message: "✅ Familia registrada correctamente.", archivo: archivoURL });
  } catch (error) {
    console.error("🔥 ERROR AL REGISTRAR FAMILIA:", error);
    res.status(500).json({ error: error.message || error });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ API escuchando en http://localhost:${PORT}`);
});
