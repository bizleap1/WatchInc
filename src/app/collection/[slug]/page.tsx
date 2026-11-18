import { notFound } from "next/navigation";
import { collection, getPieceById } from "@/data/collection";
import WatchDetailClient from "@/app/watch/[id]/WatchDetailClient";
import type { Metadata } from "next";

export function generateStaticParams() {
  return collection.map((item) => ({
    slug: item.id,
  }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const product = getPieceById(params.slug);
  if (!product) {
    return {
      title: "Specimen Not Found — Watch Inc",
    };
  }
  return {
    title: `${product.name} (${product.stone}) — Watch Inc Horlogerie`,
    description: `${product.intention} ${product.line}`,
  };
}

export default function CollectionSlugPage({ params }: { params: { slug: string } }) {
  const product = getPieceById(params.slug);

  if (!product) {
    notFound();
  }

  return <WatchDetailClient product={product} />;
}
