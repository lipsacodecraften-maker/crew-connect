import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { eventCategories } from "../home/Event-Categories/eventCategoriesData";
import styles from "./EventCategories.module.css";

export const metadata: Metadata = {
  title: "Event Categories | CrewConnect Gujarat",
  description:
    "Explore professional event staffing solutions for weddings, corporate events, exhibitions, concerts, festivals and more across Gujarat.",
};

export default function EventCategoriesPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.breadcrumb}>
            <Link href="/">HOME</Link>
            <span>/</span>
            <span>EVENT CATEGORIES</span>
          </div>

          <div className={styles.heroContent}>
            <div>
              <h1>
                FIND THE RIGHT CREW
                <span> FOR YOUR EVENT.</span>
              </h1>
              <div className={styles.headingRight}>
                <p>
                  Every event has different staffing requirements. Explore our event categories and discover reliable, trained professionals for your next event across Gujarat.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.categoriesSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <div>
              <span className={styles.eyebrow}>EXPLORE OUR SERVICES</span>
              <h2>EVENT CATEGORIES</h2>
              <p>
                Professional manpower solutions designed around your event type and operational needs.
              </p>
            </div>

            <span className={styles.totalCount}>
              SHOWING {eventCategories.length} CATEGORIES
            </span>
          </div>

          <div className={styles.grid}>
            {eventCategories.map((category, index) => (
              <article className={styles.card} key={category.title}>
                <div className={styles.imagePlaceholder}>
                  <Image
                    src={category.image}
                    alt={category.title}
                    fill
                    sizes="(max-width: 700px) 100vw, (max-width: 1000px) 50vw, 33vw"
                    className={styles.categoryImage}
                    priority={index < 3}
                  />
                </div>

                <div className={styles.cardContent}>
                  <h3>{category.title}</h3>

                  <p className={styles.cardDescription}>{category.description}</p>

                  <div className={styles.roles}>
                    <span className={styles.rolesHeading}>AVAILABLE STAFFING ROLES</span>

                    <div className={styles.roleList}>
                      {category.roles.map((role) => (
                        <span className={styles.roleTag} key={role}>
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>

                  <Link
                    href={`/hire-manpower?category=${encodeURIComponent(category.title)}`}
                    className={styles.hireButton}
                  >
                    <span>HIRE STAFF FOR THIS EVENT</span>
                    <span className={styles.arrow}>↗</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <div className={styles.ctaContent}>
            <span className={styles.eyebrow}>READY TO BUILD YOUR EVENT TEAM?</span>

            <h2>
              LET&apos;S PUT THE
              <span> RIGHT CREW TO WORK.</span>
            </h2>

            <p>
              Tell us about your event and staffing requirements. Our team will help you find the right professionals.
            </p>

            <Link href="/hire-manpower" className={styles.ctaButton}>
              REQUEST STAFF NOW
              <span>↗</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
