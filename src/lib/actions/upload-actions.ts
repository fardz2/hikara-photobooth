"use server";

import {
  deleteSiteImage,
  replaceSiteImage,
  uploadSiteImage,
} from "@/lib/services/site-storage-service";

export async function uploadImage(formData: FormData) {
  const file = formData.get("file") as File;
  if (!file || file.size === 0) return { error: "Tidak ada file" };

  const folder = (formData.get("folder") as string) || "general";
  return uploadSiteImage(file, folder);
}

export async function deleteImage(url: string) {
  return deleteSiteImage(url);
}

export async function replaceImage(
  oldUrl: string | null | undefined,
  formData: FormData,
) {
  const file = formData.get("file") as File;
  if (!file || file.size === 0) return { error: "Tidak ada file" };

  const folder = (formData.get("folder") as string) || "general";
  return replaceSiteImage(oldUrl, file, folder);
}
