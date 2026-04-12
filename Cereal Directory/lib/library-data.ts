import type {
  PoolConnection,
  ResultSetHeader,
  RowDataPacket,
} from "mysql2/promise";

import { promisePool } from "@/lib/db";

export type CategoryOption = {
  id: number;
  name: string;
};

export type BookStatus = "available" | "low_stock" | "unavailable";

export type MemberStatus = "active" | "inactive" | "suspended";

export type BorrowStatus = "borrowed" | "returned" | "overdue" | "lost";

export type BookRow = {
  id: number;
  categoryId: number | null;
  categoryName: string | null;
  title: string;
  isbn: string | null;
  author: string;
  publisher: string | null;
  publishedYear: number | null;
  shelfLocation: string | null;
  totalCopies: number;
  availableCopies: number;
  status: BookStatus;
  createdAt: string;
};

export type MemberRow = {
  id: number;
  authUserId: string | null;
  fullName: string;
  email: string;
  phone: string | null;
  address: string | null;
  membershipStatus: MemberStatus;
  createdAt: string;
};

export type BorrowTransactionRow = {
  id: number;
  bookId: number;
  memberId: number;
  issuedByUserId: string | null;
  returnedToUserId: string | null;
  borrowedAt: string;
  dueAt: string;
  returnedAt: string | null;
  status: BorrowStatus;
  notes: string | null;
  bookTitle: string;
  memberName: string;
  createdAt: string;
};

export type DashboardStats = {
  books: number;
  members: number;
  borrowed: number;
  returned: number;
};

export type DashboardSnapshot = {
  stats: DashboardStats;
  categories: CategoryOption[];
  books: BookRow[];
  members: MemberRow[];
  borrowTransactions: BorrowTransactionRow[];
};

export type BookInput = {
  categoryId: number | null;
  title: string;
  isbn: string | null;
  author: string;
  publisher: string | null;
  publishedYear: number | null;
  shelfLocation: string | null;
  totalCopies: number;
  availableCopies: number;
  status: BookStatus;
};

export type MemberInput = {
  fullName: string;
  email: string;
  phone: string | null;
  address: string | null;
  membershipStatus: MemberStatus;
};

export type BorrowTransactionInput = {
  bookId: number;
  memberId: number;
  dueAt: string;
  borrowedAt: string | null;
  returnedAt: string | null;
  status: BorrowStatus;
  notes: string | null;
  issuedByUserId: string | null;
  returnedToUserId: string | null;
};

type CountRow = RowDataPacket & {
  total: number;
};

type CategoryRow = RowDataPacket & {
  id: number;
  name: string;
};

type BookResultRow = RowDataPacket & {
  id: number;
  categoryId: number | null;
  categoryName: string | null;
  title: string;
  isbn: string | null;
  author: string;
  publisher: string | null;
  publishedYear: number | null;
  shelfLocation: string | null;
  totalCopies: number;
  availableCopies: number;
  status: BookStatus;
  createdAt: Date | string;
};

type MemberResultRow = RowDataPacket & {
  id: number;
  authUserId: string | null;
  fullName: string;
  email: string;
  phone: string | null;
  address: string | null;
  membershipStatus: MemberStatus;
  createdAt: Date | string;
};

type BorrowResultRow = RowDataPacket & {
  id: number;
  bookId: number;
  memberId: number;
  issuedByUserId: string | null;
  returnedToUserId: string | null;
  borrowedAt: Date | string;
  dueAt: Date | string;
  returnedAt: Date | string | null;
  status: BorrowStatus;
  notes: string | null;
  bookTitle: string;
  memberName: string;
  createdAt: Date | string;
};

function toIso(value: Date | string | null) {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return new Date(value).toISOString();
}

function normalizeText(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function normalizeRequiredText(value: string, field: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    throw new Error(`${field} is required.`);
  }

  return trimmed;
}

function normalizeNonNegativeInteger(value: number, field: string) {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${field} must be a non-negative whole number.`);
  }

  return value;
}

function normalizePositiveInteger(value: number, field: string) {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${field} must be a whole number greater than zero.`);
  }

  return value;
}

