/*
  Warnings:

  - Added the required column `nombreComprador` to the `Turno` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nombrePropiedad` to the `Turno` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Turno" ADD COLUMN     "nombreComprador" TEXT NOT NULL,
ADD COLUMN     "nombrePropiedad" TEXT NOT NULL;
