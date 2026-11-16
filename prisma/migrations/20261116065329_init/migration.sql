-- CreateTable
CREATE TABLE "booking_requests" (
    "id" TEXT NOT NULL,
    "tracking_token" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'received',
    "client_company_name" TEXT NOT NULL,
    "contact_person" TEXT NOT NULL,
    "mobile_number" TEXT NOT NULL,
    "whatsapp_number" TEXT NOT NULL,
    "email_address" TEXT NOT NULL,
    "company_type" TEXT NOT NULL,
    "event_name" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "event_city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "venue_address" TEXT NOT NULL,
    "maps_location" TEXT,
    "event_start_date" TEXT NOT NULL,
    "event_end_date" TEXT NOT NULL,
    "reporting_time" TEXT NOT NULL,
    "duty_start_time" TEXT NOT NULL,
    "duty_end_time" TEXT NOT NULL,
    "guest_count" INTEGER NOT NULL,
    "budget_per_person" DOUBLE PRECISION NOT NULL,
    "food_provided" BOOLEAN NOT NULL,
    "transport_provided" BOOLEAN NOT NULL,
    "accommodation_provided" BOOLEAN NOT NULL,
    "dress_code" TEXT NOT NULL,
    "language_requirements" TEXT NOT NULL,
    "additional_notes" TEXT,
    "urgent" BOOLEAN NOT NULL DEFAULT false,
    "reference_file_name" TEXT,
    "reference_file_type" TEXT,
    "reference_file_size" INTEGER,
    "reference_file_data" BYTEA,
    "total_staff" INTEGER NOT NULL,
    "created_at" TEXT NOT NULL,
    "updated_at" TEXT NOT NULL,

    CONSTRAINT "booking_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staffing_requirements" (
    "id" SERIAL NOT NULL,
    "booking_id" TEXT NOT NULL,
    "role_index" INTEGER NOT NULL,
    "staff_role" TEXT NOT NULL,
    "gender_preference" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "work_date" TEXT NOT NULL,
    "reporting_time" TEXT NOT NULL,
    "shift_duration" DOUBLE PRECISION NOT NULL,
    "experience_requirement" TEXT NOT NULL,
    "uniform_requirement" TEXT NOT NULL,
    "special_instructions" TEXT,

    CONSTRAINT "staffing_requirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_status_events" (
    "id" SERIAL NOT NULL,
    "booking_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "note" TEXT,
    "created_at" TEXT NOT NULL,

    CONSTRAINT "booking_status_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_notifications" (
    "id" SERIAL NOT NULL,
    "booking_id" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "recipient_type" TEXT NOT NULL,
    "recipient" TEXT,
    "status" TEXT NOT NULL,
    "provider" TEXT,
    "subject" TEXT,
    "error" TEXT,
    "created_at" TEXT NOT NULL,

    CONSTRAINT "booking_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_registrations" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending_review',
    "full_name" TEXT NOT NULL,
    "mobile_number" TEXT NOT NULL,
    "whatsapp_verified" BOOLEAN NOT NULL DEFAULT false,
    "email_address" TEXT NOT NULL,
    "date_of_birth" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "current_city" TEXT NOT NULL,
    "area_pincode" TEXT NOT NULL,
    "languages" TEXT NOT NULL,
    "skills" TEXT NOT NULL,
    "other_skill" TEXT,
    "experience_level" TEXT NOT NULL,
    "years_experience" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "previous_events" TEXT,
    "expected_payment" DOUBLE PRECISION NOT NULL,
    "preferred_cities" TEXT NOT NULL,
    "available_from" TEXT NOT NULL,
    "available_until" TEXT NOT NULL,
    "shift_types" TEXT NOT NULL,
    "willing_to_travel" BOOLEAN NOT NULL,
    "transport_available" BOOLEAN NOT NULL,
    "profile_photo_name" TEXT NOT NULL,
    "profile_photo_type" TEXT NOT NULL,
    "profile_photo_size" INTEGER NOT NULL,
    "profile_photo_data" BYTEA NOT NULL,
    "documents_consent" BOOLEAN NOT NULL DEFAULT false,
    "privacy_consent" BOOLEAN NOT NULL,
    "terms_consent" BOOLEAN NOT NULL,
    "age_confirmed" BOOLEAN NOT NULL,
    "created_at" TEXT NOT NULL,
    "updated_at" TEXT NOT NULL,

    CONSTRAINT "staff_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_documents" (
    "id" SERIAL NOT NULL,
    "registration_id" TEXT NOT NULL,
    "document_kind" TEXT NOT NULL,
    "document_type" TEXT,
    "file_name" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "encrypted_data" BYTEA NOT NULL,
    "created_at" TEXT NOT NULL,

    CONSTRAINT "staff_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_status_events" (
    "id" SERIAL NOT NULL,
    "registration_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "note" TEXT,
    "created_at" TEXT NOT NULL,

    CONSTRAINT "staff_status_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_otp_challenges" (
    "id" SERIAL NOT NULL,
    "mobile_number" TEXT NOT NULL,
    "code_hash" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "expires_at" TEXT NOT NULL,
    "verified_at" TEXT,
    "verification_token_hash" TEXT,
    "verification_expires_at" TEXT,
    "consumed_at" TEXT,
    "created_at" TEXT NOT NULL,

    CONSTRAINT "staff_otp_challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_listings" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "event_type" TEXT NOT NULL,
    "job_role" TEXT NOT NULL,
    "event_city" TEXT NOT NULL,
    "event_date" TEXT NOT NULL,
    "end_date" TEXT,
    "duty_start_time" TEXT,
    "duty_end_time" TEXT,
    "duty_hours" DOUBLE PRECISION,
    "payment_min" DOUBLE PRECISION,
    "payment_max" DOUBLE PRECISION,
    "openings" INTEGER NOT NULL DEFAULT 1,
    "experience_required" TEXT NOT NULL DEFAULT 'Any',
    "summary" TEXT,
    "booking_ref" TEXT,
    "requirement_ref" INTEGER,
    "created_at" TEXT NOT NULL,
    "updated_at" TEXT NOT NULL,
    "published_at" TEXT,

    CONSTRAINT "job_listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_applications" (
    "id" TEXT NOT NULL,
    "listing_id" TEXT NOT NULL,
    "registration_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'submitted',
    "note" TEXT,
    "created_at" TEXT NOT NULL,
    "updated_at" TEXT NOT NULL,

    CONSTRAINT "job_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_application_events" (
    "id" SERIAL NOT NULL,
    "application_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "note" TEXT,
    "created_at" TEXT NOT NULL,

    CONSTRAINT "job_application_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "booking_requests_tracking_token_key" ON "booking_requests"("tracking_token");

-- CreateIndex
CREATE INDEX "idx_bookings_email" ON "booking_requests"("email_address");

-- CreateIndex
CREATE INDEX "idx_staffing_booking_id" ON "staffing_requirements"("booking_id");

-- CreateIndex
CREATE INDEX "idx_status_events_booking_id" ON "booking_status_events"("booking_id");

-- CreateIndex
CREATE INDEX "idx_notifications_booking_id" ON "booking_notifications"("booking_id");

-- CreateIndex
CREATE INDEX "idx_staff_email" ON "staff_registrations"("email_address");

-- CreateIndex
CREATE INDEX "idx_staff_mobile" ON "staff_registrations"("mobile_number");

-- CreateIndex
CREATE INDEX "idx_staff_status" ON "staff_registrations"("status");

-- CreateIndex
CREATE INDEX "idx_staff_documents_registration" ON "staff_documents"("registration_id");

-- CreateIndex
CREATE INDEX "idx_staff_status_events_registration" ON "staff_status_events"("registration_id");

-- CreateIndex
CREATE INDEX "idx_staff_otp_mobile" ON "staff_otp_challenges"("mobile_number", "created_at");

-- CreateIndex
CREATE INDEX "idx_job_listings_status_date" ON "job_listings"("status", "event_date");

-- CreateIndex
CREATE INDEX "idx_job_listings_city" ON "job_listings"("event_city");

-- CreateIndex
CREATE INDEX "idx_job_applications_listing" ON "job_applications"("listing_id");

-- CreateIndex
CREATE INDEX "idx_job_applications_registration" ON "job_applications"("registration_id");

-- CreateIndex
CREATE UNIQUE INDEX "job_applications_listing_id_registration_id_key" ON "job_applications"("listing_id", "registration_id");

-- CreateIndex
CREATE INDEX "idx_job_application_events_application" ON "job_application_events"("application_id");

-- AddForeignKey
ALTER TABLE "staffing_requirements" ADD CONSTRAINT "staffing_requirements_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "booking_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_status_events" ADD CONSTRAINT "booking_status_events_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "booking_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_notifications" ADD CONSTRAINT "booking_notifications_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "booking_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_documents" ADD CONSTRAINT "staff_documents_registration_id_fkey" FOREIGN KEY ("registration_id") REFERENCES "staff_registrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_status_events" ADD CONSTRAINT "staff_status_events_registration_id_fkey" FOREIGN KEY ("registration_id") REFERENCES "staff_registrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "job_listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_application_events" ADD CONSTRAINT "job_application_events_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "job_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
