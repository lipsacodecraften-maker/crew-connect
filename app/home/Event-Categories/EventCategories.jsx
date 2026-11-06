
"use client";

import Link from "next/link";
import Image from "next/image";
import { eventCategories } from "./eventCategoriesData";
import styles from "./EventCategories.module.css";

export default function EventCategoriesSection() {
  const featuredCategories = eventCategories.slice(0, 6);

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.eyebrow}>
              <span className={styles.dot}></span>
              EVENT CATEGORIES
            </span>

            <h2 className={styles.heading}>
              STAFFING FOR EVERY
              <span> KIND OF EVENT.</span>
            </h2>

            <p className={styles.description}>
              From grand celebrations to large-scale productions,
              we provide trained and reliable event professionals
              for every occasion across Gujarat.
            </p>
          </div>
        </div>

        <div className={styles.grid}>
          {featuredCategories.map((category, index) => (
            <article className={styles.card} key={category.title}>
              <div className={styles.imagePlaceholder}>
                <Image
                  src={category.image}
                  alt={category.title}
                  fill
                  sizes="(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 33vw"
                  className={styles.categoryImage}
                  priority={index < 3}
                />

              
              </div>

              <div className={styles.cardContent}>
                <h3>{category.title}</h3>

                <p className={styles.cardDescription}>
                  {category.description}
                </p>

                <div className={styles.roles}>
                  <span className={styles.rolesLabel}>
                    AVAILABLE STAFF
                  </span>

                  <div className={styles.roleList}>
                    {category.roles.map((role) => (
                      <span className={styles.roleTag} key={role}>
                        {role}
                      </span>
                    ))}
                  </div>
                </div>

                <Link
                  href={`/hire-staff?category=${encodeURIComponent(
                    category.title
                  )}`}
                  className={styles.hireLink}
                >
                  HIRE STAFF <span>↗</span>
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className={styles.footer}>
          <div className={styles.footerText}>
            <span>EXPLORE OUR COMPLETE DIRECTORY</span>
            <p>Discover all 12 event staffing categories.</p>
          </div>

          <Link href="/event-categories" className={styles.viewAll}>
            VIEW ALL CATEGORIES <span>↗</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
