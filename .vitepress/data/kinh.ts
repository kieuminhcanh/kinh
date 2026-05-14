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
    image: "/kinh/images/kinh-dieu-phap-lien-hoa.jpg",
    description: "28 phẩm — Pháp Hoa Kinh",
    chapters: true,
  },
  {
    slug: "kinh-dia-tang",
    title: "Kinh Địa Tạng",
    image: "/kinh/images/kinh-dia-tang.jpg",
    author: "Hòa thượng Thích Trí Tịnh",
    description: "13 phẩm",
    chapters: true,
  },
  {
    slug: "kinh-duoc-su",
    title: "Kinh Dược Sư",
    image: "/kinh/images/kinh-duoc-su.jpg",
    chapters: false,
  },
  {
    slug: "kinh-pho-hien",
    title: "Kinh Hạnh Nguyện Phổ Hiền",
    image: "/kinh/images/kinh-hanh-nguyen-pho-hien.jpg",
    author: "Hòa thượng Thích Trí Tịnh",
    chapters: false,
  },
  {
    slug: "khai-kinh",
    title: "Nghi Thức Khai Kinh",
    image: "/kinh/images/khai-kinh.jpg",
    chapters: false,
  },
  {
    slug: "nghi-thuc-cong-phu-khuya",
    title: "Nghi Thức Công Phu Khuya",
    image: "/kinh/images/nghi-thuc-cong-phu-khuya.jpg",
    chapters: false,
  },
];

export function findKinhBySlug(slug: string): KinhMeta | undefined {
  return kinhCatalog.find((k) => k.slug === slug);
}
