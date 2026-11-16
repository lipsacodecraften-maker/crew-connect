-- CreateTable
CREATE TABLE "admin_users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'coordinator',
    "status" TEXT NOT NULL DEFAULT 'active',
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_sessions" (
    "id" TEXT NOT NULL,
    "admin_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "user_agent" TEXT,
    "ip_hash" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_seen_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),

    CONSTRAINT "admin_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_audit_logs" (
    "id" TEXT NOT NULL,
    "admin_id" TEXT,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT,
    "detail" TEXT,
    "ip_hash" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quotations" (
    "id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "tax_percent" DOUBLE PRECISION NOT NULL DEFAULT 18,
    "subtotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tax_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notes" TEXT,
    "valid_until" TEXT,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quotations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quotation_line_items" (
    "id" TEXT NOT NULL,
    "quotation_id" TEXT NOT NULL,
    "requirement_ref" INTEGER,
    "label" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "days" INTEGER NOT NULL DEFAULT 1,
    "unit_rate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "note" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "quotation_line_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_assignments" (
    "id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "requirement_ref" INTEGER,
    "listing_id" TEXT,
    "application_id" TEXT,
    "registration_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "work_date" TEXT NOT NULL,
    "shift_start" TEXT,
    "shift_end" TEXT,
    "status" TEXT NOT NULL DEFAULT 'proposed',
    "attendance_status" TEXT NOT NULL DEFAULT 'pending',
    "pay_rate" DOUBLE PRECISION,
    "notes" TEXT,
    "check_in_at" TIMESTAMP(3),
    "check_out_at" TIMESTAMP(3),
    "attendance_notes" TEXT,
    "completed_at" TIMESTAMP(3),
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_work_history" (
    "id" TEXT NOT NULL,
    "registration_id" TEXT NOT NULL,
    "assignment_id" TEXT,
    "event_name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "work_date" TEXT NOT NULL,
    "shift_hours" DOUBLE PRECISION,
    "pay_rate" DOUBLE PRECISION,
    "rating" INTEGER,
    "notes" TEXT,
    "source" TEXT NOT NULL DEFAULT 'assignment',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "staff_work_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_email_key" ON "admin_users"("email");

-- CreateIndex
CREATE INDEX "idx_admin_users_role" ON "admin_users"("role");

-- CreateIndex
CREATE INDEX "idx_admin_users_status" ON "admin_users"("status");

-- CreateIndex
CREATE UNIQUE INDEX "admin_sessions_token_hash_key" ON "admin_sessions"("token_hash");

-- CreateIndex
CREATE INDEX "idx_admin_sessions_admin" ON "admin_sessions"("admin_id");

-- CreateIndex
CREATE INDEX "idx_admin_sessions_expiry" ON "admin_sessions"("expires_at");

-- CreateIndex
CREATE INDEX "idx_admin_audit_created" ON "admin_audit_logs"("created_at");

-- CreateIndex
CREATE INDEX "idx_admin_audit_entity" ON "admin_audit_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE UNIQUE INDEX "quotations_booking_id_key" ON "quotations"("booking_id");

-- CreateIndex
CREATE INDEX "idx_quotation_items_quotation" ON "quotation_line_items"("quotation_id");

-- CreateIndex
CREATE INDEX "idx_assignments_booking" ON "event_assignments"("booking_id");

-- CreateIndex
CREATE INDEX "idx_assignments_staff_date" ON "event_assignments"("registration_id", "work_date");

-- CreateIndex
CREATE INDEX "idx_assignments_status_date" ON "event_assignments"("status", "work_date");

-- CreateIndex
CREATE UNIQUE INDEX "staff_work_history_assignment_id_key" ON "staff_work_history"("assignment_id");

-- CreateIndex
CREATE INDEX "idx_work_history_staff" ON "staff_work_history"("registration_id");

-- AddForeignKey
ALTER TABLE "admin_sessions" ADD CONSTRAINT "admin_sessions_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "admin_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_audit_logs" ADD CONSTRAINT "admin_audit_logs_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "booking_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotation_line_items" ADD CONSTRAINT "quotation_line_items_quotation_id_fkey" FOREIGN KEY ("quotation_id") REFERENCES "quotations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_assignments" ADD CONSTRAINT "event_assignments_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "booking_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_assignments" ADD CONSTRAINT "event_assignments_registration_id_fkey" FOREIGN KEY ("registration_id") REFERENCES "staff_registrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_work_history" ADD CONSTRAINT "staff_work_history_registration_id_fkey" FOREIGN KEY ("registration_id") REFERENCES "staff_registrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_work_history" ADD CONSTRAINT "staff_work_history_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "event_assignments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