function getBookStatus(totalCopies: number, availableCopies: number) {
  if (availableCopies <= 0) {
    return "unavailable";
  }

  if (availableCopies <= Math.max(1, Math.floor(totalCopies / 3))) {
    return "low_stock";
  }

  return "available";
}

async function getBookAvailability(
  connection: PoolConnection,
  bookId: number,
) {
  const [rows] = await connection.query<RowDataPacket[]>(
    "SELECT available_copies AS availableCopies, total_copies AS totalCopies FROM books WHERE id = ? LIMIT 1",
    [bookId],
  );

  const book = rows[0];

  if (!book) {
    throw new Error("Selected book could not be found.");
  }

  return {
    availableCopies: Number(book.availableCopies),
    totalCopies: Number(book.totalCopies),
  };
}

async function updateBookAvailability(
  connection: PoolConnection,
  bookId: number,
  availableCopies: number,
  totalCopies: number,
) {
  await connection.query(
    "UPDATE books SET available_copies = ?, status = ? WHERE id = ?",
    [availableCopies, getBookStatus(totalCopies, availableCopies), bookId],
  );
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [[books]] = await promisePool.query<CountRow[]>(
    "SELECT COUNT(*) AS total FROM books",
  );
  const [[members]] = await promisePool.query<CountRow[]>(
    "SELECT COUNT(*) AS total FROM members",
  );
  const [[borrowed]] = await promisePool.query<CountRow[]>(
    "SELECT COUNT(*) AS total FROM borrow_transactions WHERE status IN ('borrowed', 'overdue')",
  );
  const [[returned]] = await promisePool.query<CountRow[]>(
    "SELECT COUNT(*) AS total FROM borrow_transactions WHERE status = 'returned'",
  );

  return {
    books: books?.total ?? 0,
    members: members?.total ?? 0,
    borrowed: borrowed?.total ?? 0,
    returned: returned?.total ?? 0,
  };
}

export async function listCategories(): Promise<CategoryOption[]> {
  const [rows] = await promisePool.query<CategoryRow[]>(
    "SELECT id, name FROM categories ORDER BY name ASC",
  );

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
  }));
}

export async function listBooks(): Promise<BookRow[]> {
  const [rows] = await promisePool.query<BookResultRow[]>(`
    SELECT
      books.id,
      books.category_id AS categoryId,
      categories.name AS categoryName,
      books.title,
      books.isbn,
      books.author,
      books.publisher,
      books.published_year AS publishedYear,
      books.shelf_location AS shelfLocation,
      books.total_copies AS totalCopies,
      books.available_copies AS availableCopies,
      books.status,
      books.created_at AS createdAt
    FROM books
    LEFT JOIN categories ON categories.id = books.category_id
    ORDER BY books.created_at DESC, books.id DESC
  `);

  return rows.map((row) => ({
    id: row.id,
    categoryId: row.categoryId,
    categoryName: row.categoryName,
    title: row.title,
    isbn: row.isbn,
    author: row.author,
    publisher: row.publisher,
    publishedYear: row.publishedYear ? Number(row.publishedYear) : null,
    shelfLocation: row.shelfLocation,
    totalCopies: row.totalCopies,
    availableCopies: row.availableCopies,
    status: row.status,
    createdAt: toIso(row.createdAt) ?? new Date(0).toISOString(),
  }));
}

export async function listMembers(): Promise<MemberRow[]> {
  const [rows] = await promisePool.query<MemberResultRow[]>(`
    SELECT
      id,
      auth_user_id AS authUserId,
      full_name AS fullName,
      email,
      phone,
      address,
      membership_status AS membershipStatus,
      created_at AS createdAt
    FROM members
    ORDER BY created_at DESC, id DESC
  `);

  return rows.map((row) => ({
    id: row.id,
    authUserId: row.authUserId,
    fullName: row.fullName,
    email: row.email,
    phone: row.phone,
    address: row.address,
    membershipStatus: row.membershipStatus,
    createdAt: toIso(row.createdAt) ?? new Date(0).toISOString(),
  }));
}

