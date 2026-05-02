import { supabase } from "@/lib/supabase";
import * as FileSystem from "expo-file-system";
import { decode } from "base64-arraybuffer";

const IMAGE_CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  heic: "image/heic",
};

export async function uploadInvoiceAsset(
  uri: string,
  userId: string,
): Promise<string> {
  if (!userId || userId === "anonymous") {
    throw new Error("Please sign in before uploading a logo.");
  }

  const fileName = uri.split("/").pop()?.split("?")[0];
  const rawExt = fileName?.split(".").pop()?.toLowerCase() ?? "jpg";
  const fileExt = rawExt === "jpeg" ? "jpg" : rawExt;
  const contentType = IMAGE_CONTENT_TYPES[fileExt] ?? "image/jpeg";
  const path = `${userId}/invoice-logos/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}.${fileExt}`;

  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: "base64",
  });

  const { error } = await supabase.storage
    .from("invoice-assets")
    .upload(path, decode(base64), {
      cacheControl: "31536000",
      contentType,
      upsert: true,
    });

  if (error) {
    throw error;
  }

  const { data: publicUrlData } = supabase.storage
    .from("invoice-assets")
    .getPublicUrl(path);

  return publicUrlData.publicUrl;
}
