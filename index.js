import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(cors());
app.use(express.json());

// Variables de entorno
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Conexión a Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

// Obtener todas las familias
app.get("/familias", async (req, res) => {
  const { data, error } = await supabase.from("familias").select("*");
  if (error) return res.status(500).json(error);
  res.json(data);
});

// Agregar familia
app.post("/familias", async (req, res) => {
  const { nombre, direccion, telefono } = req.body;
  const { data, error } = await supabase
    .from("familias")
    .insert([{ nombre, direccion, telefono }]);
  if (error) return res.status(500).json(error);
  res.json(data);
});

app.listen(3000, () => console.log("API funcionando en puerto 3000"));