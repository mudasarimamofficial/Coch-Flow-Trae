import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  const pages = [
    {
      title: "Privacy Policy",
      slug: "privacy-policy",
      nav_label: "Privacy Policy",
      show_in_footer_nav: true,
      status: "published",
      published_content: {
        sections: [
          {
            id: "privacy-1",
            type: "rich_text",
            enabled: true,
            settings: {
              title: "Privacy Policy",
              content: "<p>Last updated: " + new Date().toLocaleDateString() + "</p><p>We take your privacy seriously. This privacy policy describes how we collect, use, and share your personal information when you use our website and services.</p><h3>Information We Collect</h3><p>We collect information you provide directly to us, such as when you create an account, fill out a form, or communicate with us.</p><h3>How We Use Your Information</h3><p>We use the information we collect to provide, maintain, and improve our services, as well as to communicate with you.</p>"
            }
          }
        ]
      }
    },
    {
      title: "Terms of Service",
      slug: "terms-of-service",
      nav_label: "Terms of Service",
      show_in_footer_nav: true,
      status: "published",
      published_content: {
        sections: [
          {
            id: "terms-1",
            type: "rich_text",
            enabled: true,
            settings: {
              title: "Terms of Service",
              content: "<p>Last updated: " + new Date().toLocaleDateString() + "</p><p>By accessing or using our services, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the service.</p><h3>Use of Services</h3><p>You agree to use our services only for lawful purposes and in accordance with these Terms.</p><h3>Intellectual Property</h3><p>The service and its original content, features, and functionality are and will remain the exclusive property of Coachflow Aquisition and its licensors.</p>"
            }
          }
        ]
      }
    },
    {
      title: "Contact Us",
      slug: "contact",
      nav_label: "Contact",
      show_in_footer_nav: true,
      status: "published",
      published_content: {
        sections: [
          {
            id: "contact-1",
            type: "rich_text",
            enabled: true,
            settings: {
              title: "Get in Touch",
              content: "<p>Have a question or want to work with us? We'd love to hear from you.</p><p><strong>Email:</strong> support@coachflowaquisition.com</p><p>Or reach out to us on our social media channels.</p>"
            }
          }
        ]
      }
    }
  ];

  for (const page of pages) {
    const { data: existing } = await supabase.from("site_pages").select("id").eq("slug", page.slug).single();
    if (existing) {
      console.log("Updating", page.slug);
      await supabase.from("site_pages").update(page).eq("slug", page.slug);
    } else {
      console.log("Inserting", page.slug);
      await supabase.from("site_pages").insert(page);
    }
  }
  console.log("Seeding complete!");
}

seed().catch(console.error);
