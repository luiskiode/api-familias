import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import bodyParser from "body-parser";
import multer from "multer";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

// Inicializar
dotenv.config();
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Para manejar subida de archivos
const upload = multer({ storage: multer.memoryStorage() });

// Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Rutas para servir frontend
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// 📌 Obtener familias
app.get("/familias", async (req, res) => {
  const { data, error } = await supabase
    .from("familias")
    .select("*")
    .order("id", { ascending: false });

  if (error) return res.status(500).json(error);
  res.json(data);
});

// 📌 Insertar familia con archivo
app.post("/familias", upload.single("archivo"), async (req, res) => {
  try {
    const { nombres_apellidos, dni_solicitante, apellido_familia, fecha_registro, telefono_contacto, observaciones } = req.body;
    let archivoURL = null;

    if (req.file) {
      const nombreArchivo = Date.now() + "_" + req.file.originalname;

      const { error: uploadError } = await supabase.storage
        .from("documentosfamilias")
        .upload(nombreArchivo, req.file.buffer, {
          contentType: req.file.mimetype
        });

      if (uploadError) throw uploadError;

      archivoURL = `${supabaseUrl}/storage/v1/object/public/documentosfamilias/${nombreArchivo}`;
    }

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

// 📌 Puerto dinámico
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ API funcionando en puerto ${PORT}`);
});
