import { Migration } from '@mikro-orm/migrations';

export class Migration20261105203554 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "category" ("id" serial primary key, "description" varchar(255) not null, "usertype" varchar(255) not null);`);

    this.addSql(`create table "coupon" ("id" serial primary key, "discount" jsonb not null, "expiringDate" timestamptz not null, "status" varchar(255) not null);`);

    this.addSql(`create table "locality" ("id" serial primary key, "name" varchar(255) not null, "postal_code" varchar(255) not null, "province" varchar(255) not null);`);

    this.addSql(`create table "user" ("id" serial primary key, "name" varchar(255) not null, "surname" varchar(255) not null, "email" varchar(255) not null, "phone_number" varchar(255) null, "password" varchar(255) not null, "category_id" int not null, "created_at" timestamptz not null, "updated_at" timestamptz null);`);

    this.addSql(`create table "business" ("id" serial primary key, "owner_id" int not null, "locality_id" int not null, "business_name" varchar(255) not null, "address" varchar(255) not null, "average_rating" decimal(3,2) not null, "reservation_deposit_percentage" decimal(5,4) not null, "active" boolean not null default false, "activated_at" timestamptz null, "schedule" jsonb null);`);
    this.addSql(`alter table "business" add constraint "business_owner_id_unique" unique ("owner_id");`);

    this.addSql(`create table "pitch" ("id" serial primary key, "rating" int not null, "size" varchar(255) not null, "ground_type" varchar(255) not null, "roof" boolean not null, "price" decimal(10,2) not null, "business_id" int not null, "image_url" varchar(255) null, "drive_file_id" varchar(255) null, "created_at" timestamptz not null, "updated_at" timestamptz null);`);

    this.addSql(`create table "reservation" ("id" serial primary key, "reservation_date" date not null, "reservation_time" varchar(255) not null, "user_id" int not null, "pitch_id" int not null, "status" varchar(255) not null, "pitch_rating" smallint null, "reminder_sent_at" timestamptz null, "created_at" timestamptz not null);`);

    this.addSql(`create table "user_coupon" ("id" serial primary key, "user_id" int not null, "coupon_id" int not null, "assigned_at" timestamptz not null, "status" varchar(255) not null default 'active');`);

    this.addSql(`alter table "user" add constraint "user_category_id_foreign" foreign key ("category_id") references "category" ("id") on update cascade;`);

    this.addSql(`alter table "business" add constraint "business_owner_id_foreign" foreign key ("owner_id") references "user" ("id") on update cascade;`);
    this.addSql(`alter table "business" add constraint "business_locality_id_foreign" foreign key ("locality_id") references "locality" ("id") on update cascade;`);

    this.addSql(`alter table "pitch" add constraint "pitch_business_id_foreign" foreign key ("business_id") references "business" ("id") on update cascade;`);

    this.addSql(`alter table "reservation" add constraint "reservation_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;`);
    this.addSql(`alter table "reservation" add constraint "reservation_pitch_id_foreign" foreign key ("pitch_id") references "pitch" ("id") on update cascade;`);

    this.addSql(`alter table "user_coupon" add constraint "user_coupon_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;`);
    this.addSql(`alter table "user_coupon" add constraint "user_coupon_coupon_id_foreign" foreign key ("coupon_id") references "coupon" ("id") on update cascade;`);
  }

}
