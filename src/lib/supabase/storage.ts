import "server-only";
import { supabaseAdmin } from "./server";

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB — must match scripts/setup-storage.mjs

const PRODUCT_BUCKET = "product-images";
const BANNER_BUCKET = "homepage-banners";

function extensionFor(file: File): string {
  const fromName = file.name.split(".").pop();
  if (fromName && fromName.length <= 5) return fromName.toLowerCase();
  const fromType = file.type.split("/").pop();
  return fromType ?? "jpg";
}

async function uploadImage(file: File, bucket: string, folder: string): Promise<string> {
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error(
      `"${file.name}" is ${(file.size / 1024 / 1024).toFixed(1)}MB — the limit is ${MAX_IMAGE_BYTES / 1024 / 1024}MB.`
    );
  }

  const path = `${folder}/${crypto.randomUUID()}.${extensionFor(file)}`;
  const { error } = await supabaseAdmin.storage.from(bucket).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    throw new Error(`Failed to upload "${file.name}": ${error.message}`);
  }

  const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

function pathFromPublicUrl(url: string, bucket: string): string | null {
  const marker = `/storage/v1/object/public/${bucket}/`;
  const index = url.indexOf(marker);
  if (index === -1) return null;
  return url.slice(index + marker.length);
}

async function deleteImages(urls: string[], bucket: string): Promise<void> {
  const paths = urls.map((u) => pathFromPublicUrl(u, bucket)).filter((p): p is string => !!p);
  if (paths.length === 0) return;
  const { error } = await supabaseAdmin.storage.from(bucket).remove(paths);
  if (error) {
    console.error(`Failed to delete storage objects from "${bucket}":`, error.message);
  }
}

export function uploadProductImage(file: File, productId: string): Promise<string> {
  return uploadImage(file, PRODUCT_BUCKET, productId);
}

export function deleteProductImages(urls: string[]): Promise<void> {
  return deleteImages(urls, PRODUCT_BUCKET);
}

export function uploadBannerImage(file: File, section: string): Promise<string> {
  return uploadImage(file, BANNER_BUCKET, section);
}

export function deleteBannerImages(urls: string[]): Promise<void> {
  return deleteImages(urls, BANNER_BUCKET);
}
