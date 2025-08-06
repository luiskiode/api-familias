import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

// 📌 Inicializar variables de entorno
dotenv.config();

// 📌 Configuración básica
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 📌 Configuración de subida de archivos en memoria
const upload = multer({ storage: multer.memoryStorage() });

// 📌 Inicializar Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// 📌 Configuración para servir el frontend desde la raíz
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(__dirname));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// 📌 Obtener listado de familias
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

// 📌 Registrar nueva familia con archivo opcional
app.post("/familias", upload.single("archivo"), async (req, res) => {
  try {
    const {
      nombres_apellidos,
      dni_solicitante,
      apellido_familia,
      direccion,
      fecha_registro,
      telefono_contacto,
      observaciones
    } = req.body;

    let archivoURL = null;

    // 📌 Subir archivo a Supabase Storage (opcional)
    if (req.file) {
      const nombreArchivo = `${Date.now()}_${req.file.originalname}`;
      const { error: uploadError } = await supabase.storage
        .from("documentosfamilias")
        .upload(nombreArchivo, req.file.buffer, {
          contentType: req.file.mimetype
        });

      if (uploadError) throw uploadError;

      archivoURL = `${supabaseUrl}/storage/v1/object/public/documentosfamilias/${nombreArchivo}`;
    }

    // 📌 Insertar en la base de datos
    const { error: dbError } = await supabase
      .from("familias")
      .insert([{
        nombres_apellidos,
        dni_solicitante,
        apellido_familia,
        direccion,
        fecha_registro,
        telefono_contacto,
        observaciones,
        archivo_url: archivoURL
      }]);

    if (dbError) throw dbError;

    res.status(200).json({
      message: "✅ Familia registrada con éxito",
      archivo: archivoURL
    });
  } catch (error) {
    console.error("🔥 ERROR AL REGISTRAR FAMILIA:", error);
    res.status(500).json({
      error: error.message || error,
      detalles: error
    });
  }
});

// 📌 Puerto de ejecución
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ API funcionando en puerto ${PORT}`);
});
