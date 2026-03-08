-- CreateIndex
CREATE UNIQUE INDEX "uq_password_identity" ON "passwords"("userId", "url", "username", "encryptedPassword");
