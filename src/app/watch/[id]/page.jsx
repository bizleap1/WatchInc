import { notFound, redirect } from "next/navigation";
import { collection, getPieceById } from "@/data/collection";
export function generateStaticParams() {
    return collection.map((item) => ({
        id: item.id,
    }));
}
export function generateMetadata({ params }) {
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
export default function WatchPage({ params }) {
    const piece = getPieceById(params.id);
    if (!piece) {
        notFound();
    }
    // The product detail now lives in the side drawer on /watches.
    // Old links (footer, product popup, shared URLs) land there with this watch open.
    redirect(`/watches?open=${piece.id}`);
}