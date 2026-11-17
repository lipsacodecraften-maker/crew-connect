"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { staffingCategories } from "../home/Staffing/staffingData";
import styles from "./Services.module.css";

export default function ServicesPage() {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [showAll, setShowAll] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleShowAll = (id: string) => {
    setShowAll((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroContent}>
            <div className={styles.heroMain}>
              <h1>
                OUR PEOPLE.
                <br />
                <span>YOUR EVENT.</span>
              </h1>

              <p>
                The right team makes every event exceptional. From weddings and exhibitions to concerts and corporate gatherings, we provide dependable event professionals across Gujarat.
              </p>

              <div className={styles.heroActions}>
                <Link href="/hire-manpower" className={styles.heroButton}>
                  HIRE EVENT STAFF <span>↗</span>
                </Link>

                <a href="#wedding-manpower" className={styles.heroTextLink}>
                  EXPLORE OUR SERVICES <span>↓</span>
                </a>
              </div>
            </div>

            <div className={styles.heroSide}>
              <span className={styles.heroSideNumber}>01</span>

              <div className={styles.heroSideLine}></div>

              <h2>
                PEOPLE
                <br />
                POWERING
                <br />
                <span>EXPERIENCES.</span>
              </h2>

              <p>
                Professional manpower. Reliable coordination. Seamless event execution.
              </p>

              <div className={styles.heroLocation}>
                <span className={styles.locationDot}></span>
                SERVING ACROSS GUJARAT, INDIA
              </div>
            </div>
          </div>
        </div>
      </section>

      <nav className={styles.quickNav} aria-label="Staffing categories">
        <div className={styles.quickNavInner}>
          {staffingCategories.map((category) => (
            <a key={category.id} href={`#${category.id}`} className={styles.quickLink}>
              <span>{category.number}</span>
              {category.title}
              <span className={styles.quickArrow}>↗</span>
            </a>
          ))}
        </div>
      </nav>

      <div className={styles.categories}>
        {staffingCategories.map((category, index) => (
          <section className={styles.category} id={category.id} key={category.id}>
            <div className={`${styles.categoryHeader} ${index % 2 === 1 ? styles.reverse : ""}`}>
              <div className={styles.categoryImage}>
                <Image
                  src={category.image}
                  alt={category.imageAlt}
                  fill
                  sizes="(max-width: 700px) 100vw, 40vw"
                  className={styles.categoryPhoto}
                />

                <div className={styles.imageShade}></div>
              </div>

              <div className={styles.categoryInfo}>
                <span className={styles.categoryLabel}>
                  CATEGORY {category.number} / {category.subtitle}
                </span>

                <h2>{category.title}</h2>

                <p>{category.description}</p>

                <div className={styles.categoryMeta}>
                  <div>
                    <strong>{String(category.services.length).padStart(2, "0")}</strong>
                    <span>AVAILABLE STAFFING ROLES</span>
                  </div>

                  <button
                    type="button"
                    className={styles.categoryHire}
                    onClick={() => toggleExpand(category.id)}
                  >
                    EXPLORE AVAILABLE ROLES <span>{expanded[category.id] ? "↑" : "↓"}</span>
                  </button>
                </div>
              </div>
            </div>

            {expanded[category.id] && (
              <>
                <div className={styles.servicesHeading}>
                  <div>
                    <h3>Explore Available Roles</h3>
                  </div>
                </div>

                <div className={`${styles.serviceGrid} ${styles.expandIn}`}>
                  {(showAll[category.id] ? category.services : category.services.slice(0, 6)).map((service) => (
                    <article className={styles.serviceCard} key={service.name}>
                    {(service as any).image ? (
                      <div className={styles.serviceImage}>
                        <Image
                          src={(service as any).image}
                          alt={service.name}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className={styles.servicePhoto}
                        />
                      </div>
                    ) : null}

                    <h4>{service.name}</h4>

                      <p>{service.description}</p>

                      <Link
                        href={`/hire-manpower?service=${encodeURIComponent(service.name)}&category=${encodeURIComponent(category.title)}`}
                        className={styles.hireLink}
                      >
                        HIRE NOW
                        <span>→</span>
                      </Link>
                    </article>
                  ))}

                  {category.services.length > 6 && (
                    <div style={{ gridColumn: "1 / -1", textAlign: "right" }}>
                      <button
                        type="button"
                        className={styles.showMoreButton}
                        onClick={() => toggleShowAll(category.id)}
                      >
                        {showAll[category.id] ? "SHOW LESS" : "SHOW MORE"} <span>{showAll[category.id] ? "↑" : "↓"}</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </section>
        ))}
      </div>

      <section className={styles.finalCta}>
        <div className={styles.finalCtaInner}>
          <span className={styles.categoryLabel}>LET&apos;S BUILD YOUR EVENT TEAM</span>

          <h2>
            YOUR EVENT NEEDS
            <br />
            <span>THE RIGHT PEOPLE.</span>
          </h2>

          <p>
            Tell us about your event, staffing requirements and expected team size. Our team will help you find the right manpower.
          </p>

          <Link href="/hire-manpower" className={styles.finalButton}>
            REQUEST STAFF NOW <span>↗</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
