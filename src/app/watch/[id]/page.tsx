import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { collection, getPieceById } from "@/data/collection";
import WatchDetailClient from "./WatchDetailClient";

interface PageProps {
  params: {
    id: string;
  };
}

export function generateStaticParams() {
  return collection.map((item) => ({
    id: item.id,
  }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const piece = getPieceById(params.id);
  if (!piece) {
    return {
      title: "Specimen Not Found — Watch Inc",
    };
  }

  return {
    title: `${piece.name} — ${piece.stone} Dial Timepiece | Watch Inc`,
    description: `${piece.line} Numbered limited edition of 300 natural stone dials cut from raw ${piece.mineralDetails.mineralogy.toLowerCase()}.`,
    openGraph: {
      title: `${piece.name} (${piece.stone}) — Watch Inc Horlogerie`,
      description: piece.line,
      images: [piece.images.model],
    },
  };
}

export default function WatchPage({ params }: PageProps) {
  const piece = getPieceById(params.id);
  if (!piece) {
    notFound();
  }

  return <WatchDetailClient product={piece} />;
}
