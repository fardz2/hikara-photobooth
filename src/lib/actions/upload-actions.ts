"use server";

import { createClient } from "@/lib/supabase/server";

export async function uploadSiteImage(formData: FormData) {
  const file = formData.get("file") as File;
  if (!file || file.size === 0) return { error: "No file" };

  if (file.size > 2 * 1024 * 1024) return { error: "Max 2MB" };
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
    return { error: "JPEG/PNG/WebP only" };

  const supabase = await createClient();
  const ext = file.name.split(".").pop();
  const path = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage
    .from("site-images")
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) return { error: error.message };

  const { data: urlData } = supabase.storage.from("site-images").getPublicUrl(path);
  return { url: urlData.publicUrl };
}

export async function deleteSiteImage(url: string) {
  const supabase = await createClient();
  const parts = url.split("/");
  const path = decodeURIComponent(parts.pop() || "");

  const { error } = await supabase.storage.from("site-images").remove([path]);
  return error ? { error: error.message } : { success: true };
}
