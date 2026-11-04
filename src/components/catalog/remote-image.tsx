import Image, { type ImageProps } from "next/image";
import { isOptimizable, mediaUrl } from "@/lib/media";

/**
 * Imagen subida por un usuario. Las de Cloudinary pasan por la optimización de next/image (tamaños
 * y formatos modernos); las del almacenamiento local de desarrollo se sirven tal cual (next/image no
 * optimiza IPs locales por seguridad). Si la URL no es válida no se muestra nada.
 */
export function RemoteImage({ src, alt, ...props }: Omit<ImageProps, "src"> & { src: string | null | undefined }) {
  const url = mediaUrl(src);
  if (!url) return null;
  return <Image src={url} alt={alt} unoptimized={!isOptimizable(url)} {...props} />;
}
