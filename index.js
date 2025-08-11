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

// ✅ CORS dinámico (permite GitHub Pages y localhost)
app.use(cors({
  origin: [
    "https://luiskiode.github.io",
    "http://localhost:3000",
    "http://127.0.0.1:3000"
  ]
}));

const upload = multer({ storage: multer.memoryStorage() });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.send("✅ Backend Cáritas CNC activo");
});

// 📌 Obtener familias
app.get("/familias", async (req, res) => {
  const { data, error } = await supabase
    .from("familias")
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    console.error("❌ Error al obtener familias:", error);
    return res.status(500).json(error);
  }
  res.json(data);
});

// 📌 Registrar familia
app.post("/familias", upload.single("archivo"), async (req, res) => {
  try {
    const campos = [
      "nombres_apellidos", "dni_solicitante", "apellido_familia",
      "direccion", "fecha_registro", "telefono_contacto"
    ];
    for (const campo of campos) {
      if (!req.body[campo]) {
        return res.status(400).json({ error: `Falta el campo ${campo}` });
      }
    }

    let archivoURL = null;
    if (req.file) {
      const nombreArchivoSeguro = `${Date.now()}_${req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const { error: uploadError } = await supabase.storage
        .from("documentosfamilias")
        .upload(nombreArchivoSeguro, req.file.buffer, {
          contentType: req.file.mimetype
        });

      if (uploadError) throw uploadError;
      archivoURL = `${supabaseUrl}/storage/v1/object/public/documentosfamilias/${nombreArchivoSeguro}`;
    }

    const { error: dbError } = await supabase
      .from("familias")
      .insert([{ ...req.body, archivo_url: archivoURL }]);

    if (dbError) throw dbError;

    res.status(200).json({ message: "✅ Familia registrada", archivo: archivoURL });
  } catch (error) {
    console.error("🔥 ERROR AL REGISTRAR FAMILIA:", error);
    res.status(500).json({ error: error.message || error });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ API en http://localhost:${PORT}`);
});
