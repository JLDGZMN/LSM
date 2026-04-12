"use client";

import * as React from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { DataTable } from "@/components/dashboard/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  type BookRow,
  type BorrowTransactionRow,
  type CategoryOption,
  type DashboardStats,
  type MemberRow,
} from "@/lib/library-data";
import { cn } from "@/lib/utils";

type TabKey = "books" | "members" | "borrowTransactions";

type BookFormValues = {
  id: string;
  categoryId: string;
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
  email: string;
  phone: string;
  address: string;
  membershipStatus: "active" | "inactive" | "suspended";
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
  initialCategories: CategoryOption[];
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

const emptyBookForm = (): BookFormValues => ({
  id: "",
  categoryId: "",
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
  email: "",
  phone: "",
  address: "",
  membershipStatus: "active",
});

const emptyTransactionForm = (): TransactionFormValues => ({
  id: "",
  bookId: "",
  memberId: "",
  borrowedAt: toDateTimeLocal(new Date().toISOString()),
  dueAt: "",
  returnedAt: "",
  status: "borrowed",
  notes: "",
});

function toDateTimeLocal(value: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

function toReadableDate(value: string | null) {
  if (!value) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
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
  }).format(new Date(value));
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
}: {
  label: string;
  value: number;
}) {
  return (
    <article className="rounded-[24px] border border-white/70 bg-white/88 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <p className="text-sm font-medium text-[var(--color-muted-foreground)]">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-[var(--color-foreground)]">{value}</p>
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
        "inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold capitalize",
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

export function LibraryDashboard({
  initialStats,
  initialCategories,
  initialBooks,
  initialMembers,
  initialBorrowTransactions,
  userName,
  userEmail,
}: LibraryDashboardProps) {
  const [activeTab, setActiveTab] = React.useState<TabKey>("books");
  const [stats, setStats] = React.useState(initialStats);
  const [categories] = React.useState(initialCategories);
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
  const [bookCategoryFilter, setBookCategoryFilter] = React.useState("all");
  const [memberStatusFilter, setMemberStatusFilter] = React.useState("all");
  const [transactionStatusFilter, setTransactionStatusFilter] = React.useState("all");
  const [message, setMessage] = React.useState("Manage your live library records below.");
  const [isPending, startTransition] = React.useTransition();

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
      categoryId: book.categoryId ? String(book.categoryId) : "",
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
    setMessage(`Editing "${book.title}". Update the fields and save your changes.`);
  }

  function beginEditMember(member: MemberRow) {
    setMemberForm({
      id: String(member.id),
      fullName: member.fullName,
      email: member.email,
      phone: member.phone ?? "",
      address: member.address ?? "",
      membershipStatus: member.membershipStatus,
    });
    setActiveTab("members");
    setMessage(`Editing member "${member.fullName}".`);
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
    setMessage(
      `Editing borrow record for "${transaction.bookTitle}" and ${transaction.memberName}.`,
    );
  }

  async function handleBookSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const payload = {
        categoryId: bookForm.categoryId,
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

      setMessage(bookForm.id ? "Book updated successfully." : "Book added successfully.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save this book.");
    }
  }

  async function handleMemberSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

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

      setMessage(
        memberForm.id ? "Member updated successfully." : "Member added successfully.",
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save this member.");
    }
  }

  async function handleTransactionSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

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

      setMessage(
        transactionForm.id
          ? "Borrow record updated successfully."
          : "Borrow record created successfully.",
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to save this borrow record.",
      );
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

      setMessage("Book deleted successfully.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to delete this book.");
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

      setMessage("Member deleted successfully.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to delete this member.");
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

      setMessage("Borrow record deleted successfully.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to delete this borrow record.",
      );
    }
  }

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      !bookSearch ||
      `${book.title} ${book.author} ${book.isbn ?? ""} ${book.categoryName ?? ""}`
        .toLowerCase()
        .includes(bookSearch.toLowerCase());
    const matchesStatus =
      bookStatusFilter === "all" || book.status === bookStatusFilter;
    const matchesCategory =
      bookCategoryFilter === "all" ||
      String(book.categoryId ?? "uncategorized") === bookCategoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      !memberSearch ||
      `${member.fullName} ${member.email} ${member.phone ?? ""}`
        .toLowerCase()
        .includes(memberSearch.toLowerCase());
    const matchesStatus =
      memberStatusFilter === "all" || member.membershipStatus === memberStatusFilter;

    return matchesSearch && matchesStatus;
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
      accessorKey: "categoryName",
      header: "Category",
      cell: ({ row }) => row.original.categoryName ?? "Uncategorized",
    },
    {
      accessorKey: "isbn",
      header: "ISBN",
      cell: ({ row }) => row.original.isbn ?? "N/A",
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
            size="sm"
            variant="outline"
            onClick={() => beginEditBook(row.original)}
          >
            <Pencil className="size-4" />
            Edit
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-[var(--color-danger)] hover:bg-rose-50"
            onClick={() => void handleDeleteBook(row.original.id)}
          >
            <Trash2 className="size-4" />
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const memberColumns: ColumnDef<MemberRow>[] = [
    {
      accessorKey: "fullName",
      header: "Member",
      cell: ({ row }) => (
        <div className="space-y-1">
          <p className="font-semibold text-[var(--color-foreground)]">
            {row.original.fullName}
          </p>
          <p className="text-xs text-[var(--color-muted-foreground)]">{row.original.email}</p>
        </div>
      ),
    },
    {
      accessorKey: "phone",
      header: "Contact",
      cell: ({ row }) => row.original.phone ?? "N/A",
    },
    {
      accessorKey: "membershipStatus",
      header: "Status",
      cell: ({ row }) => (
        <StatusPill
          tone={
            row.original.membershipStatus === "active"
              ? "success"
              : row.original.membershipStatus === "inactive"
                ? "warning"
                : "danger"
          }
        >
          {row.original.membershipStatus}
        </StatusPill>
      ),
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
            size="sm"
            variant="outline"
            onClick={() => beginEditMember(row.original)}
          >
            <Pencil className="size-4" />
            Edit
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-[var(--color-danger)] hover:bg-rose-50"
            onClick={() => void handleDeleteMember(row.original.id)}
          >
            <Trash2 className="size-4" />
            Delete
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
            {row.original.memberName}
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
            size="sm"
            variant="outline"
            onClick={() => beginEditTransaction(row.original)}
          >
            <Pencil className="size-4" />
            Edit
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-[var(--color-danger)] hover:bg-rose-50"
            onClick={() => void handleDeleteTransaction(row.original.id)}
          >
            <Trash2 className="size-4" />
            Delete
          </Button>
        </div>
      ),
    },
  ];
  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-4 rounded-[28px] border border-white/70 bg-white/85 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-[var(--color-muted-foreground)]">
            Library Dashboard
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-foreground)]">
            Welcome, {userName}
          </h1>
          <p className="text-sm leading-6 text-[var(--color-muted-foreground)]">
            Signed in as {userEmail}. Manage books, members, and borrowing activity from one
            place.
          </p>
        </div>
        <div className="flex flex-col items-stretch gap-3 sm:items-end">
          <SignOutButton />
          <div
            className={cn(
              "rounded-2xl border px-4 py-3 text-sm",
              isPending
                ? "border-[color:var(--color-warning-border)] bg-[var(--color-warning-bg)] text-[var(--color-warning-foreground)]"
                : "border-[color:var(--color-border)] bg-[var(--color-muted)] text-[var(--color-muted-foreground)]",
            )}
          >
            {isPending ? "Refreshing records..." : message}
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Books" value={stats.books} />
        <StatCard label="Members" value={stats.members} />
        <StatCard label="Borrowed" value={stats.borrowed} />
        <StatCard label="Returned" value={stats.returned} />
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap gap-3">
          {(["books", "members", "borrowTransactions"] as TabKey[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-semibold transition",
                activeTab === tab
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white shadow-sm"
                  : "border-[color:var(--color-border)] bg-white/80 text-[var(--color-foreground)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]",
              )}
            >
              {tabLabels[tab]}
            </button>
          ))}
        </div>

        {activeTab === "books" ? (
          <div className="space-y-5">
            <section className="rounded-[24px] border border-white/70 bg-white/88 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
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

              <form className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" onSubmit={handleBookSubmit}>
                <Field label="Title">
                  <Input
                    value={bookForm.title}
                    onChange={(event) =>
                      setBookForm((current) => ({ ...current, title: event.target.value }))
                    }
                    placeholder="Introduction to Algorithms"
                  />
                </Field>
                <Field label="Author">
                  <Input
                    value={bookForm.author}
                    onChange={(event) =>
                      setBookForm((current) => ({ ...current, author: event.target.value }))
                    }
                    placeholder="Thomas H. Cormen"
                  />
                </Field>
                <Field label="Category">
                  <select
                    value={bookForm.categoryId}
                    onChange={(event) =>
                      setBookForm((current) => ({
                        ...current,
                        categoryId: event.target.value,
                      }))
                    }
                    className="flex h-11 w-full rounded-xl border border-[color:var(--color-border)] bg-white/85 px-3 py-2 text-sm"
                  >
                    <option value="">No category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="ISBN">
                  <Input
                    value={bookForm.isbn}
                    onChange={(event) =>
                      setBookForm((current) => ({ ...current, isbn: event.target.value }))
                    }
                    placeholder="9780262033848"
                  />
                </Field>
                <Field label="Publisher">
                  <Input
                    value={bookForm.publisher}
                    onChange={(event) =>
                      setBookForm((current) => ({ ...current, publisher: event.target.value }))
                    }
                    placeholder="MIT Press"
                  />
                </Field>
                <Field label="Published Year">
                  <Input
                    type="number"
                    value={bookForm.publishedYear}
                    onChange={(event) =>
                      setBookForm((current) => ({
                        ...current,
                        publishedYear: event.target.value,
                      }))
                    }
                    placeholder="2025"
                  />
                </Field>
                <Field label="Shelf Location">
                  <Input
                    value={bookForm.shelfLocation}
                    onChange={(event) =>
                      setBookForm((current) => ({
                        ...current,
                        shelfLocation: event.target.value,
                      }))
                    }
                    placeholder="A-12"
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
                        totalCopies: event.target.value,
                      }))
                    }
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
                        availableCopies: event.target.value,
                      }))
                    }
                  />
                </Field>
                <div className="flex items-center gap-3 md:col-span-2 xl:col-span-3">
                  <Button type="submit" disabled={isPending}>
                    <Plus className="size-4" />
                    {bookForm.id ? "Update Book" : "Add Book"}
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

            <section className="space-y-4">
              <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px_220px]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-3.5 size-4 text-[var(--color-muted-foreground)]" />
                  <Input
                    value={bookSearch}
                    onChange={(event) => setBookSearch(event.target.value)}
                    placeholder="Search title, author, ISBN, or category"
                    className="pl-9"
                  />
                </div>
                <select
                  value={bookStatusFilter}
                  onChange={(event) => setBookStatusFilter(event.target.value)}
                  className="flex h-11 w-full rounded-xl border border-[color:var(--color-border)] bg-white/85 px-3 py-2 text-sm"
                >
                  <option value="all">All statuses</option>
                  <option value="available">Available</option>
                  <option value="low_stock">Low stock</option>
                  <option value="unavailable">Unavailable</option>
                </select>
                <select
                  value={bookCategoryFilter}
                  onChange={(event) => setBookCategoryFilter(event.target.value)}
                  className="flex h-11 w-full rounded-xl border border-[color:var(--color-border)] bg-white/85 px-3 py-2 text-sm"
                >
                  <option value="all">All categories</option>
                  <option value="uncategorized">Uncategorized</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
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
            <section className="rounded-[24px] border border-white/70 bg-white/88 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-[var(--color-foreground)]">
                    Member Directory
                  </h2>
                  <p className="text-sm text-[var(--color-muted-foreground)]">
                    Maintain your active library members and contact details.
                  </p>
                </div>
                {memberForm.id ? (
                  <Button variant="ghost" onClick={() => setMemberForm(emptyMemberForm())}>
                    Reset Form
                  </Button>
                ) : null}
              </div>

              <form className="grid gap-4 md:grid-cols-2" onSubmit={handleMemberSubmit}>
                <Field label="Full Name">
                  <Input
                    value={memberForm.fullName}
                    onChange={(event) =>
                      setMemberForm((current) => ({
                        ...current,
                        fullName: event.target.value,
                      }))
                    }
                    placeholder="Maria Santos"
                  />
                </Field>
                <Field label="Email">
                  <Input
                    type="email"
                    value={memberForm.email}
                    onChange={(event) =>
                      setMemberForm((current) => ({
                        ...current,
                        email: event.target.value,
                      }))
                    }
                    placeholder="maria@example.com"
                  />
                </Field>
                <Field label="Phone">
                  <Input
                    value={memberForm.phone}
                    onChange={(event) =>
                      setMemberForm((current) => ({ ...current, phone: event.target.value }))
                    }
                    placeholder="+63 912 345 6789"
                  />
                </Field>
                <Field label="Status">
                  <select
                    value={memberForm.membershipStatus}
                    onChange={(event) =>
                      setMemberForm((current) => ({
                        ...current,
                        membershipStatus: event.target.value as MemberFormValues["membershipStatus"],
                      }))
                    }
                    className="flex h-11 w-full rounded-xl border border-[color:var(--color-border)] bg-white/85 px-3 py-2 text-sm"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </Field>
                <div className="md:col-span-2">
                  <Field label="Address">
                    <textarea
                      value={memberForm.address}
                      onChange={(event) =>
                        setMemberForm((current) => ({
                          ...current,
                          address: event.target.value,
                        }))
                      }
                      placeholder="Street, city, province"
                      className="min-h-24 w-full rounded-xl border border-[color:var(--color-border)] bg-white/85 px-3 py-2 text-sm"
                    />
                  </Field>
                </div>
                <div className="flex items-center gap-3 md:col-span-2">
                  <Button type="submit" disabled={isPending}>
                    <Plus className="size-4" />
                    {memberForm.id ? "Update Member" : "Add Member"}
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

            <section className="space-y-4">
              <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-3.5 size-4 text-[var(--color-muted-foreground)]" />
                  <Input
                    value={memberSearch}
                    onChange={(event) => setMemberSearch(event.target.value)}
                    placeholder="Search member name, email, or phone"
                    className="pl-9"
                  />
                </div>
                <select
                  value={memberStatusFilter}
                  onChange={(event) => setMemberStatusFilter(event.target.value)}
                  className="flex h-11 w-full rounded-xl border border-[color:var(--color-border)] bg-white/85 px-3 py-2 text-sm"
                >
                  <option value="all">All statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              <DataTable
                columns={memberColumns}
                data={filteredMembers}
                emptyMessage="No members matched your search and filters."
              />
            </section>
          </div>
        ) : null}

        {activeTab === "borrowTransactions" ? (
          <div className="space-y-5">
            <section className="rounded-[24px] border border-white/70 bg-white/88 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
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

              <form className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" onSubmit={handleTransactionSubmit}>
                <Field label="Book">
                  <select
                    value={transactionForm.bookId}
                    onChange={(event) =>
                      setTransactionForm((current) => ({
                        ...current,
                        bookId: event.target.value,
                      }))
                    }
                    className="flex h-11 w-full rounded-xl border border-[color:var(--color-border)] bg-white/85 px-3 py-2 text-sm"
                  >
                    <option value="">Select a book</option>
                    {books.map((book) => (
                      <option key={book.id} value={book.id}>
                        {book.title} ({book.availableCopies} available)
                      </option>
                    ))}
                  </select>
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
                <Field label="Status">
                  <select
                    value={transactionForm.status}
                    onChange={(event) =>
                      setTransactionForm((current) => ({
                        ...current,
                        status: event.target.value as TransactionFormValues["status"],
                      }))
                    }
                    className="flex h-11 w-full rounded-xl border border-[color:var(--color-border)] bg-white/85 px-3 py-2 text-sm"
                  >
                    <option value="borrowed">Borrowed</option>
                    <option value="returned">Returned</option>
                    <option value="overdue">Overdue</option>
                    <option value="lost">Lost</option>
                  </select>
                </Field>
                <Field label="Borrowed At">
                  <Input
                    type="datetime-local"
                    value={transactionForm.borrowedAt}
                    onChange={(event) =>
                      setTransactionForm((current) => ({
                        ...current,
                        borrowedAt: event.target.value,
                      }))
                    }
                  />
                </Field>
                <Field label="Due At">
                  <Input
                    type="datetime-local"
                    value={transactionForm.dueAt}
                    onChange={(event) =>
                      setTransactionForm((current) => ({
                        ...current,
                        dueAt: event.target.value,
                      }))
                    }
                  />
                </Field>
                <Field label="Returned At">
                  <Input
                    type="datetime-local"
                    value={transactionForm.returnedAt}
                    onChange={(event) =>
                      setTransactionForm((current) => ({
                        ...current,
                        returnedAt: event.target.value,
                      }))
                    }
                  />
                </Field>
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
                  <Button type="submit" disabled={isPending}>
                    <Plus className="size-4" />
                    {transactionForm.id ? "Update Record" : "Create Record"}
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

            <section className="space-y-4">
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
                  className="flex h-11 w-full rounded-xl border border-[color:var(--color-border)] bg-white/85 px-3 py-2 text-sm"
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
