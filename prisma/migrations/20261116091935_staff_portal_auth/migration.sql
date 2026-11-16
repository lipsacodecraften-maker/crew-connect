-- CreateTable
CREATE TABLE "staff_sessions" (
    "id" TEXT NOT NULL,
    "registration_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "user_agent" TEXT,
    "ip_hash" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_seen_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),

    CONSTRAINT "staff_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "staff_sessions_token_hash_key" ON "staff_sessions"("token_hash");

-- CreateIndex
CREATE INDEX "idx_staff_sessions_registration" ON "staff_sessions"("registration_id");

-- CreateIndex
CREATE INDEX "idx_staff_sessions_expiry" ON "staff_sessions"("expires_at");

-- AddForeignKey
ALTER TABLE "staff_sessions" ADD CONSTRAINT "staff_sessions_registration_id_fkey" FOREIGN KEY ("registration_id") REFERENCES "staff_registrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
