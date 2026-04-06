import React from "react";
import { motion } from "framer-motion";
import "./FeaturesSection.css";

const features = [
  {
    id: "engine",
    number: "01",
    title: "W16 Quad-Turbo",
    subtitle: "Power Plant",
    description:
      "Hand-assembled over 7 weeks by a single engineer. Sixteen cylinders, four turbochargers, 1,479 horsepower — the most powerful production engine ever built.",
    stat: "1,479 HP",
    statSub: "Peak output",
    img: "/feat-engine.png",
    imgAlt: "Bugatti Chiron W16 engine internals exposed",
  },
  {
    id: "aero",
    number: "02",
    title: "Active Aerodynamics",
    subtitle: "Aero System",
    description:
      "The rear wing — 3D-printed from titanium — continuously adjusts between 0° and 49°. At 400 km/h it generates 440 kg of downforce, pressing the car into the tarmac.",
    stat: "440 kg",
    statSub: "Peak downforce",
    img: "/feat-aero.png",
    imgAlt: "Bugatti Chiron aerodynamic highlights with cyan outline",
  },
  {
    id: "chassis",
    number: "03",
    title: "Carbon Monocoque",
    subtitle: "Structure",
    description:
      "The entire passenger cell weighs just 103 kg, yet achieves 50,000 Nm/degree of torsional stiffness. Six layers of hand-laid CFRP form a cage that cannot be bent.",
    stat: "103 kg",
    statSub: "Cell weight",
    img: "/feat-chassis.png",
    imgAlt: "Bugatti Chiron body panels exploding off to reveal monocoque",
  },
  {
    id: "brakes",
    number: "04",
    title: "Brembo Brakes",
    subtitle: "Stopping Power",
    description:
      "Carbon-ceramic discs front and rear, clamped by 8-piston calipers. The system halts the car from 400 km/h to zero in under 9 seconds.",
    stat: "9 sec",
    statSub: "400→0 km/h",
    img: "/feat-brakes.png",
    imgAlt: "Bugatti Chiron fully disassembled with brake discs and calipers visible",
  },
  {
    id: "wheels",
    number: "05",
    title: "Michelin Cup 2R",
    subtitle: "Contact Patch",
    description:
      "Purpose-built for 500 km/h — a world record tyre. Mounted on centre-lock forged aluminium rims, they require warming blankets before track use to activate the compound.",
    stat: "500 km/h",
    statSub: "Tyre rating",
    img: "/feat-wheels.png",
    imgAlt: "Bugatti Chiron complete teardown revealing wheels and mechanical components",
  },
];

/* Heading word-by-word split animation */
function AnimatedHeading({ children, className, delay = 0 }) {
  const words = children.split(" ");
  return (
    <h2 className={className} aria-label={children}>
      {words.map((word, i) => (
        <span key={i} className="feat-word-wrap">
          <motion.span
            className="feat-word"
            initial={{ y: "110%", opacity: 0 }}
            whileInView={{ y: "0%", opacity: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{
              duration: 0.75,
              delay: delay + i * 0.08,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {word}
          </motion.span>
          {i < words.length - 1 && " "}
        </span>
      ))}
    </h2>
  );
}

export default function FeaturesSection() {
  return (
    <section className="features" id="features">
      {/* Header */}
      <div className="features-header">
        <motion.span
          className="eyebrow"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          Engineering Highlights
        </motion.span>

        <div className="features-title-wrap">
          <AnimatedHeading className="features-title" delay={0.05}>
            Built Without
          </AnimatedHeading>
          <AnimatedHeading className="features-title features-title--thin" delay={0.2}>
            Compromise
          </AnimatedHeading>
        </div>

        <motion.p
          className="features-desc"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.65, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          Five defining systems. Each engineered to the absolute limit of what
          physics permits.
        </motion.p>
      </div>

      {/* Cards — staggered reveal */}
      <div className="features-grid">
        {features.map((feat, i) => (
          <motion.article
            key={feat.id}
            className="feat-card"
            initial={{ opacity: 0, y: 48, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{
              duration: 0.75,
              delay: (i % 3) * 0.12,
              ease: [0.22, 1, 0.36, 1],
            }}
            whileHover={{ y: -8, transition: { duration: 0.3 } }}
          >
            {/* Photo */}
            <div className="feat-card__visual">
              <motion.img
                src={feat.img}
                alt={feat.imgAlt}
                className="feat-card__img"
                loading="lazy"
                draggable={false}
                initial={{ scale: 1.08 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>

            {/* Body */}
            <div className="feat-card__body">
              <span className="feat-card__number">{feat.number}</span>
              <div className="feat-card__titles">
                <p className="feat-card__subtitle">{feat.subtitle}</p>
                <h3 className="feat-card__title">{feat.title}</h3>
              </div>
              <p className="feat-card__desc">{feat.description}</p>

              {/* Animated stat line */}
              <motion.div
                className="feat-card__stat"
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.06 }}
              >
                <span className="feat-card__stat-value">{feat.stat}</span>
                <span className="feat-card__stat-sub">{feat.statSub}</span>
              </motion.div>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
