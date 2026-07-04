import type { Metadata } from "next";
import { Mail, Phone, MapPin } from "lucide-react";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact PawMart",
  description: "Questions about an order, a product, or delivery? Reach PawMart in Kathmandu, Nepal.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="font-display text-4xl text-text">Get in touch</h1>
      <p className="mt-4 max-w-xl font-body text-lg leading-relaxed text-muted">
        Questions about an order, a product, or delivery to your area? Send us a note — a real person reads every
        one.
      </p>

      <div className="mt-10 grid gap-10 md:grid-cols-2">
        <div className="space-y-5">
          <ContactRow icon={Mail} label="hello@pawmart.example" />
          <ContactRow icon={Phone} label="+977 98-0000-0000" />
          <ContactRow icon={MapPin} label="Kathmandu, Nepal" />
        </div>
        <ContactForm />
      </div>
    </div>
  );
}

function ContactRow({ icon: Icon, label }: { icon: typeof Mail; label: string }) {
  return (
    <div className="flex items-center gap-3 font-body text-text">
      <Icon className="size-5 text-accent" />
      {label}
    </div>
  );
}
