"use client";

import * as React from "react";
import Image from "next/image";
import {
  ArrowRightLeft,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Eye,
  Pencil,
  Plus,
  Printer,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { DataTable } from "@/components/dashboard/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  type BookRow,
  type BorrowTransactionRow,
  type DashboardStats,
  type MemberRow,
} from "@/lib/library-data";
import { cn } from "@/lib/utils";

type TabKey = "books" | "members" | "borrowTransactions";

type BookFormValues = {
  id: string;
  title: string;
  isbn: string;
  author: string;
  publisher: string;
  publishedYear: string;
  shelfLocation: string;
  totalCopies: string;
  availableCopies: string;
};

type MemberFormValues = {
  id: string;
  fullName: string;
  studentId: string;
  course: string;
  section: string;
};

type TransactionFormValues = {
  id: string;
  bookId: string;
  memberId: string;
  borrowedAt: string;
  dueAt: string;
  returnedAt: string;
  status: "borrowed" | "returned" | "overdue" | "lost";
  notes: string;
};

type ResourceResponse<T> = {
  data: T[];
  error?: string;
};

type LibraryDashboardProps = {
  initialStats: DashboardStats;
  initialBooks: BookRow[];
  initialMembers: MemberRow[];
  initialBorrowTransactions: BorrowTransactionRow[];
  userName: string;
  userEmail: string;
};

const tabLabels: Record<TabKey, string> = {
  books: "Books",
  members: "Members",
  borrowTransactions: "Borrow Records",
};

const PENALTY_PER_DAY = 5;

const COURSE_OPTIONS = [
"BS Accounting Information System",
"BS Agribusiness",
"BS Agricultural Engineering",
"BS Applied Mathematics",
"BS Biochemistry",
"BS Chemical Engineering",
"BS Chemistry",
"BS Commerce",
"BS Community Development",
"BS Customs Administration",
"BS Data Science",
"BS Economics",
"BS Environmental Science",
"BS Food Technology",
"BS Forestry",
"BS Geology",
"BS Hotel and Restaurant Management",
"BS Industrial Engineering",
"BS Interior Design",
"BS International Studies",
"BS Legal Management",
"BS Library and Information Science",
"BS Management Accounting",
"BS Marine Biology",
"BS Marine Engineering",
"BS Marketing Management",
"BS Mass Communication",
"BS Multimedia Arts",
"BS Nutrition and Dietetics",
"BS Office Administration",
"BS Physical Therapy",
"BS Physics",
"BS Political Science",
"BS Public Administration",
"BS Real Estate Management",
"BS Secondary Education",
"BS Social Work",
"BS Statistics",
"BS Supply Chain Management",
"BS Tourism",
"BS Radiologic Technology",
"BS Electronics Engineering",
"BS Mechatronics Engineering",
] as const;

const SHELF_LOCATION_OPTIONS = ["A", "B", "C", "D", "E"].flatMap((letter) =>
  Array.from({ length: 12 }, (_, index) => `${letter}-${index + 1}`),
) as string[];

const currentYear = new Date().getFullYear();

function lettersOnly(value: string) {
  return value.replace(/[^A-Za-z\s.'-]/g, "");
}

function digitsOnly(value: string, maxLength?: number) {
  const digits = value.replace(/\D/g, "");
  return typeof maxLength === "number" ? digits.slice(0, maxLength) : digits;
}

const emptyBookForm = (): BookFormValues => ({
  id: "",
  title: "",
  isbn: "",
  author: "",
  publisher: "",
  publishedYear: "",
  shelfLocation: "",
  totalCopies: "1",
  availableCopies: "1",
});

const emptyMemberForm = (): MemberFormValues => ({
  id: "",
  fullName: "",
  studentId: "",
  course: "",
  section: "",
});

function addSchoolDaysFromLocalDateTime(value: string, schoolDays: number) {
  if (!value) {
    return "";
  }

  const startDate = parseDateTimeLocal(value);

  if (Number.isNaN(startDate.getTime())) {
    return "";
  }

  const result = new Date(startDate);
  let countedDays = 0;

  while (countedDays < schoolDays) {
    result.setDate(result.getDate() + 1);

    const dayOfWeek = result.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      countedDays += 1;
    }
  }

  return formatDateTimeLocalInput(result);
}

const emptyTransactionForm = (): TransactionFormValues => ({
  id: "",
  bookId: "",
  memberId: "",
  borrowedAt: formatDateTimeLocalInput(new Date()),
  dueAt: addSchoolDaysFromLocalDateTime(formatDateTimeLocalInput(new Date()), 5),
  returnedAt: "",
  status: "borrowed",
  notes: "",
});

function parseDateTimeLocal(value: string) {
  const normalized = value.trim().replace(" ", "T");
  const match = normalized.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/,
  );

  if (match) {
    const [, year, month, day, hour, minute, second = "00"] = match;
    return new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
      Number(second),
    );
  }

  return new Date(value);
}

function formatDateTimeLocalInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hour}:${minute}`;
}

function toDateTimeLocal(value: string | null) {
  if (!value) {
    return "";
  }

  const date = parseDateTimeLocal(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return formatDateTimeLocalInput(date);
}

function toReadableDate(value: string | null) {
  if (!value) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parseDateTimeLocal(value));
}

function toReadableDateTime(value: string | null) {
  if (!value) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(parseDateTimeLocal(value));
}

function formatHeaderDateTime(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getOverdueDays(dueAt: string, returnedAt?: string | null) {
  const dueDate = parseDateTimeLocal(dueAt);

  if (Number.isNaN(dueDate.getTime())) {
    return 0;
  }

  const comparisonDate = returnedAt ? parseDateTimeLocal(returnedAt) : new Date();

  if (Number.isNaN(comparisonDate.getTime())) {
    return 0;
  }

  const normalizedDue = new Date(
    dueDate.getFullYear(),
    dueDate.getMonth(),
    dueDate.getDate(),
  );
  const normalizedComparison = new Date(
    comparisonDate.getFullYear(),
    comparisonDate.getMonth(),
    comparisonDate.getDate(),
  );
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const difference = normalizedComparison.getTime() - normalizedDue.getTime();

  return difference > 0 ? Math.floor(difference / millisecondsPerDay) : 0;
}

function getPenaltyAmount(transaction: BorrowTransactionRow) {
  return getOverdueDays(transaction.dueAt, transaction.returnedAt) * PENALTY_PER_DAY;
}

function validateBookForm(values: BookFormValues) {
  const requiredFields: Array<[keyof BookFormValues, string]> = [
    ["title", "Title"],
    ["author", "Author"],
    ["isbn", "ISBN"],
    ["publisher", "Publisher"],
    ["publishedYear", "Published year"],
    ["shelfLocation", "Shelf location"],
    ["totalCopies", "Total copies"],
    ["availableCopies", "Available copies"],
  ];

  const missingField = requiredFields.find(([key]) => !values[key].trim());

  if (missingField) {
    return `${missingField[1]} is required.`;
  }

  if (!/^\d{13}$/.test(values.isbn)) {
    return "ISBN must contain exactly 13 digits.";
  }

  if (/\d/.test(values.author)) {
    return "Author cannot contain numbers.";
  }

  if (/\d/.test(values.publisher)) {
    return "Publisher cannot contain numbers.";
  }

  const publishedYear = Number(values.publishedYear);

  if (
    !Number.isInteger(publishedYear) ||
    publishedYear < 1000 ||
    publishedYear > currentYear
  ) {
    return `Published year must be between 1000 and ${currentYear}.`;
  }

  const totalCopies = Number(values.totalCopies);
  const availableCopies = Number(values.availableCopies);

  if (!Number.isInteger(totalCopies) || totalCopies <= 0) {
    return "Total copies must be a whole number greater than zero.";
  }

  if (!Number.isInteger(availableCopies) || availableCopies < 0) {
    return "Available copies must be a non-negative whole number.";
  }

  if (availableCopies > totalCopies) {
    return "Available copies cannot be greater than total copies.";
  }

  return "";
}

function validateMemberForm(values: MemberFormValues) {
  if (!values.fullName.trim()) {
    return "Full name is required.";
  }

  if (/\d/.test(values.fullName)) {
    return "Full name cannot contain numbers.";
  }

  if (!/^\d{9}$/.test(values.studentId)) {
    return "Student ID must contain exactly 9 digits.";
  }

  if (!values.course.trim()) {
    return "Course is required.";
  }

  if (/\d/.test(values.course)) {
    return "Course cannot contain numbers.";
  }

  if (!values.section.trim()) {
    return "Section is required.";
  }

  return "";
}

function validateTransactionForm(values: TransactionFormValues) {
  if (!values.bookId) {
    return "Book is required.";
  }

  if (!values.memberId) {
    return "Member is required.";
  }

  if (!values.borrowedAt) {
    return "Borrowed date is required.";
  }

  const borrowedAt = parseDateTimeLocal(values.borrowedAt);

  if (Number.isNaN(borrowedAt.getTime())) {
    return "Borrowed date is invalid.";
  }

  if (values.status === "returned") {
    if (!values.returnedAt) {
      return "Returned date is required for returned records.";
    }

    const returnedAt = parseDateTimeLocal(values.returnedAt);

    if (Number.isNaN(returnedAt.getTime())) {
      return "Returned date is invalid.";
    }

    if (returnedAt.getTime() < borrowedAt.getTime()) {
      return "Returned date cannot be earlier than the borrowed date.";
    }
  }

  return "";
}

function deriveStats(
  books: BookRow[],
  members: MemberRow[],
  borrowTransactions: BorrowTransactionRow[],
): DashboardStats {
  return {
    books: books.length,
    members: members.length,
    borrowed: borrowTransactions.filter((item) =>
      item.status === "borrowed" || item.status === "overdue"
    ).length,
    returned: borrowTransactions.filter((item) => item.status === "returned").length,
  };
}

async function requestJson<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const payload = (await response.json()) as { error?: string } & T;

  if (!response.ok) {
    throw new Error(payload.error || "Unable to process this request.");
  }

  return payload;
}

function StatCard({
  label,
  value,
  icon: Icon,
  description,
  accentClassName,
  accentColor,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  accentClassName: string;
  accentColor: string;
}) {
  return (
    <article
      className="group relative overflow-hidden rounded-[28px] border border-white/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(255,251,245,0.92))] p-6 shadow-[0_18px_60px_rgba(63,32,18,0.09)]"
      style={{ "--card-accent": accentColor } as React.CSSProperties}
    >
      <div className="absolute inset-x-0 top-0 h-1.5 bg-[var(--card-accent)]" />
      <div
        className={cn(
          "absolute right-[-18px] top-[-18px] h-24 w-24 rounded-full blur-2xl transition-transform duration-300 group-hover:scale-110",
          accentClassName,
        )}
      />
      <div className="relative flex items-start justify-between gap-4">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-muted-foreground)]">
            {label}
          </p>
          <p className="text-4xl font-semibold tracking-[-0.04em] text-[var(--color-foreground)]">
            {value}
          </p>
          <p className="max-w-[20ch] text-sm leading-6 text-[var(--color-muted-foreground)]">
            {description}
          </p>
        </div>
        <div className="rounded-2xl border border-white/70 bg-white/80 p-3 shadow-[0_10px_24px_rgba(63,32,18,0.08)]">
          <Icon className="size-5 text-[var(--color-primary)]" />
        </div>
      </div>
    </article>
  );
}

function StatusPill({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "success" | "warning" | "danger" | "neutral";
}) {
  const toneClasses = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    warning: "border-amber-200 bg-amber-50 text-amber-700",
    danger: "border-rose-200 bg-rose-50 text-rose-700",
    neutral:
      "border-[color:var(--color-border)] bg-[var(--color-muted)] text-[var(--color-muted-foreground)]",
  };

  return (
    <span
      className={cn(
        "inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold capitalize",
        toneClasses[tone],
      )}
    >
      {children}
    </span>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

type SelectOption = {
  value: string;
  label: string;
};

function OptionSelect({
  value,
  onChange,
  options,
  placeholder,
  maxVisibleItems = 6,
}: {
  value: string;
  onChange: (value: string) => void;
  options: readonly (string | SelectOption)[];
  placeholder: string;
  maxVisibleItems?: number;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const normalizedOptions = options.map((option) =>
    typeof option === "string" ? { value: option, label: option } : option,
  );
  const selectedOption = normalizedOptions.find((option) => option.value === value);

  React.useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex h-11 w-full items-center justify-between rounded-xl border border-[color:var(--color-border)] bg-white/85 px-3 py-2 text-sm text-left"
      >
        <span className={cn(!value && "text-[var(--color-muted-foreground)]")}>
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown
          className={cn(
            "size-4 text-[var(--color-muted-foreground)] transition-transform",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {isOpen ? (
        <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-xl border border-[color:var(--color-border)] bg-white shadow-[0_18px_50px_rgba(15,23,42,0.12)]">
          <div
            className="overflow-y-auto py-1"
            style={{ maxHeight: `${maxVisibleItems * 40}px` }}
          >
            {normalizedOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={cn(
                  "flex w-full items-center px-3 py-2 text-left text-sm transition hover:bg-[var(--color-muted)]",
                  value === option.value &&
                    "bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)]",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function LibraryDashboard({
  initialStats,
  initialBooks,
  initialMembers,
  initialBorrowTransactions,
  userName,
  userEmail,
}: LibraryDashboardProps) {
  const [activeTab, setActiveTab] = React.useState<TabKey>("books");
  const [stats, setStats] = React.useState(initialStats);
  const [books, setBooks] = React.useState(initialBooks);
  const [members, setMembers] = React.useState(initialMembers);
  const [borrowTransactions, setBorrowTransactions] = React.useState(
    initialBorrowTransactions,
  );
  const [bookForm, setBookForm] = React.useState<BookFormValues>(emptyBookForm);
  const [memberForm, setMemberForm] = React.useState<MemberFormValues>(emptyMemberForm);
  const [transactionForm, setTransactionForm] = React.useState<TransactionFormValues>(
    emptyTransactionForm,
  );
  const [bookSearch, setBookSearch] = React.useState("");
  const [memberSearch, setMemberSearch] = React.useState("");
  const [transactionSearch, setTransactionSearch] = React.useState("");
  const [bookStatusFilter, setBookStatusFilter] = React.useState("all");
  const [transactionStatusFilter, setTransactionStatusFilter] = React.useState("all");
  const [selectedTransaction, setSelectedTransaction] =
    React.useState<BorrowTransactionRow | null>(null);
  const [activeSubmitAction, setActiveSubmitAction] = React.useState<
    "book" | "member" | "transaction" | null
  >(null);
  const [isPending, startTransition] = React.useTransition();
  const [headerNow, setHeaderNow] = React.useState(() => new Date());

  React.useEffect(() => {
    setTransactionForm((current) => {
      const computedDueAt = addSchoolDaysFromLocalDateTime(current.borrowedAt, 5);

      if (current.dueAt === computedDueAt) {
        return current;
      }

      return {
        ...current,
        dueAt: computedDueAt,
      };
    });
  }, [transactionForm.borrowedAt]);

  React.useEffect(() => {
    const interval = window.setInterval(() => {
      setHeaderNow(new Date());
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  function refreshStats(
    nextBooks: BookRow[],
    nextMembers: MemberRow[],
    nextTransactions: BorrowTransactionRow[],
  ) {
    setStats(deriveStats(nextBooks, nextMembers, nextTransactions));
  }

  async function refreshBooksOnly() {
    const payload = await requestJson<ResourceResponse<BookRow>>("/api/library/books");
    startTransition(() => {
      setBooks(payload.data);
      refreshStats(payload.data, members, borrowTransactions);
    });
  }

  function beginEditBook(book: BookRow) {
    setBookForm({
      id: String(book.id),
      title: book.title,
      isbn: book.isbn ?? "",
      author: book.author,
      publisher: book.publisher ?? "",
      publishedYear: book.publishedYear ? String(book.publishedYear) : "",
      shelfLocation: book.shelfLocation ?? "",
      totalCopies: String(book.totalCopies),
      availableCopies: String(book.availableCopies),
    });
    setActiveTab("books");
    toast("Editing book", {
      description: `Update "${book.title}" and save your changes when ready.`,
    });
  }

  function beginEditMember(member: MemberRow) {
    setMemberForm({
      id: String(member.id),
      fullName: member.fullName,
      studentId: member.studentId,
      course: member.course,
      section: member.section,
    });
    setActiveTab("members");
    toast("Editing member", {
      description: `You are now editing ${member.fullName}.`,
    });
  }

  function beginEditTransaction(transaction: BorrowTransactionRow) {
    setTransactionForm({
      id: String(transaction.id),
      bookId: String(transaction.bookId),
      memberId: String(transaction.memberId),
      borrowedAt: toDateTimeLocal(transaction.borrowedAt),
      dueAt: toDateTimeLocal(transaction.dueAt),
      returnedAt: toDateTimeLocal(transaction.returnedAt),
      status: transaction.status,
      notes: transaction.notes ?? "",
    });
    setActiveTab("borrowTransactions");
    toast("Editing borrow record", {
      description: `${transaction.bookTitle} for ${transaction.memberName}.`,
    });
  }

  async function handleBookSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationError = validateBookForm(bookForm);

    if (validationError) {
      toast.error("Complete all book fields", {
        description: validationError,
      });
      return;
    }

    setActiveSubmitAction("book");

    try {
      const payload = {
        categoryId: null,
        title: bookForm.title,
        isbn: bookForm.isbn,
        author: bookForm.author,
        publisher: bookForm.publisher,
        publishedYear: bookForm.publishedYear,
        shelfLocation: bookForm.shelfLocation,
        totalCopies: Number(bookForm.totalCopies),
        availableCopies: Number(bookForm.availableCopies),
      };
      const endpoint = bookForm.id
        ? `/api/library/books/${bookForm.id}`
        : "/api/library/books";
      const method = bookForm.id ? "PATCH" : "POST";
      const response = await requestJson<ResourceResponse<BookRow>>(endpoint, {
        method,
        body: JSON.stringify(payload),
      });

      startTransition(() => {
        setBooks(response.data);
        refreshStats(response.data, members, borrowTransactions);
        setBookForm(emptyBookForm());
      });

      toast.success(bookForm.id ? "Book updated" : "Book added");
    } catch (error) {
      toast.error("Unable to save book", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setActiveSubmitAction(null);
    }
  }

  async function handleMemberSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationError = validateMemberForm(memberForm);

    if (validationError) {
      toast.error("Review member fields", {
        description: validationError,
      });
      return;
    }

    setActiveSubmitAction("member");

    try {
      const endpoint = memberForm.id
        ? `/api/library/members/${memberForm.id}`
        : "/api/library/members";
      const method = memberForm.id ? "PATCH" : "POST";
      const response = await requestJson<ResourceResponse<MemberRow>>(endpoint, {
        method,
        body: JSON.stringify(memberForm),
      });

      startTransition(() => {
        setMembers(response.data);
        refreshStats(books, response.data, borrowTransactions);
        setMemberForm(emptyMemberForm());
      });

      toast.success(memberForm.id ? "Member updated" : "Member added");
    } catch (error) {
      toast.error("Unable to save member", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setActiveSubmitAction(null);
    }
  }

  async function handleTransactionSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationError = validateTransactionForm(transactionForm);

    if (validationError) {
      toast.error("Review borrow record fields", {
        description: validationError,
      });
      return;
    }

    setActiveSubmitAction("transaction");

    try {
      const endpoint = transactionForm.id
        ? `/api/library/borrow-transactions/${transactionForm.id}`
        : "/api/library/borrow-transactions";
      const method = transactionForm.id ? "PATCH" : "POST";
      const response = await requestJson<ResourceResponse<BorrowTransactionRow>>(endpoint, {
        method,
        body: JSON.stringify(transactionForm),
      });
      const nextTransactions = response.data;
      const nextBooksPayload = await requestJson<ResourceResponse<BookRow>>("/api/library/books");
      startTransition(() => {
        setBorrowTransactions(nextTransactions);
        setBooks(nextBooksPayload.data);
        refreshStats(nextBooksPayload.data, members, nextTransactions);
        setTransactionForm(emptyTransactionForm());
      });

      toast.success(
        transactionForm.id ? "Borrow record updated" : "Borrow record created",
      );
    } catch (error) {
      toast.error("Unable to save borrow record", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setActiveSubmitAction(null);
    }
  }

  async function handleDeleteBook(id: number) {
    if (!window.confirm("Delete this book record?")) {
      return;
    }

    try {
      const response = await requestJson<ResourceResponse<BookRow>>(
        `/api/library/books/${id}`,
        { method: "DELETE" },
      );

      startTransition(() => {
        setBooks(response.data);
        refreshStats(response.data, members, borrowTransactions);
      });

      if (bookForm.id === String(id)) {
        setBookForm(emptyBookForm());
      }

      toast.success("Book deleted");
    } catch (error) {
      toast.error("Unable to delete book", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    }
  }

  async function handleDeleteMember(id: number) {
    if (!window.confirm("Delete this member record?")) {
      return;
    }

    try {
      const response = await requestJson<ResourceResponse<MemberRow>>(
        `/api/library/members/${id}`,
        { method: "DELETE" },
      );

      startTransition(() => {
        setMembers(response.data);
        refreshStats(books, response.data, borrowTransactions);
      });

      if (memberForm.id === String(id)) {
        setMemberForm(emptyMemberForm());
      }

      toast.success("Member deleted");
    } catch (error) {
      toast.error("Unable to delete member", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    }
  }

  async function handleDeleteTransaction(id: number) {
    if (!window.confirm("Delete this borrow record?")) {
      return;
    }

    try {
      const response = await requestJson<ResourceResponse<BorrowTransactionRow>>(
        `/api/library/borrow-transactions/${id}`,
        { method: "DELETE" },
      );
      const nextBooksPayload = await requestJson<ResourceResponse<BookRow>>("/api/library/books");

      startTransition(() => {
        setBorrowTransactions(response.data);
        setBooks(nextBooksPayload.data);
        refreshStats(nextBooksPayload.data, members, response.data);
      });

      if (transactionForm.id === String(id)) {
        setTransactionForm(emptyTransactionForm());
      }

      toast.success("Borrow record deleted");
    } catch (error) {
      toast.error("Unable to delete borrow record", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    }
  }

  function printBorrowReceipt(transaction: BorrowTransactionRow) {
    const existingFrame = document.getElementById(
      "borrow-receipt-print-frame",
    ) as HTMLIFrameElement | null;
    const receiptFrame = existingFrame ?? document.createElement("iframe");

    if (!existingFrame) {
      receiptFrame.id = "borrow-receipt-print-frame";
      receiptFrame.style.position = "fixed";
      receiptFrame.style.right = "0";
      receiptFrame.style.bottom = "0";
      receiptFrame.style.width = "0";
      receiptFrame.style.height = "0";
      receiptFrame.style.border = "0";
      receiptFrame.setAttribute("aria-hidden", "true");
      document.body.appendChild(receiptFrame);
    }

    const receiptWindow = receiptFrame.contentWindow;

    if (!receiptWindow) {
      toast.error("Unable to prepare print view", {
        description: "Please try printing the receipt again.",
      });
      return;
    }

    const receiptDocument = receiptWindow.document;

    const notes = escapeHtml(transaction.notes?.trim() || "No notes provided.");
    const publisher = escapeHtml(transaction.bookPublisher?.trim() || "N/A");
    const memberName = escapeHtml(transaction.memberName);
    const memberStudentId = escapeHtml(transaction.memberStudentId);
    const bookTitle = escapeHtml(transaction.bookTitle);
    const bookAuthor = escapeHtml(transaction.bookAuthor);
    const status = escapeHtml(transaction.status);
    const penaltyAmount = getPenaltyAmount(transaction);

    receiptDocument.open();
    receiptDocument.write(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Borrow Slip - ${memberName}</title>
    <style>
      body {
        margin: 0;
        padding: 24px;
        font-family: Arial, sans-serif;
        color: #1f2937;
        background: #f8f6f2;
      }

      .receipt {
        max-width: 760px;
        margin: 0 auto;
        background: #ffffff;
        border: 1px solid #ddd3c5;
        border-radius: 24px;
        padding: 32px;
      }

      .header {
        display: flex;
        align-items: center;
        gap: 18px;
        border-bottom: 2px solid #7b1113;
        padding-bottom: 18px;
        margin-bottom: 24px;
      }

      .header img {
        width: 72px;
        height: 72px;
        object-fit: contain;
      }

      .eyebrow {
        margin: 0 0 6px;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: #7b1113;
      }

      h1 {
        margin: 0;
        font-size: 24px;
      }

      h2 {
        margin: 4px 0 0;
        font-size: 16px;
        font-weight: 600;
        color: #4b5563;
      }

      .meta {
        margin: 0 0 24px;
        font-size: 14px;
        color: #6b7280;
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 16px;
      }

      .item {
        border: 1px solid #ddd3c5;
        border-radius: 16px;
        padding: 14px 16px;
        background: #fcfaf6;
      }

      .label {
        margin: 0 0 8px;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: #6b7280;
      }

      .value {
        margin: 0;
        font-size: 15px;
        font-weight: 600;
      }

      .notes {
        margin-top: 16px;
      }

      @media print {
        body {
          background: #ffffff;
          padding: 0;
        }

        .receipt {
          border: none;
          border-radius: 0;
          max-width: none;
          padding: 0;
        }
      }
    </style>
  </head>
  <body>
    <main class="receipt">
      <header class="header">
        <img src="${window.location.origin}/pup-logo.png" alt="PUP Logo" />
        <div>
          <p class="eyebrow">Polytechnic University of the Philippines</p>
          <h1>Library System Management</h1>
          <h2>Borrower Receipt Slip</h2>
        </div>
      </header>
      <p class="meta">Issued on ${toReadableDateTime(new Date().toISOString())}</p>
      <section class="grid">
        <article class="item">
          <p class="label">Student Name</p>
          <p class="value">${memberName}</p>
        </article>
        <article class="item">
          <p class="label">Student ID</p>
          <p class="value">${memberStudentId}</p>
        </article>
        <article class="item">
          <p class="label">Book Title</p>
          <p class="value">${bookTitle}</p>
        </article>
        <article class="item">
          <p class="label">Author</p>
          <p class="value">${bookAuthor}</p>
        </article>
        <article class="item">
          <p class="label">Publisher</p>
          <p class="value">${publisher}</p>
        </article>
        <article class="item">
          <p class="label">Borrow Date</p>
          <p class="value">${toReadableDateTime(transaction.borrowedAt)}</p>
        </article>
        <article class="item">
          <p class="label">Due Date</p>
          <p class="value">${toReadableDateTime(transaction.dueAt)}</p>
        </article>
        <article class="item">
          <p class="label">Status</p>
          <p class="value">${status}</p>
        </article>
        ${
          penaltyAmount > 0
            ? `<article class="item">
          <p class="label">Current Penalty</p>
          <p class="value">PHP ${penaltyAmount}</p>
        </article>`
            : ""
        }
      </section>
      <section class="item notes">
        <p class="label">Notes</p>
        <p class="value">${notes}</p>
      </section>
      <section class="item notes">
        <p class="label">Reminder</p>
        <p class="value">Books must be returned on or before the due date.</p>
        <p class="value">Overdue items will be charged PHP ${PENALTY_PER_DAY}/day until returned.</p>
      </section>
    </main>
    <script>
      window.onload = function() {
        setTimeout(function() {
          window.focus();
          window.print();
        }, 150);
      };
    </script>
  </body>
</html>`);
    receiptDocument.close();
  }

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      !bookSearch ||
      `${book.title} ${book.author} ${book.isbn ?? ""} ${book.shelfLocation ?? ""}`
        .toLowerCase()
        .includes(bookSearch.toLowerCase());
    const matchesStatus =
      bookStatusFilter === "all" || book.status === bookStatusFilter;

    return matchesSearch && matchesStatus;
  });

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      !memberSearch ||
      `${member.fullName} ${member.studentId} ${member.course} ${member.section}`
        .toLowerCase()
        .includes(memberSearch.toLowerCase());

    return matchesSearch;
  });

  const filteredTransactions = borrowTransactions.filter((transaction) => {
    const matchesSearch =
      !transactionSearch ||
      `${transaction.bookTitle} ${transaction.memberName} ${transaction.notes ?? ""}`
        .toLowerCase()
        .includes(transactionSearch.toLowerCase());
    const matchesStatus =
      transactionStatusFilter === "all" || transaction.status === transactionStatusFilter;

    return matchesSearch && matchesStatus;
  });

  const selectedTransactionRecord = transactionForm.id
    ? borrowTransactions.find((transaction) => transaction.id === Number(transactionForm.id)) ?? null
    : null;
  const availableBookOptions = books.filter(
    (book) =>
      book.availableCopies > 0 || String(book.id) === transactionForm.bookId,
  );
  const borrowBookOptions = availableBookOptions.map((book) => ({
    value: String(book.id),
    label: `${book.title} (${book.availableCopies} available)`,
  }));

  const bookColumns: ColumnDef<BookRow>[] = [
    {
      accessorKey: "title",
      header: "Book",
      cell: ({ row }) => (
        <div className="space-y-1">
          <p className="font-semibold text-[var(--color-foreground)]">{row.original.title}</p>
          <p className="text-xs text-[var(--color-muted-foreground)]">
            {row.original.author}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "publisher",
      header: "Publisher",
      cell: ({ row }) => (
        <span className="block min-w-[140px]">{row.original.publisher ?? "N/A"}</span>
      ),
    },
    {
      accessorKey: "isbn",
      header: "ISBN",
      cell: ({ row }) => row.original.isbn ?? "N/A",
    },
    {
      accessorKey: "shelfLocation",
      header: "Shelf Location",
      cell: ({ row }) => row.original.shelfLocation ?? "N/A",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <StatusPill
          tone={
            row.original.status === "available"
              ? "success"
              : row.original.status === "low_stock"
                ? "warning"
                : "danger"
          }
        >
          {row.original.status.replace("_", " ")}
        </StatusPill>
      ),
    },
    {
      accessorKey: "availableCopies",
      header: "Availability",
      cell: ({ row }) => (
        <span>
          {row.original.availableCopies}/{row.original.totalCopies}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Added",
      cell: ({ row }) => toReadableDate(row.original.createdAt),
    },
    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            size="icon"
            variant="outline"
            className="size-9"
            aria-label={`Edit book ${row.original.title}`}
            title="Edit book"
            onClick={() => beginEditBook(row.original)}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="size-9 text-[var(--color-danger)] hover:bg-rose-50"
            aria-label={`Delete book ${row.original.title}`}
            title="Delete book"
            onClick={() => void handleDeleteBook(row.original.id)}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
    },
  ];

  const memberColumns: ColumnDef<MemberRow>[] = [
    {
      accessorKey: "fullName",
      header: "Full Name",
      cell: ({ row }) => (
        <p className="font-semibold text-[var(--color-foreground)]">{row.original.fullName}</p>
      ),
    },
    {
      accessorKey: "studentId",
      header: "Student ID",
    },
    {
      accessorKey: "course",
      header: "Course",
    },
    {
      accessorKey: "section",
      header: "Section",
    },
    {
      accessorKey: "createdAt",
      header: "Joined",
      cell: ({ row }) => toReadableDate(row.original.createdAt),
    },
    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            size="icon"
            variant="outline"
            className="size-9"
            aria-label={`Edit member ${row.original.fullName}`}
            title="Edit member"
            onClick={() => beginEditMember(row.original)}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="size-9 text-[var(--color-danger)] hover:bg-rose-50"
            aria-label={`Delete member ${row.original.fullName}`}
            title="Delete member"
            onClick={() => void handleDeleteMember(row.original.id)}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
    },
  ];

  const transactionColumns: ColumnDef<BorrowTransactionRow>[] = [
    {
      accessorKey: "bookTitle",
      header: "Book",
      cell: ({ row }) => (
        <div className="space-y-1">
          <p className="font-semibold text-[var(--color-foreground)]">
            {row.original.bookTitle}
          </p>
          <p className="text-xs text-[var(--color-muted-foreground)]">
            {row.original.memberName} • {row.original.memberStudentId}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "borrowedAt",
      header: "Borrowed",
      cell: ({ row }) => toReadableDateTime(row.original.borrowedAt),
    },
    {
      accessorKey: "dueAt",
      header: "Due",
      cell: ({ row }) => toReadableDate(row.original.dueAt),
    },
    {
      accessorKey: "returnedAt",
      header: "Returned",
      cell: ({ row }) => toReadableDateTime(row.original.returnedAt),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <StatusPill
          tone={
            row.original.status === "returned"
              ? "success"
              : row.original.status === "borrowed"
                ? "warning"
                : "danger"
          }
        >
          {row.original.status}
        </StatusPill>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            size="icon"
            variant="ghost"
            className="size-9"
            aria-label={`View complete borrow details for ${row.original.memberName}`}
            title="View details"
            onClick={() => setSelectedTransaction(row.original)}
          >
            <Eye className="size-4" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="size-9"
            aria-label={`Edit borrow record for ${row.original.bookTitle} and ${row.original.memberName}`}
            title="Edit borrow record"
            onClick={() => beginEditTransaction(row.original)}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="size-9 text-[var(--color-danger)] hover:bg-rose-50"
            aria-label={`Delete borrow record for ${row.original.bookTitle} and ${row.original.memberName}`}
            title="Delete borrow record"
            onClick={() => void handleDeleteTransaction(row.original.id)}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
    },
  ];
  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-6 rounded-[28px] border border-white/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(255,249,241,0.88))] p-6 shadow-[0_24px_70px_rgba(63,32,18,0.1)] sm:p-8 lg:min-h-[180px] lg:flex-row lg:justify-between">
        <div className="flex min-h-full flex-1 flex-col justify-between gap-5">
          <div className="flex items-start gap-3">
            <div className="shrink-0 rounded-full border border-white/80 bg-white/90 p-1.5 shadow-[0_12px_30px_rgba(63,32,18,0.12)]">
              <Image
                src="/pup-logo.png"
                alt="Polytechnic University of the Philippines logo"
                width={64}
                height={64}
                className="h-14 w-14 rounded-full object-cover sm:h-16 sm:w-16"
                priority
              />
            </div>
            <div className="space-y-1 pt-1 text-left">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7b1113] sm:text-sm">
                Polytechnic University of the Philippines
              </p>
              <h1 className="text-xl font-semibold uppercase tracking-[0.12em] text-[var(--color-foreground)] sm:text-2xl">
                Library System Management
              </h1>
            </div>
          </div>

          <div className="border-t border-[color:var(--color-border)]/60 pt-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted-foreground)]">
              Live Date and Time
            </p>
            <p className="mt-2 text-sm font-medium text-[var(--color-foreground)] sm:text-base">
              {formatHeaderDateTime(headerNow)}
            </p>
          </div>
        </div>

        <div className="flex items-start justify-end">
          <div className="flex flex-wrap items-center justify-end gap-3 rounded-full border border-white/80 bg-white/78 px-3 py-2 shadow-[0_12px_30px_rgba(63,32,18,0.07)]">
            <div className="text-right">
              <p className="text-sm font-semibold text-[var(--color-foreground)]">{userName}</p>
              <p className="text-xs text-[var(--color-muted-foreground)]">{userEmail}</p>
            </div>
            <SignOutButton className="h-9 rounded-full px-4 py-2 text-xs font-semibold shadow-none" />
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Books"
          value={stats.books}
          icon={BookOpen}
          description="Titles and copies currently held in the working catalog."
          accentClassName="bg-[rgba(123,17,19,0.16)]"
          accentColor="#7b1113"
        />
        <StatCard
          label="Members"
          value={stats.members}
          icon={Users}
          description="Registered library users with active academic records."
          accentClassName="bg-[rgba(43,89,74,0.18)]"
          accentColor="#2b594a"
        />
        <StatCard
          label="Borrowed"
          value={stats.borrowed}
          icon={ArrowRightLeft}
          description="Books currently circulating across the borrowing desk."
          accentClassName="bg-[rgba(213,163,74,0.24)]"
          accentColor="#d5a34a"
        />
        <StatCard
          label="Returned"
          value={stats.returned}
          icon={CheckCircle2}
          description="Completed transactions recorded back into the collection."
          accentClassName="bg-[rgba(94,129,107,0.2)]"
          accentColor="#5e816b"
        />
      </section>

      {selectedTransaction ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="borrow-record-details-title"
          onClick={() => setSelectedTransaction(null)}
        >
          <div
            className="w-full max-w-2xl rounded-[28px] border border-white/70 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.18)] sm:p-8"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-[var(--color-muted-foreground)]">
                  Borrow Record Details
                </p>
                <h2
                  id="borrow-record-details-title"
                  className="text-2xl font-semibold text-[var(--color-foreground)]"
                >
                  {selectedTransaction.bookTitle}
                </h2>
                <p className="text-sm text-[var(--color-muted-foreground)]">
                  Borrowed by {selectedTransaction.memberName}
                </p>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="size-9"
                aria-label="Close borrow record details"
                onClick={() => setSelectedTransaction(null)}
              >
                <X className="size-4" />
              </Button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <article className="rounded-2xl border border-[color:var(--color-border)] bg-[var(--color-muted)]/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted-foreground)]">
                  Status
                </p>
                <div className="mt-3">
                  <StatusPill
                    tone={
                      selectedTransaction.status === "returned"
                        ? "success"
                        : selectedTransaction.status === "borrowed"
                          ? "warning"
                          : "danger"
                    }
                  >
                    {selectedTransaction.status}
                  </StatusPill>
                </div>
              </article>
              <article className="rounded-2xl border border-[color:var(--color-border)] bg-[var(--color-muted)]/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted-foreground)]">
                  Overdue Penalty
                </p>
                <p className="mt-3 text-2xl font-semibold text-[var(--color-foreground)]">
                  {getPenaltyAmount(selectedTransaction) > 0
                    ? `PHP ${getPenaltyAmount(selectedTransaction)}`
                    : "No penalty"}
                </p>
                <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
                  {getOverdueDays(
                    selectedTransaction.dueAt,
                    selectedTransaction.returnedAt,
                  ) > 0
                    ? `${getOverdueDays(selectedTransaction.dueAt, selectedTransaction.returnedAt)} day(s) overdue at PHP ${PENALTY_PER_DAY}/day`
                    : `Penalty rate: PHP ${PENALTY_PER_DAY}/day`}
                </p>
              </article>
              <article className="rounded-2xl border border-[color:var(--color-border)] bg-white/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted-foreground)]">
                  Student ID
                </p>
                <p className="mt-2 text-base font-medium text-[var(--color-foreground)]">
                  {selectedTransaction.memberStudentId}
                </p>
              </article>
              <article className="rounded-2xl border border-[color:var(--color-border)] bg-white/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted-foreground)]">
                  Author
                </p>
                <p className="mt-2 text-base font-medium text-[var(--color-foreground)]">
                  {selectedTransaction.bookAuthor}
                </p>
              </article>
              <article className="rounded-2xl border border-[color:var(--color-border)] bg-white/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted-foreground)]">
                  Publisher
                </p>
                <p className="mt-2 text-base font-medium text-[var(--color-foreground)]">
                  {selectedTransaction.bookPublisher?.trim() || "N/A"}
                </p>
              </article>
              <article className="rounded-2xl border border-[color:var(--color-border)] bg-white/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted-foreground)]">
                  Borrowed At
                </p>
                <p className="mt-2 text-base font-medium text-[var(--color-foreground)]">
                  {toReadableDateTime(selectedTransaction.borrowedAt)}
                </p>
              </article>
              <article className="rounded-2xl border border-[color:var(--color-border)] bg-white/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted-foreground)]">
                  Due Date
                </p>
                <p className="mt-2 text-base font-medium text-[var(--color-foreground)]">
                  {toReadableDateTime(selectedTransaction.dueAt)}
                </p>
              </article>
              <article className="rounded-2xl border border-[color:var(--color-border)] bg-white/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted-foreground)]">
                  Returned At
                </p>
                <p className="mt-2 text-base font-medium text-[var(--color-foreground)]">
                  {toReadableDateTime(selectedTransaction.returnedAt)}
                </p>
              </article>
              <article className="rounded-2xl border border-[color:var(--color-border)] bg-white/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted-foreground)]">
                  Notes
                </p>
                <p className="mt-2 text-base font-medium text-[var(--color-foreground)]">
                  {selectedTransaction.notes?.trim() || "No notes provided."}
                </p>
              </article>
              <article className="rounded-2xl border border-[color:var(--color-border)] bg-white/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted-foreground)]">
                  Actions
                </p>
                <div className="mt-4">
                  <Button
                    variant="outline"
                    className="w-full justify-center"
                    onClick={() => printBorrowReceipt(selectedTransaction)}
                  >
                    <Printer className="size-4" />
                    Print Receipt
                  </Button>
                </div>
              </article>
            </div>
          </div>
        </div>
      ) : null}

      <section className="space-y-5">
        <div className="inline-flex flex-wrap gap-2 rounded-[26px] border border-white/75 bg-white/72 p-2 shadow-[0_14px_32px_rgba(63,32,18,0.08)] backdrop-blur">
          {(["books", "members", "borrowTransactions"] as TabKey[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={cn(
                "rounded-full border px-5 py-2.5 text-sm font-semibold transition",
                activeTab === tab
                  ? "border-[rgba(123,17,19,0.18)] bg-[linear-gradient(135deg,#7b1113,#561214)] text-white shadow-[0_10px_24px_rgba(123,17,19,0.2)]"
                  : "border-transparent bg-transparent text-[var(--color-foreground)] hover:border-[color:var(--color-border)] hover:bg-white/70 hover:text-[#7b1113]",
              )}
            >
              {tabLabels[tab]}
            </button>
          ))}
        </div>

        {activeTab === "books" ? (
          <div className="space-y-5">
            <section className="rounded-[30px] border border-white/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(255,249,241,0.9))] p-6 shadow-[0_20px_56px_rgba(63,32,18,0.09)]">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-[var(--color-foreground)]">
                    Book Catalog
                  </h2>
                  <p className="text-sm text-[var(--color-muted-foreground)]">
                    Add, edit, and track book availability.
                  </p>
                </div>
                {bookForm.id ? (
                  <Button variant="ghost" onClick={() => setBookForm(emptyBookForm())}>
                    Reset Form
                  </Button>
                ) : null}
              </div>

              <form
                className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
                onSubmit={handleBookSubmit}
                noValidate
              >
                <Field label="Title">
                  <Input
                    value={bookForm.title}
                    onChange={(event) =>
                      setBookForm((current) => ({ ...current, title: event.target.value }))
                    }
                    required
                    placeholder="Introduction to Algorithms"
                  />
                </Field>
                <Field label="Author">
                  <Input
                    value={bookForm.author}
                    onChange={(event) =>
                      setBookForm((current) => ({
                        ...current,
                        author: lettersOnly(event.target.value),
                      }))
                    }
                    inputMode="text"
                    pattern="[A-Za-z\s.'-]+"
                    title="Author cannot contain numbers."
                    required
                    placeholder="Thomas H. Cormen"
                  />
                </Field>
                <Field label="ISBN">
                  <Input
                    value={bookForm.isbn}
                    onChange={(event) =>
                      setBookForm((current) => ({
                        ...current,
                        isbn: digitsOnly(event.target.value, 13),
                      }))
                    }
                    inputMode="numeric"
                    maxLength={13}
                    pattern="\d{13}"
                    required
                    title="ISBN must contain exactly 13 digits."
                    placeholder="9780262033848"
                  />
                </Field>
                <Field label="Publisher">
                  <Input
                    value={bookForm.publisher}
                    onChange={(event) =>
                      setBookForm((current) => ({
                        ...current,
                        publisher: lettersOnly(event.target.value),
                      }))
                    }
                    inputMode="text"
                    pattern="[A-Za-z\s.'-]+"
                    title="Publisher cannot contain numbers."
                    required
                    placeholder="MIT Press"
                  />
                </Field>
                <Field label="Published Year">
                  <Input
                    type="number"
                    min="1000"
                    max={currentYear}
                    value={bookForm.publishedYear}
                    onChange={(event) =>
                      setBookForm((current) => ({
                        ...current,
                        publishedYear: digitsOnly(event.target.value, 4),
                      }))
                    }
                    required
                    placeholder="2025"
                  />
                </Field>
                <Field label="Shelf Location">
                  <OptionSelect
                    value={bookForm.shelfLocation}
                    onChange={(shelfLocation) =>
                      setBookForm((current) => ({ ...current, shelfLocation }))
                    }
                    options={SHELF_LOCATION_OPTIONS}
                    placeholder="Select a shelf location"
                  />
                </Field>
                <Field label="Total Copies">
                  <Input
                    type="number"
                    min="1"
                    value={bookForm.totalCopies}
                    onChange={(event) =>
                      setBookForm((current) => ({
                        ...current,
                        totalCopies: digitsOnly(event.target.value),
                      }))
                    }
                    required
                  />
                </Field>
                <Field label="Available Copies">
                  <Input
                    type="number"
                    min="0"
                    value={bookForm.availableCopies}
                    onChange={(event) =>
                      setBookForm((current) => ({
                        ...current,
                        availableCopies: digitsOnly(event.target.value),
                      }))
                    }
                    required
                  />
                </Field>
                <div className="flex items-center gap-3 md:col-span-2 xl:col-span-3">
                  <Button type="submit" disabled={isPending || activeSubmitAction === "book"}>
                    <Plus className="size-4" />
                    {activeSubmitAction === "book"
                      ? bookForm.id
                        ? "Updating Book..."
                        : "Adding Book..."
                      : bookForm.id
                        ? "Update Book"
                        : "Add Book"}
                  </Button>
                  {bookForm.id ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setBookForm(emptyBookForm())}
                    >
                      Cancel Edit
                    </Button>
                  ) : null}
                </div>
              </form>
            </section>

            <section className="space-y-4 rounded-[28px] border border-white/70 bg-white/60 p-4 shadow-[0_16px_42px_rgba(63,32,18,0.07)] backdrop-blur sm:p-5">
              <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-3.5 size-4 text-[var(--color-muted-foreground)]" />
                  <Input
                    value={bookSearch}
                    onChange={(event) => setBookSearch(event.target.value)}
                    placeholder="Search title, author, ISBN, or shelf location"
                    className="pl-9"
                  />
                </div>
                <select
                  value={bookStatusFilter}
                  onChange={(event) => setBookStatusFilter(event.target.value)}
                  className="flex h-11 w-full rounded-xl border border-[color:var(--color-border)] bg-white/85 px-3 py-2 text-sm shadow-[0_6px_18px_rgba(63,32,18,0.04)]"
                >
                  <option value="all">All statuses</option>
                  <option value="available">Available</option>
                  <option value="low_stock">Low stock</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </div>

              <DataTable
                columns={bookColumns}
                data={filteredBooks}
                emptyMessage="No books matched your search and filters."
              />
            </section>
          </div>
        ) : null}

        {activeTab === "members" ? (
          <div className="space-y-5">
            <section className="rounded-[30px] border border-white/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(255,249,241,0.9))] p-6 shadow-[0_20px_56px_rgba(63,32,18,0.09)]">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-[var(--color-foreground)]">
                    Member Directory
                  </h2>
                  <p className="text-sm text-[var(--color-muted-foreground)]">
                    Maintain your member directory with academic details.
                  </p>
                </div>
                {memberForm.id ? (
                  <Button variant="ghost" onClick={() => setMemberForm(emptyMemberForm())}>
                    Reset Form
                  </Button>
                ) : null}
              </div>

              <form className="grid gap-4 md:grid-cols-2" onSubmit={handleMemberSubmit} noValidate>
                <Field label="Full Name">
                  <Input
                    value={memberForm.fullName}
                    onChange={(event) =>
                      setMemberForm((current) => ({
                        ...current,
                        fullName: lettersOnly(event.target.value),
                      }))
                    }
                    inputMode="text"
                    pattern="[A-Za-z\s.'-]+"
                    required
                    title="Full name cannot contain numbers."
                    placeholder="Juan Dela Cruz"
                  />
                </Field>
                <Field label="Student ID">
                  <Input
                    value={memberForm.studentId}
                    onChange={(event) =>
                      setMemberForm((current) => ({
                        ...current,
                        studentId: digitsOnly(event.target.value, 9),
                      }))
                    }
                    inputMode="numeric"
                    maxLength={9}
                    pattern="\d{9}"
                    required
                    title="Student ID must contain exactly 9 digits."
                    placeholder="123456789"
                  />
                </Field>
                <Field label="Course">
                  <OptionSelect
                    value={memberForm.course}
                    onChange={(course) =>
                      setMemberForm((current) => ({ ...current, course }))
                    }
                    options={COURSE_OPTIONS}
                    placeholder="Select a course"
                  />
                </Field>
                <Field label="Section">
                  <Input
                    value={memberForm.section}
                    onChange={(event) =>
                      setMemberForm((current) => ({
                        ...current,
                        section: event.target.value,
                      }))
                    }
                    required
                    placeholder="BSIT 2-A"
                  />
                </Field>
                <div className="flex items-center gap-3 md:col-span-2">
                  <Button
                    type="submit"
                    disabled={isPending || activeSubmitAction === "member"}
                  >
                    <Plus className="size-4" />
                    {activeSubmitAction === "member"
                      ? memberForm.id
                        ? "Updating Member..."
                        : "Adding Member..."
                      : memberForm.id
                        ? "Update Member"
                        : "Add Member"}
                  </Button>
                  {memberForm.id ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setMemberForm(emptyMemberForm())}
                    >
                      Cancel Edit
                    </Button>
                  ) : null}
                </div>
              </form>
            </section>

            <section className="space-y-4 rounded-[28px] border border-white/70 bg-white/60 p-4 shadow-[0_16px_42px_rgba(63,32,18,0.07)] backdrop-blur sm:p-5">
              <div className="grid gap-4">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-3.5 size-4 text-[var(--color-muted-foreground)]" />
                  <Input
                    value={memberSearch}
                    onChange={(event) => setMemberSearch(event.target.value)}
                    placeholder="Search member name, student ID, course, or section"
                    className="pl-9"
                  />
                </div>
              </div>

              <DataTable
                columns={memberColumns}
                data={filteredMembers}
                emptyMessage="No members matched your search."
              />
            </section>
          </div>
        ) : null}

        {activeTab === "borrowTransactions" ? (
          <div className="space-y-5">
            <section className="rounded-[30px] border border-white/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(255,249,241,0.9))] p-6 shadow-[0_20px_56px_rgba(63,32,18,0.09)]">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-[var(--color-foreground)]">
                    Borrow Transactions
                  </h2>
                  <p className="text-sm text-[var(--color-muted-foreground)]">
                    Create loans, update returns, and monitor overdue items.
                  </p>
                </div>
                {transactionForm.id ? (
                  <Button
                    variant="ghost"
                    onClick={() => setTransactionForm(emptyTransactionForm())}
                  >
                    Reset Form
                  </Button>
                ) : null}
              </div>

              <form
                className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
                onSubmit={handleTransactionSubmit}
                noValidate
              >
                <Field label="Book">
                  <OptionSelect
                    value={transactionForm.bookId}
                    onChange={(bookId) =>
                      setTransactionForm((current) => ({
                        ...current,
                        bookId,
                      }))
                    }
                    options={borrowBookOptions}
                    placeholder="Select a book"
                    maxVisibleItems={7}
                  />
                </Field>
                <Field label="Member">
                  <select
                    value={transactionForm.memberId}
                    onChange={(event) =>
                      setTransactionForm((current) => ({
                        ...current,
                        memberId: event.target.value,
                      }))
                    }
                    required
                    className="flex h-11 w-full rounded-xl border border-[color:var(--color-border)] bg-white/85 px-3 py-2 text-sm"
                  >
                    <option value="">Select a member</option>
                    {members.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.fullName}
                      </option>
                    ))}
                  </select>
                </Field>
                {transactionForm.id ? (
                  <Field label="Status">
                    <select
                      value={transactionForm.status}
                      onChange={(event) =>
                        setTransactionForm((current) => ({
                          ...current,
                          status: event.target.value as TransactionFormValues["status"],
                          returnedAt: event.target.value === "returned" ? current.returnedAt : "",
                        }))
                      }
                      className="flex h-11 w-full rounded-xl border border-[color:var(--color-border)] bg-white/85 px-3 py-2 text-sm"
                    >
                      {selectedTransactionRecord?.status === "overdue" ? (
                        <option value="overdue">Overdue (automatic)</option>
                      ) : null}
                      <option value="borrowed">Borrowed</option>
                      <option value="returned">Returned</option>
                      <option value="lost">Lost</option>
                    </select>
                  </Field>
                ) : (
                  <Field label="Status">
                    <Input value="Borrowed" disabled />
                  </Field>
                )}
                <Field label="Borrowed At">
                  <Input
                    type="datetime-local"
                    value={transactionForm.borrowedAt}
                    required
                    onChange={(event) =>
                      setTransactionForm((current) => ({
                        ...current,
                        borrowedAt: event.target.value,
                        dueAt: addSchoolDaysFromLocalDateTime(event.target.value, 5),
                      }))
                    }
                  />
                </Field>
                <Field label="Due At">
                  <Input
                    type="datetime-local"
                    value={transactionForm.dueAt}
                    disabled
                  />
                </Field>
                {transactionForm.id && transactionForm.status === "returned" ? (
                  <Field label="Returned At">
                    <Input
                      type="datetime-local"
                      value={transactionForm.returnedAt}
                      required
                      onChange={(event) =>
                        setTransactionForm((current) => ({
                          ...current,
                          returnedAt: event.target.value,
                        }))
                      }
                    />
                  </Field>
                ) : null}
                <div className="xl:col-span-3 md:col-span-2">
                  <Field label="Notes">
                    <textarea
                      value={transactionForm.notes}
                      onChange={(event) =>
                        setTransactionForm((current) => ({
                          ...current,
                          notes: event.target.value,
                        }))
                      }
                      placeholder="Optional notes about the transaction"
                      className="min-h-24 w-full rounded-xl border border-[color:var(--color-border)] bg-white/85 px-3 py-2 text-sm"
                    />
                  </Field>
                </div>
                <div className="flex items-center gap-3 xl:col-span-3 md:col-span-2">
                  <Button
                    type="submit"
                    disabled={isPending || activeSubmitAction === "transaction"}
                  >
                    <Plus className="size-4" />
                    {activeSubmitAction === "transaction"
                      ? transactionForm.id
                        ? "Updating Record..."
                        : "Creating Record..."
                      : transactionForm.id
                        ? "Update Record"
                        : "Create Record"}
                  </Button>
                  {transactionForm.id ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setTransactionForm(emptyTransactionForm())}
                    >
                      Cancel Edit
                    </Button>
                  ) : null}
                </div>
              </form>
            </section>

            <section className="space-y-4 rounded-[28px] border border-white/70 bg-white/60 p-4 shadow-[0_16px_42px_rgba(63,32,18,0.07)] backdrop-blur sm:p-5">
              <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-3.5 size-4 text-[var(--color-muted-foreground)]" />
                  <Input
                    value={transactionSearch}
                    onChange={(event) => setTransactionSearch(event.target.value)}
                    placeholder="Search book title, member, or notes"
                    className="pl-9"
                  />
                </div>
                <select
                  value={transactionStatusFilter}
                  onChange={(event) => setTransactionStatusFilter(event.target.value)}
                  className="flex h-11 w-full rounded-xl border border-[color:var(--color-border)] bg-white/85 px-3 py-2 text-sm shadow-[0_6px_18px_rgba(63,32,18,0.04)]"
                >
                  <option value="all">All statuses</option>
                  <option value="borrowed">Borrowed</option>
                  <option value="returned">Returned</option>
                  <option value="overdue">Overdue</option>
                  <option value="lost">Lost</option>
                </select>
              </div>

              <DataTable
                columns={transactionColumns}
                data={filteredTransactions}
                emptyMessage="No borrow records matched your search and filters."
              />
            </section>
          </div>
        ) : null}
      </section>

      <div className="flex justify-end">
        <Button variant="outline" onClick={() => void refreshBooksOnly()}>
          Refresh Books
        </Button>
      </div>
    </div>
  );
}
