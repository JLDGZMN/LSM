import type { Metadata } from "next";

import { LegalDocument } from "@/components/legal/legal-document";

export const metadata: Metadata = {
  title: "Terms of Use | Library System Management",
  description: "Terms governing use of the university library management system.",
};

export default function TermsPage() {
  return (
    <LegalDocument
      title="Terms of Use"
      summary="These terms govern librarian access, operational responsibilities, and proper handling of member and circulation records in Library System Management."
    >
      <div className="space-y-8 text-sm leading-7 text-[var(--color-foreground)] sm:text-base">
        <section className="space-y-3">
          <h2 className="font-[family:var(--font-display)] text-3xl font-semibold">
            Authorized Use
          </h2>
          <p>
            The system is intended for official library operations only. Users must access the
            platform solely for cataloging, member management, lending workflows, and reporting
            related to university library services.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-[family:var(--font-display)] text-3xl font-semibold">
            Account Responsibility
          </h2>
          <p>
            Each librarian is responsible for maintaining the confidentiality of account
            credentials, reviewing records before submission, and signing out after using shared
            devices or workstations.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-[family:var(--font-display)] text-3xl font-semibold">
            Data Accuracy
          </h2>
          <p>
            Library personnel should ensure that book availability, member directory entries,
            borrowing dates, and return statuses are updated accurately and in a timely manner.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-[family:var(--font-display)] text-3xl font-semibold">
            Prohibited Actions
          </h2>
          <p>
            Users must not misuse student information, create unauthorized accounts, alter records
            dishonestly, or attempt to access areas of the system beyond their operational
            responsibilities.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-[family:var(--font-display)] text-3xl font-semibold">
            Administrative Oversight
          </h2>
          <p>
            The library administration may review activity, suspend access, update policies, or
            require corrective action when system use conflicts with institutional guidelines or
            data protection responsibilities.
          </p>
        </section>
      </div>
    </LegalDocument>
  );
}
