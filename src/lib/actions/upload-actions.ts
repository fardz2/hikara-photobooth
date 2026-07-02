"use server";

import { getCurrentUser } from "@/lib/services/auth-service";
import {
  deleteSiteImage,
  replaceSiteImage,
  uploadSiteImage,
} from "@/lib/services/site-storage-service";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 2 * 1024 * 1024; // 2MB

export async function uploadImage(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const file = formData.get("file") as File;
  if (!file || file.size === 0) return { error: "Tidak ada file" };
  if (!ALLOWED_TYPES.includes(file.type))
    return { error: "Tipe file harus JPEG/PNG/WebP" };
  if (file.size > MAX_SIZE) return { error: "File maksimal 2MB" };

  const folder = (formData.get("folder") as string) || "general";
  return uploadSiteImage(file, folder);
}

export async function deleteImage(url: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  return deleteSiteImage(url);
}

export async function replaceImage(
  oldUrl: string | null | undefined,
  formData: FormData,
) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const file = formData.get("file") as File;
  if (!file || file.size === 0) return { error: "Tidak ada file" };
  if (!ALLOWED_TYPES.includes(file.type))
    return { error: "Tipe file harus JPEG/PNG/WebP" };
  if (file.size > MAX_SIZE) return { error: "File maksimal 2MB" };

  const folder = (formData.get("folder") as string) || "general";
  return replaceSiteImage(oldUrl, file, folder);
}
