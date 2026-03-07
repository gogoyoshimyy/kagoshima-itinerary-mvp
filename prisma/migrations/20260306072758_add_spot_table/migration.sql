-- CreateTable
CREATE TABLE "Trip" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL DEFAULT '鹿児島旅行プラン',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "TripItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tripId" TEXT NOT NULL,
    "dayIndex" INTEGER NOT NULL DEFAULT 0,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "spotName" TEXT NOT NULL,
    "lat" REAL NOT NULL,
    "lng" REAL NOT NULL,
    "stayMinutes" INTEGER NOT NULL DEFAULT 60,
    "travelMode" TEXT NOT NULL DEFAULT 'car',
    "placeId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TripItem_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Spot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "externalId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameKana" TEXT,
    "url" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "hours" TEXT,
    "closed" TEXT,
    "fee" TEXT,
    "access" TEXT,
    "parking" TEXT,
    "website" TEXT,
    "lat" REAL,
    "lng" REAL,
    "placeId" TEXT,
    "area" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "TripItem_tripId_idx" ON "TripItem"("tripId");

-- CreateIndex
CREATE UNIQUE INDEX "Spot_externalId_key" ON "Spot"("externalId");

-- CreateIndex
CREATE INDEX "Spot_name_idx" ON "Spot"("name");

-- CreateIndex
CREATE INDEX "Spot_area_idx" ON "Spot"("area");
