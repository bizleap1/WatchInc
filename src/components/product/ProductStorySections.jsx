"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";
import { collection } from "@/data/collection";
import { SITE_CONFIG } from "@/data/site-config";
import { useStore } from "@/store/useStore";
import styles from "./ProductStorySections.module.css";

export default function ProductStorySections({ product }) {
  const openWaitlist = useStore((state) => state.openWaitlist);
  const [filmAvailable, setFilmAvailable] = useState(false);
  const [showFilm, setShowFilm] = useState(false);
  const otherPieces = collection.filter((item) => item.id !== product.id);
  const join = () => openWaitlist(product.id);
  useEffect(() => {
    let active = true;
    setFilmAvailable(false); setShowFilm(false);
    fetch("/api/films/status").then((r) => r.ok ? r.json() : { available: [] }).then((data) => {
      if (active) setFilmAvailable(Array.isArray(data.available) && data.available.includes(product.id));
    }).catch(() => {});
    return () => { active = false; };
  }, [product.id]);
  return <div className={styles.page} style={{ paddingTop: 0, paddingBottom: 0 }}>
      <section className={styles.story} aria-labelledby="stone-story"><div className={styles.texture}><Image src={product.images.dialMacro} alt={`${product.stone} natural mineral texture`} fill sizes="(max-width: 900px) 100vw, 55vw" className={styles.cover} /></div><div className={styles.editorialCopy}><p className={styles.eyebrow}>THE STONE, UP CLOSE</p><h2 id="stone-story" className="font-serif">Nature never<br />repeats itself.</h2><p>{product.mineralDetails?.veiningDescription}. Each natural stone carries its own variations in tone and pattern.</p><p className={`${styles.quote} font-serif`}>{product.line || product.intention}</p><small>Stone meanings belong to cultural and crystal traditions.</small></div></section>

      {filmAvailable && <section className={styles.film} aria-labelledby="film-title"><div className={styles.sectionHeading}><p className={styles.eyebrow}>IN MOTION</p><h2 id="film-title" className="font-serif">A closer look at {product.name}.</h2></div>{showFilm ? <video key={product.id} className={styles.video} controls autoPlay playsInline preload="metadata" poster={`/videos/${product.id}-poster.jpg`} src={`/videos/${product.id}.mp4`} /> : <button className={styles.filmPoster} onClick={() => setShowFilm(true)} type="button" aria-label={`Play the ${product.name} film`}><Image src={product.images.moody} alt="" fill sizes="100vw" className={styles.contain} /><span><Play size={20} fill="currentColor" /> Watch the film</span></button>}</section>}

      <section className={styles.details} aria-labelledby="details-title"><div className={styles.sectionHeading}><p className={styles.eyebrow}>LOOK A LITTLE CLOSER</p><h2 id="details-title" className="font-serif">Details worth noticing.</h2></div><div className={styles.detailGrid}>{[
        { title: "The dial", src: product.images.dialMacro, copy: `Natural ${product.stone.toLowerCase()}, with a pattern individual to the stone.`, contain: false },
        { title: "The silhouette", src: product.images.moody, copy: "A 38mm case, viewed from a different perspective.", contain: true },
        { title: "The bracelet", src: product.images.front, copy: "A metal bracelet that completes the timepiece.", contain: true },
      ].map((item) => <article key={item.title}><div className={styles.detailImage}><Image src={item.src} alt={`${product.name} — ${item.title}`} fill sizes="(max-width: 600px) 86vw, 33vw" className={item.contain ? styles.contain : styles.cover} /></div><h3 className="font-serif">{item.title}</h3><p>{item.copy}</p></article>)}</div></section>

      <section className={styles.ritual} aria-labelledby="ritual-title"><p className={styles.eyebrow}>THE RITUAL BEFORE THE JOURNEY</p><h2 id="ritual-title" className="font-serif">More than a moment.<br /><em>A personal tradition.</em></h2><p>Before your watch leaves us, its stone is energized as a ritual. The accompanying record keeps that moment with your timepiece.</p><Link href="/#ritual">Discover the ritual</Link></section>

      <section className={styles.specifications} aria-labelledby="specs-title"><div><p className={styles.eyebrow}>THE ESSENTIALS</p><h2 id="specs-title" className="font-serif">The watch,<br />in detail.</h2></div><dl>{[["Model", product.name], ["Case diameter", "38mm"], ["Dial", product.stone], ["Bracelet", "Metal bracelet"], ["Ritual", "Performed before dispatch"], ["Optional add-on", "Selenite resting plate"]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></section>

      <section className={styles.box} aria-labelledby="box-title"><div className={styles.boxImage}><Image src={SITE_CONFIG.images.presentationBox} alt="Watch Inc presentation box" fill sizes="(max-width: 900px) 100vw, 55vw" className={styles.contain} /></div><div className={styles.editorialCopy}><p className={styles.eyebrow}>IN THE BOX</p><h2 id="box-title" className="font-serif">The beginning<br />of your ritual.</h2><ul><li>Your {product.name} timepiece</li><li>Watch Inc presentation box</li><li>The accompanying ritual record</li></ul><p className={styles.small}>Selenite resting plate is an optional add-on at checkout.</p><button type="button" onClick={join} className={styles.textButton}>Join the Waitlist</button></div></section>

      <section className={styles.related} aria-labelledby="related-title"><div className={styles.relatedHeading}><div><p className={styles.eyebrow}>ANOTHER STONE, ANOTHER STORY</p><h2 id="related-title" className="font-serif">Find what speaks to you.</h2></div><Link href="/watches">Explore the collection</Link></div><div className={styles.relatedGrid}>{otherPieces.map((other) => <Link href={`/watch/${other.id}`} key={other.id} className={styles.relatedCard}><div><Image src={other.images.front} alt={`${other.name}, ${other.stone} watch`} fill sizes="(max-width: 600px) 68vw, 20vw" className={styles.contain} /></div><small>{other.stone}</small><h3 className="font-serif">{other.name}</h3></Link>)}</div></section>
  </div>;
}
