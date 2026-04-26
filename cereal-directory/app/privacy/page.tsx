import type { Metadata } from "next";

import { LegalDocument } from "@/components/legal/legal-document";

export const metadata: Metadata = {
  title: "Privacy Policy | Library System Management",
  description: "Privacy practices for student and borrowing information in the library system.",
};

export default function PrivacyPage() {
  return (
    <LegalDocument
      title="Privacy Policy"
      summary="This policy explains how library account details, student identifiers, and borrowing records are collected and used in Library System Management."
    >
      <div className="space-y-8 text-sm leading-7 text-[var(--color-foreground)] sm:text-base">
        <section className="space-y-3">
          <h2 className="font-[family:var(--font-display)] text-3xl font-semibold">
            Information We Collect
          </h2>
          <p>
            The system stores librarian account credentials, member directory details such as full
            name, student ID, course, and section, and circulation records for borrowed and
            returned materials.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-[family:var(--font-display)] text-3xl font-semibold">
            How We Use Information
          </h2>
          <p>
            Student and borrowing information is used only for catalog management, lending
            operations, due-date monitoring, reporting, and service continuity for the university
            library.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-[family:var(--font-display)] text-3xl font-semibold">
            Access and Protection
          </h2>
          <p>
            Access is limited to authorized library personnel. Credentials must not be shared, and
            library staff are expected to protect records from unauthorized disclosure, misuse, or
            alteration.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-[family:var(--font-display)] text-3xl font-semibold">
            Record Retention
          </h2>
          <p>
            Borrowing and member records may be retained for operational, audit, and compliance
            purposes in accordance with institutional requirements and library administration
            policies.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-[family:var(--font-display)] text-3xl font-semibold">
            Questions
          </h2>
          <p>
            Questions about privacy handling, corrections to member information, or access concerns
            should be directed to the library administration before system use continues.
          </p>
        </section>
      </div>
    </LegalDocument>
  );
}
