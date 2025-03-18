export interface ImageFrontEnd {
    file: File;
    description: string;
}

export interface ImageBackEnd {
    id: string;
    url: string;
    alt: string;
    type: string;
    description: string;
    albumId: string;
}

