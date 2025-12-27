export interface GalleryItem {
    id: number;
    frontImage: string;
    backImage: string;
    title: string;
    prompt: string;
    genre: string;
}

export const galleryItems: GalleryItem[] = Array.from({ length: 50 }, (_, i) => {
    const num = (i + 1).toString().padStart(2, '0');
    return {
        id: i + 1,
        frontImage: `/gallery/cover_${num}_front_final.png`,
        backImage: `/gallery/cover_${num}_back_final.png`,
        title: `Cover Design ${i + 1}`,
        prompt: "Prompt coming soon...", // You can update these later
        genre: "General"
    };
});