export async function listBorrowTransactions(): Promise<BorrowTransactionRow[]> {
  const [rows] = await promisePool.query<BorrowResultRow[]>(`
    SELECT
      borrow_transactions.id,
      borrow_transactions.book_id AS bookId,
      borrow_transactions.member_id AS memberId,
      borrow_transactions.issued_by_user_id AS issuedByUserId,
      borrow_transactions.returned_to_user_id AS returnedToUserId,
      borrow_transactions.borrowed_at AS borrowedAt,
      borrow_transactions.due_at AS dueAt,
      borrow_transactions.returned_at AS returnedAt,
      borrow_transactions.status,
      borrow_transactions.notes,
      borrow_transactions.created_at AS createdAt,
      books.title AS bookTitle,
      members.full_name AS memberName
    FROM borrow_transactions
    INNER JOIN books ON books.id = borrow_transactions.book_id
    INNER JOIN members ON members.id = borrow_transactions.member_id
    ORDER BY borrow_transactions.created_at DESC, borrow_transactions.id DESC
  `);

  return rows.map((row) => ({
    id: row.id,
    bookId: row.bookId,
    memberId: row.memberId,
    issuedByUserId: row.issuedByUserId,
    returnedToUserId: row.returnedToUserId,
    borrowedAt: toIso(row.borrowedAt) ?? new Date(0).toISOString(),
    dueAt: toIso(row.dueAt) ?? new Date(0).toISOString(),
    returnedAt: toIso(row.returnedAt),
    status: row.status,
    notes: row.notes,
    bookTitle: row.bookTitle,
    memberName: row.memberName,
    createdAt: toIso(row.createdAt) ?? new Date(0).toISOString(),
  }));
}

export async function getDashboardSnapshot(): Promise<DashboardSnapshot> {
  const [stats, categories, books, members, borrowTransactions] =
    await Promise.all([
      getDashboardStats(),
      listCategories(),
      listBooks(),
      listMembers(),
      listBorrowTransactions(),
    ]);

  return {
    stats,
    categories,
    books,
    members,
    borrowTransactions,
  };
}

