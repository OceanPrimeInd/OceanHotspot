import { CONTACT_EMAIL } from "@/config/contact";

type ContactEmailLinkProps = {
  className?: string;
};

export function ContactEmailLink({
  className = "text-primary hover:underline",
}: ContactEmailLinkProps) {
  return (
    <a href={`mailto:${CONTACT_EMAIL}`} className={className}>
      {CONTACT_EMAIL}
    </a>
  );
}
