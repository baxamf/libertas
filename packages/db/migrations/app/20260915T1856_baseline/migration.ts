#!/usr/bin/env -S node
import type { Contract as End } from "../../snapshots/760b570854e6e6b0ec66a59ae7a2343c88dd0a0d3df7982da017bcf58899c5dd/contract";
import endContract from "../../snapshots/760b570854e6e6b0ec66a59ae7a2343c88dd0a0d3df7982da017bcf58899c5dd/contract.json" with { type: "json" };
import {
  Migration,
  MigrationCLI,
  checkExpression,
  col,
  fn,
  lit,
  primaryKey,
} from "@prisma/orm-postgres/migration";

export default class M extends Migration<never, End> {
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createSchema({ schema: "public" }),
      this.createTable({
        schema: "public",
        table: "user_sessions",
        columns: [
          col("created_at", "timestamptz", {
            notNull: true,
            default: fn("now()"),
            codecRef: { codecId: "pg/timestamptz-temporal@1" },
          }),
          col("device", "text", { codecRef: { codecId: "pg/text@1" } }),
          col("expires_at", "timestamptz(0)", {
            notNull: true,
            codecRef: {
              codecId: "pg/timestamptz-temporal@1",
              typeParams: { precision: 0 },
            },
          }),
          col("id", "text", {
            notNull: true,
            codecRef: { codecId: "pg/text@1" },
          }),
          col("jti", "uuid", {
            notNull: true,
            codecRef: { codecId: "pg/uuid@1" },
          }),
          col("user_id", "text", {
            notNull: true,
            codecRef: { codecId: "pg/text@1" },
          }),
        ],
        constraints: [primaryKey(["id"], { name: "user_sessions_pkey" })],
      }),
      this.createTable({
        schema: "public",
        table: "users",
        columns: [
          col("created_at", "timestamptz", {
            notNull: true,
            default: fn("now()"),
            codecRef: { codecId: "pg/timestamptz-temporal@1" },
          }),
          col("email", "text", {
            notNull: true,
            codecRef: { codecId: "pg/text@1" },
          }),
          col("id", "text", {
            notNull: true,
            codecRef: { codecId: "pg/text@1" },
          }),
          col("password", "text", { codecRef: { codecId: "pg/text@1" } }),
          col("role", "text", {
            notNull: true,
            default: lit("USER"),
            codecRef: { codecId: "pg/text@1" },
          }),
          col("updated_at", "timestamptz", {
            notNull: true,
            codecRef: { codecId: "pg/timestamptz-temporal@1" },
          }),
        ],
        constraints: [
          primaryKey(["id"], { name: "users_pkey" }),
          checkExpression(
            "users_role_check_5b1978b5",
            "\"role\" IN ('ADMIN', 'USER')",
          ),
        ],
      }),
      this.addUnique({
        schema: "public",
        table: "user_sessions",
        constraint: "user_sessions_jti_key",
        columns: ["jti"],
      }),
      this.addUnique({
        schema: "public",
        table: "users",
        constraint: "users_email_key",
        columns: ["email"],
      }),
      this.createIndex({
        schema: "public",
        table: "user_sessions",
        index: "user_sessions_jti_idx",
        columns: ["jti"],
      }),
      this.createIndex({
        schema: "public",
        table: "user_sessions",
        index: "user_sessions_user_id_idx",
        columns: ["user_id"],
      }),
      this.createIndex({
        schema: "public",
        table: "users",
        index: "users_email_idx",
        columns: ["email"],
      }),
      this.addForeignKey({
        schema: "public",
        table: "user_sessions",
        foreignKey: {
          name: "user_sessions_user_id_fkey",
          columns: ["user_id"],
          references: { schema: "public", table: "users", columns: ["id"] },
          onDelete: "cascade",
          onUpdate: "cascade",
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
