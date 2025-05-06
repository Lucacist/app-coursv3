// Schéma de base de données avec Drizzle ORM
import { pgTable, serial, text, integer, varchar, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Table Classe
export const classe = pgTable('Classe', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
});

// Table Folder
export const folder = pgTable('Folder', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
});

// Table Cours
export const cours = pgTable('Cours', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  url: varchar('url', { length: 255 }).notNull(),
  folderId: integer('folderId').references(() => folder.id),
});

// Table CoursImage
export const coursImage = pgTable('CoursImage', {
  id: serial('id').primaryKey(),
  url: varchar('url', { length: 255 }).notNull(),
  coursId: integer('coursId').notNull().references(() => cours.id, { onDelete: 'cascade' }),
}, (table) => {
  return {
    coursIdUnique: unique('coursId_unique').on(table.coursId),
  };
});

// Relations
export const folderRelations = relations(folder, ({ many }) => ({
  cours: many(cours),
}));

export const coursRelations = relations(cours, ({ one }) => ({
  folder: one(folder, {
    fields: [cours.folderId],
    references: [folder.id],
  }),
  image: one(coursImage, {
    fields: [cours.id],
    references: [coursImage.coursId],
  }),
}));

export const coursImageRelations = relations(coursImage, ({ one }) => ({
  cours: one(cours, {
    fields: [coursImage.coursId],
    references: [cours.id],
  }),
}));
