CREATE TABLE "Classe" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	CONSTRAINT "Classe_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "Cours" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"url" varchar(255) NOT NULL,
	"folderId" integer
);
--> statement-breakpoint
CREATE TABLE "CoursImage" (
	"id" serial PRIMARY KEY NOT NULL,
	"url" varchar(255) NOT NULL,
	"coursId" integer NOT NULL,
	CONSTRAINT "coursId_unique" UNIQUE("coursId")
);
--> statement-breakpoint
CREATE TABLE "Folder" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "Cours" ADD CONSTRAINT "Cours_folderId_Folder_id_fk" FOREIGN KEY ("folderId") REFERENCES "public"."Folder"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "CoursImage" ADD CONSTRAINT "CoursImage_coursId_Cours_id_fk" FOREIGN KEY ("coursId") REFERENCES "public"."Cours"("id") ON DELETE cascade ON UPDATE no action;