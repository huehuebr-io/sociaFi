import fetch from "node-fetch";
import FormData from "form-data";

export async function uploadToHueHueBR(file) {
  const form = new FormData();
  form.append("file", file.buffer, {
    filename: file.originalname,
    contentType: file.mimetype
  });

  const res = await fetch(
    "https://huehuebr.io/api/upload-meme.php",
    {
      method: "POST",
      body: form
    }
  );

  const json = await res.json();

  if (!json.success) {
    throw new Error("Falha ao enviar imagem para huehuebr.io");
  }

  return json.url;
}
