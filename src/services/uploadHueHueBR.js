/**
 * Upload do meme para huehuebr.io (Hostinger)
 * Node 18+ / 22 usa fetch NATIVO
 */
export async function uploadToHueHueBR(file) {
  if (!file?.buffer) {
    throw new Error("Arquivo inválido para upload");
  }

  const form = new FormData();

  form.append(
    "file",
    new Blob([file.buffer], { type: file.mimetype }),
    file.originalname
  );

  const res = await fetch(
    "https://huehuebr.io/api/upload-meme.php",
    {
      method: "POST",
      body: form
    }
  );

  if (!res.ok) {
    throw new Error("Falha HTTP ao enviar imagem");
  }

  const json = await res.json();

  if (!json.success || !json.url) {
    throw new Error("Falha ao enviar imagem para huehuebr.io");
  }

  return json.url;
}
