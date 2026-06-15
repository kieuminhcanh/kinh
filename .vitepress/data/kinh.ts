/**
 * Catalog of available kinh.
 * Order = display order on home page.
 */
export type KinhMeta = {
  slug: string;
  title: string;
  image: string;
  author?: string;
  description?: string;
  chapters: boolean; // true = multi-chapter (has split files), false = single file
};

export const kinhCatalog: KinhMeta[] = [
  {
    slug: "kinh-dieu-phap-lien-hoa",
    title: "Kinh Diệu Pháp Liên Hoa",
    image: "/images/kinh-dieu-phap-lien-hoa.jpg",
    description: "28 phẩm — Pháp Hoa Kinh",
    chapters: true,
  },
  {
    slug: "kinh-dia-tang",
    title: "Kinh Địa Tạng",
    image: "/images/kinh-dia-tang.jpg",
    author: "Hòa thượng Thích Trí Tịnh",
    description: "13 phẩm",
    chapters: true,
  },
  {
    slug: "kinh-dai-thua-vo-luong-tho",
    title: "Kinh Đại Thừa Vô Lượng Thọ",
    image: "/images/kinh-dai-thua-vo-luong-tho.jpg",
    author: "HT. Thích Đức Niệm & Cư sĩ Minh Chánh",
    description: "48 phẩm — bản hội tập Hạ Liên Cư",
    chapters: true,
  },
  {
    slug: "kinh-dai-thua-vo-luong-nghia",
    title: "Kinh Đại Thừa Vô Lượng Nghĩa",
    image: "/images/kinh-dai-thua-vo-luong-nghia.jpg",
    author: "Tỳ-kheo Thích Tuệ Hải",
    description: "3 phẩm — Khai kinh của Pháp Hoa",
    chapters: true,
  },
  {
    slug: "kinh-duoc-su",
    title: "Kinh Dược Sư",
    image: "/images/kinh-duoc-su.jpg",
    chapters: false,
  },
  {
    slug: "kinh-pho-hien",
    title: "Kinh Hạnh Nguyện Phổ Hiền",
    image: "/images/kinh-hanh-nguyen-pho-hien.jpg",
    author: "Hòa thượng Thích Trí Tịnh",
    chapters: false,
  },
  {
    slug: "khai-kinh",
    title: "Nghi Thức Khai Kinh",
    image: "/images/khai-kinh.jpg",
    chapters: false,
  },
  {
    slug: "nghi-thuc-cong-phu-khuya",
    title: "Nghi Thức Công Phu Khuya",
    image: "/images/nghi-thuc-cong-phu-khuya.jpg",
    chapters: false,
  },
];

export function findKinhBySlug(slug: string): KinhMeta | undefined {
  return kinhCatalog.find((k) => k.slug === slug);
}
