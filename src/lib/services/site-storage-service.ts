import "server-only";
import { createClient } from "@/lib/supabase/server";

const BUCKET = "site-images";

export async function uploadSiteImage(file: File, folder = "general") {
  const supabase = await createClient();

  const ext = file.name.split(".").pop() || "jpg";
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (error) return { error: error.message };

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, path };
}

export async function deleteSiteImage(url: string) {
  const supabase = await createClient();

  // Extract path from Supabase public URL using URL parser
  // Format: https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path>
  try {
    const parsed = new URL(url);
    const prefix = `/storage/v1/object/public/${BUCKET}/`;
    const idx = parsed.pathname.indexOf(prefix);
    if (idx === -1) return { error: "URL tidak valid" };

    const path = parsed.pathname.slice(idx + prefix.length);
    const { error } = await supabase.storage.from(BUCKET).remove([path]);
    if (error) return { error: error.message };
    return { success: true };
  } catch {
    return { error: "URL tidak valid" };
  }
}

export async function replaceSiteImage(
  oldUrl: string | null | undefined,
  file: File,
  folder = "general",
) {
  if (oldUrl) {
    const result = await deleteSiteImage(oldUrl);
    if (result.error && result.error !== "URL tidak valid") {
      return { error: `Gagal menghapus file lama: ${result.error}` };
    }
  }
  return uploadSiteImage(file, folder);
}
