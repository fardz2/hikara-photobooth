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

  const prefix = `/storage/v1/object/public/${BUCKET}/`;
  const idx = url.indexOf(prefix);
  if (idx === -1) return { error: "URL tidak valid" };

  const path = url.slice(idx + prefix.length);
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) return { error: error.message };
  return { success: true };
}

export async function replaceSiteImage(
  oldUrl: string | null | undefined,
  file: File,
  folder = "general",
) {
  if (oldUrl) await deleteSiteImage(oldUrl);
  return uploadSiteImage(file, folder);
}
