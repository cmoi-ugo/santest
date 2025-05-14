import { ASSETS } from '@/services/constants';

/**
 * Construit le chemin complet pour une image à partir d'un chemin relatif
 * @param relativePath - Chemin relatif de l'image ou URL complète
 * @param defaultImage - Image par défaut à utiliser en cas de chemin manquant
 * @returns Le chemin complet de l'image
 */
export const getImagePath = (
  relativePath: string | undefined | null,
  defaultImage: string = ASSETS.DEFAULT_IMAGES.QUIZ
): string => {
  if (!relativePath) return defaultImage;
  
  // Si c'est déjà une URL complète
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return relativePath;
  }
  
  // Si c'est un chemin relatif commençant par un slash
  if (relativePath.startsWith('/')) {
    return `${ASSETS.IMAGES_BASE_URL}${relativePath}`;
  }
  
  // Sinon, ajouter un slash entre la base URL et le chemin relatif
  return `${ASSETS.IMAGES_BASE_URL}/${relativePath}`;
};

/**
 * Vérifie si une image existe et peut être chargée
 * @param imagePath - Chemin de l'image à vérifier
 * @returns Promise<boolean> - true si l'image peut être chargée, false sinon
 */
export const checkImageExists = (imagePath: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = imagePath;
  });
};

/**
 * Précharge une image pour améliorer les performances d'affichage
 * @param imagePath - Chemin de l'image à précharger
 */
export const preloadImage = (imagePath: string): void => {
  const img = new Image();
  img.src = imagePath;
};

/**
 * Convertit une image en base64
 * @param file - Fichier image à convertir
 * @returns Promise<string> - Image encodée en base64
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};