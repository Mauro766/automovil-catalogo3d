import { useEffect, useRef } from "react";
import gsap from "gsap";
import Header from "./Header";
import "../../styles/hero.css";

interface HeroProps {
  number_vehicle: number;
  version: string;
  motor: string;
}

export default function Hero({ number_vehicle, version, motor }: HeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  // Animación de entrada inicial del Hero al cargar
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header entra desde arriba
      gsap.fromTo(
        ".hero-container .header",
        { y: -40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, ease: "power3.out", delay: 0.2 }
      );

      // Badge con el número de vehículo entra con escala y fade
      gsap.fromTo(
        ".number_vehicle",
        { scale: 0.7, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.8, ease: "back.out(1.7)", delay: 0.35 }
      );

      // Descripción del vehículo (versión y motor) entra desde la derecha
      gsap.fromTo(
        ".descripcion_vehicle",
        { x: 40, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.8, ease: "power3.out", delay: 0.4 }
      );

      // Párrafo descriptivo principal entra desde abajo hacia arriba
      gsap.fromTo(
        ".hero-description-wrapper",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, ease: "power3.out", delay: 0.45 }
      );

      // Botón "Let's talk?" entra desde abajo a la derecha
      gsap.fromTo(
        ".contact-description-wrapper",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, ease: "power3.out", delay: 0.5 }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Animación sutil con GSAP cuando cambia el vehículo (número, versión, motor)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const ctx = gsap.context(() => {
      // Animar el número cuando rota de auto
      gsap.fromTo(
        ".number_vehicle h3",
        { y: -10, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" }
      );

      // Animar los datos de versión y motor
      gsap.fromTo(
        ".descripcion_vehicle p",
        { x: 15, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.4, stagger: 0.08, ease: "power2.out" }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [number_vehicle, version, motor]);

  return (
    <div className="hero-container" ref={containerRef}>
      <Header />

      <div className="number_vehicle">
        <h3>{String(number_vehicle).padStart(2, "0")}</h3>
      </div>
      <div className="descripcion_vehicle">
        <p>
          <span>VERSIÓN</span>
          {String(version).padStart(2, "0")}
        </p>
        <p>
          <span>MOTOR</span>
          {String(motor).padStart(2, "0")}
        </p>
      </div>

      <div className="hero-description-wrapper">
        <p className="hero-description">
          DEALPUSH IS AN AWARD-WINNING AUTOMOTIVE CATALOG.
          WE PARTNER WITH DEALERS AND DRIVERS TO CURATE AND
          DELIVER VEHICLES, DEALS, AND EXPERIENCES — FROM
          FIRST SEARCH TO INTELLIGENT BUYING SYSTEMS.
        </p>
      </div>

      <div className="contact-description-wrapper">
        <div className="contact-description">
          <h3>Let´s talk?</h3>
        </div>
      </div>
    </div>
  );
}
