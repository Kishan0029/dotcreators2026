import { createFileRoute } from "@tanstack/react-router";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// REMOVED THE LEADING SLASH TO MATCH THE FILENAME EXACTLY
export const Route = createFileRoute("/send-thank-you")({
  server: {
    handlers: {
      // ADDED THE EXPLICIT ": Request" TYPE TO THE PARAMETER
      POST: async ({ request }: { request: Request }) => {
        try {
          // 1. Security Check: Verify request came from your Supabase Webhook
          const authHeader = request.headers.get("Authorization");
          if (authHeader !== `Bearer ${process.env.SUPABASE_WEBHOOK_SECRET}`) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), {
              status: 401,
              headers: { "Content-Type": "application/json" },
            });
          }

          // 2. Parse the database payload from Supabase
          const body = await request.json();
          const { email, name } = body.record;

          if (!email) {
            return new Response(JSON.stringify({ error: "No email provided" }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            });
          }

          // 3. Send email via Gmail
          await transporter.sendMail({
            from: `"Creator Summit" <${process.env.GMAIL_USER}>`,
            to: email,
            subject: "Thank you for registering!",
            html: `<p>Hi <strong>${name}</strong>,</p>
                   <p>Thank you for registering for the Creator Summit! We are so excited to have you.</p>
                   <p>See you there!</p>`,
          });

          return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        } catch (error: unknown) {
          const err = error as Error;
          return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
