import Image from "next/image";
import Link from "next/link";
import { staffingCategories } from "./staffingData.js";
import styles from "./StaffingServices.module.css";

export default function StaffingServices() {
  return (
    <section className={styles.section} id="staffing-services">
      <div className={styles.container}>

        {/* SECTION HEADER */}
        <div className={styles.header}>
          <div className={styles.headingLeft}>
            <span className={styles.eyebrow}>
              <span className={styles.dot}></span>
              OUR STAFFING SERVICES
            </span>

            <h2>
              <span>STAFFING SOLUTIONS FOR EVERY EVENT.</span>
            </h2>
          </div>

          <div className={styles.headingRight}>
            <p>
              From elegant weddings to large-scale concerts, we provide
              professional manpower and reliable staffing solutions
              for every kind of event.
            </p>

            {/* <span className={styles.categoryCount}>
              04 SPECIALIZED CATEGORIES
            </span> */}
          </div>
        </div>

        {/* CATEGORY CARDS */}
        <div className={styles.grid}>
          {staffingCategories.map((category) => (
            <Link
              href={`/services#${category.id}`}
              className={styles.card}
              key={category.id}
            >
              <div className={styles.imageWrapper}>
                <Image
                  src={category.image}
                  alt={category.imageAlt}
                  fill
                  sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 50vw"
                  className={styles.image}
                />

                <div className={styles.imageOverlay}></div>

                {/* <span className={styles.number}>
                  {category.number}
                </span> */}

                <span className={styles.imageLabel}>
                  CREW CATEGORY
                </span>
              </div>

              <div className={styles.cardContent}>
                <div className={styles.cardTop}>
                  <span className={styles.subtitle}>
                    {category.subtitle}
                  </span>

                  <span className={styles.arrow}>↗</span>
                </div>

                <h3>{category.title}</h3>

                <p>{category.description}</p>

                <div className={styles.cardFooter}>
                  <span>
                    EXPLORE SERVICES
                  </span>

                  <span className={styles.footerArrow}>→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* BOTTOM CTA */}
        <div className={styles.bottomBar}>
          <div>
            <h3>Looking for the right event workforce?</h3>
            <p>
              Explore our complete staffing capabilities and find
              the right professionals for your event.
            </p>
          </div>

          <Link href="/services" className={styles.viewAll}>
            VIEW ALL SERVICES <span>↗</span>
          </Link>
        </div>

      </div>
    </section>
  );
}