export async function createBook(input: BookInput) {
  const normalizedTitle = normalizeRequiredText(input.title, "Title");
  const normalizedAuthor = normalizeRequiredText(input.author, "Author");
  const totalCopies = normalizePositiveInteger(input.totalCopies, "Total copies");
  const availableCopies = normalizeNonNegativeInteger(
    input.availableCopies,
    "Available copies",
  );

  if (availableCopies > totalCopies) {
    throw new Error("Available copies cannot be greater than total copies.");
  }

  const status = getBookStatus(totalCopies, availableCopies);
  const [result] = await promisePool.execute<ResultSetHeader>(
    `
      INSERT INTO books (
        category_id,
        title,
        isbn,
        author,
        publisher,
        published_year,
        shelf_location,
        total_copies,
        available_copies,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      input.categoryId,
      normalizedTitle,
      normalizeText(input.isbn),
      normalizedAuthor,
      normalizeText(input.publisher),
      input.publishedYear,
      normalizeText(input.shelfLocation),
      totalCopies,
      availableCopies,
      status,
    ],
  );

  return result.insertId;
}

export async function updateBook(id: number, input: BookInput) {
  const normalizedTitle = normalizeRequiredText(input.title, "Title");
  const normalizedAuthor = normalizeRequiredText(input.author, "Author");
  const totalCopies = normalizePositiveInteger(input.totalCopies, "Total copies");
  const availableCopies = normalizeNonNegativeInteger(
    input.availableCopies,
    "Available copies",
  );

  if (availableCopies > totalCopies) {
    throw new Error("Available copies cannot be greater than total copies.");
  }

  const status = getBookStatus(totalCopies, availableCopies);

  await promisePool.execute(
    `
      UPDATE books
      SET
        category_id = ?,
        title = ?,
        isbn = ?,
        author = ?,
        publisher = ?,
        published_year = ?,
        shelf_location = ?,
        total_copies = ?,
        available_copies = ?,
        status = ?
      WHERE id = ?
    `,
    [
      input.categoryId,
      normalizedTitle,
      normalizeText(input.isbn),
      normalizedAuthor,
      normalizeText(input.publisher),
      input.publishedYear,
      normalizeText(input.shelfLocation),
      totalCopies,
      availableCopies,
      status,
      id,
    ],
  );
}

export async function deleteBook(id: number) {
  await promisePool.execute("DELETE FROM books WHERE id = ?", [id]);
}

export async function createMember(input: MemberInput) {
  const fullName = normalizeRequiredText(input.fullName, "Full name");
  const email = normalizeRequiredText(input.email, "Email");

  if (!/\S+@\S+\.\S+/.test(email)) {
    throw new Error("Enter a valid email address.");
  }

  const [result] = await promisePool.execute<ResultSetHeader>(
    `
      INSERT INTO members (
        full_name,
        email,
        phone,
        address,
        membership_status
      )
      VALUES (?, ?, ?, ?, ?)
    `,
    [
      fullName,
      email,
      normalizeText(input.phone),
      normalizeText(input.address),
      input.membershipStatus,
    ],
  );

  return result.insertId;
}

export async function updateMember(id: number, input: MemberInput) {
  const fullName = normalizeRequiredText(input.fullName, "Full name");
  const email = normalizeRequiredText(input.email, "Email");

  if (!/\S+@\S+\.\S+/.test(email)) {
    throw new Error("Enter a valid email address.");
  }

  await promisePool.execute(
    `
      UPDATE members
      SET
        full_name = ?,
        email = ?,
        phone = ?,
        address = ?,
        membership_status = ?
      WHERE id = ?
    `,
    [
      fullName,
      email,
      normalizeText(input.phone),
      normalizeText(input.address),
      input.membershipStatus,
      id,
    ],
  );
}

export async function deleteMember(id: number) {
  await promisePool.execute("DELETE FROM members WHERE id = ?", [id]);
}

export async function createBorrowTransaction(input: BorrowTransactionInput) {
  const dueAt = new Date(input.dueAt);

  if (Number.isNaN(dueAt.getTime())) {
    throw new Error("Due date is required.");
  }

  const borrowedAt = input.borrowedAt ? new Date(input.borrowedAt) : new Date();

  if (Number.isNaN(borrowedAt.getTime())) {
    throw new Error("Borrowed date is invalid.");
  }

  const returnedAt = input.returnedAt ? new Date(input.returnedAt) : null;

  if (returnedAt && Number.isNaN(returnedAt.getTime())) {
    throw new Error("Returned date is invalid.");
  }

  const connection = await promisePool.getConnection();

  try {
    await connection.beginTransaction();

    const { availableCopies, totalCopies } = await getBookAvailability(
      connection,
      input.bookId,
    );

    if (input.status !== "returned" && availableCopies <= 0) {
      throw new Error("This book has no available copies left to borrow.");
    }

    const [result] = await connection.execute<ResultSetHeader>(
      `
        INSERT INTO borrow_transactions (
          book_id,
          member_id,
          issued_by_user_id,
          returned_to_user_id,
          borrowed_at,
          due_at,
          returned_at,
          status,
          notes
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        input.bookId,
        input.memberId,
        input.issuedByUserId,
        input.returnedToUserId,
        borrowedAt,
        dueAt,
        returnedAt,
        input.status,
        normalizeText(input.notes),
      ],
    );

    if (input.status !== "returned") {
      await updateBookAvailability(
        connection,
        input.bookId,
        availableCopies - 1,
        totalCopies,
      );
    }

    await connection.commit();

    return result.insertId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function updateBorrowTransaction(
  id: number,
  input: BorrowTransactionInput,
) {
  const dueAt = new Date(input.dueAt);

  if (Number.isNaN(dueAt.getTime())) {
    throw new Error("Due date is required.");
  }

  const borrowedAt = input.borrowedAt ? new Date(input.borrowedAt) : new Date();

  if (Number.isNaN(borrowedAt.getTime())) {
    throw new Error("Borrowed date is invalid.");
  }

  const returnedAt = input.returnedAt ? new Date(input.returnedAt) : null;

  if (returnedAt && Number.isNaN(returnedAt.getTime())) {
    throw new Error("Returned date is invalid.");
  }

  const connection = await promisePool.getConnection();

  try {
    await connection.beginTransaction();

    const [rows] = await connection.query<RowDataPacket[]>(
      `
        SELECT
          book_id AS bookId,
          status
        FROM borrow_transactions
        WHERE id = ?
        LIMIT 1
      `,
      [id],
    );

    const existing = rows[0];

    if (!existing) {
      throw new Error("Borrow transaction could not be found.");
    }

    const previousBookId = Number(existing.bookId);
    const previousStatus = existing.status as BorrowStatus;
    const currentBook = await getBookAvailability(connection, input.bookId);

    if (
      input.status !== "returned" &&
      (input.bookId !== previousBookId ||
        previousStatus === "returned" ||
        previousStatus === "lost") &&
      currentBook.availableCopies <= 0
    ) {
      throw new Error("This book has no available copies left to borrow.");
    }

    await connection.execute(
      `
        UPDATE borrow_transactions
        SET
          book_id = ?,
          member_id = ?,
          issued_by_user_id = ?,
          returned_to_user_id = ?,
          borrowed_at = ?,
          due_at = ?,
          returned_at = ?,
          status = ?,
          notes = ?
        WHERE id = ?
      `,
      [
        input.bookId,
        input.memberId,
        input.issuedByUserId,
        input.returnedToUserId,
        borrowedAt,
        dueAt,
        returnedAt,
        input.status,
        normalizeText(input.notes),
        id,
      ],
    );

    if (previousBookId === input.bookId) {
      const shouldRestore =
        previousStatus !== "returned" &&
        previousStatus !== "lost" &&
        input.status === "returned";
      const shouldConsume =
        (previousStatus === "returned" || previousStatus === "lost") &&
        input.status !== "returned";

      if (shouldRestore) {
        await updateBookAvailability(
          connection,
          input.bookId,
          currentBook.availableCopies + 1,
          currentBook.totalCopies,
        );
      } else if (shouldConsume) {
        await updateBookAvailability(
          connection,
          input.bookId,
          currentBook.availableCopies - 1,
          currentBook.totalCopies,
        );
      }
    } else {
      const previousBook = await getBookAvailability(connection, previousBookId);

      if (previousStatus !== "returned" && previousStatus !== "lost") {
        await updateBookAvailability(
          connection,
          previousBookId,
          previousBook.availableCopies + 1,
          previousBook.totalCopies,
        );
      }

      if (input.status !== "returned" && input.status !== "lost") {
        await updateBookAvailability(
          connection,
          input.bookId,
          currentBook.availableCopies - 1,
          currentBook.totalCopies,
        );
      }
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function deleteBorrowTransaction(id: number) {
  const connection = await promisePool.getConnection();

  try {
    await connection.beginTransaction();

    const [rows] = await connection.query<RowDataPacket[]>(
      "SELECT book_id AS bookId, status FROM borrow_transactions WHERE id = ? LIMIT 1",
      [id],
    );

    const existing = rows[0];

    if (!existing) {
      throw new Error("Borrow transaction could not be found.");
    }

    await connection.execute("DELETE FROM borrow_transactions WHERE id = ?", [id]);

    if (existing.status !== "returned" && existing.status !== "lost") {
      const previousBook = await getBookAvailability(connection, Number(existing.bookId));
      await updateBookAvailability(
        connection,
        Number(existing.bookId),
        previousBook.availableCopies + 1,
        previousBook.totalCopies,
      );
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
