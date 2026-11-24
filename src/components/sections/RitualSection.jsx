"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import styles from "./RitualSection.module.css";

export default function RitualSection() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !window.IntersectionObserver || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        section.classList.add(styles.visible);
        observer.disconnect();
      }
    }, { threshold: 0.12 });
    section.classList.add(styles.ready);
    observer.observe(section);
    return () => {
      observer.disconnect();
      section.classList.remove(styles.ready);
    };
  }, []);

  return (
    <section ref={sectionRef} id="ritual" aria-labelledby="ritual-heading" className={styles.section}>
      <div className={styles.layout}>
        <div className={styles.visual}>
          <Image src="/images/ritual-editorial.webp" alt="Concept still life of a rose-quartz-dial Cherish watch beside a blank card on linen" fill sizes="(max-width: 767px) 100vw, 55vw" className={styles.image} />
        </div>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>The energising ritual</p>
          <h2 id="ritual-heading" className={styles.heading}>Set apart for you.</h2>
          <p className={styles.description}>Before it ships, your watch is energised by hand by our in house certified spiritual healer. The ritual is recorded on a dated card with your dial number, so you know who set this watch apart for you, and when.</p>
          <p className={styles.record}>Your dial number. Your practitioner. Your ritual date.</p>
        </div>
      </div>
    </section>
  );
}
