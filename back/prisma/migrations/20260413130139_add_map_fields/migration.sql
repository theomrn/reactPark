-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Parking" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "totalSpots" INTEGER NOT NULL,
    "cols" INTEGER NOT NULL DEFAULT 5,
    "entranceCol" INTEGER NOT NULL DEFAULT 2,
    "entranceRow" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_Parking" ("address", "id", "name", "totalSpots") SELECT "address", "id", "name", "totalSpots" FROM "Parking";
DROP TABLE "Parking";
ALTER TABLE "new_Parking" RENAME TO "Parking";
CREATE TABLE "new_Spot" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "number" TEXT NOT NULL,
    "parkingId" INTEGER NOT NULL,
    "col" INTEGER NOT NULL DEFAULT 0,
    "row" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Spot_parkingId_fkey" FOREIGN KEY ("parkingId") REFERENCES "Parking" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Spot" ("id", "number", "parkingId") SELECT "id", "number", "parkingId" FROM "Spot";
DROP TABLE "Spot";
ALTER TABLE "new_Spot" RENAME TO "Spot";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
