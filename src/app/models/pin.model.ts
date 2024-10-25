export interface Pin {
  id: string;
  title: string;
  imageId: number | null;
  fileName?: string;
  collaborators: string[];
  collaboratorNames: string;
  privacy: 'public' | 'private';
}
