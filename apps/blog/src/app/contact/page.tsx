import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "문의하기",
};

export default function ContactPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Contact</h1>
        <p className="mt-2 text-muted-foreground">
          궁금한 점이 있으시면 문의해주세요.
        </p>
      </div>

      <p className="text-muted-foreground">
        Coming soon. Contact form will be implemented.
      </p>
    </div>
  );
}
