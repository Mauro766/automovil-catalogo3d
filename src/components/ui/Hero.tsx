
import Header from "./Header";
import "../../styles/hero.css";

interface HeroProps {
  number_vehicle: number;
  version: string;
  motor: string;
}

export default function Hero({ number_vehicle, version, motor }: HeroProps) {    return (
        <div className="hero-container">
            <Header />

            <div className="number_vehicle">
                <h3>{String(number_vehicle).padStart(2, '0')}
                </h3>
            </div>
            <div className="descripcion_vehicle">
                <p>
                    <span>VERSIÓN</span>
                    {String(version).padStart(2, '0')}
                </p>
                <p>
                    <span>MOTOR</span>
                    {String(motor).padStart(2, '0')}
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
