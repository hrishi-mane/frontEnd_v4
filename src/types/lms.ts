export interface Book {
    id: number;
    isbn: string;
    title: string;
    author: string;
    category: string;
    publicationYear: number;
    copiesAvailable: number;
    available: boolean;
}

export interface Member {
    id: number;
    userName: string;
    emailId: string;
    phoneNumber: string;
    membershipStartDate: string;
    membershipEndDate: string;
    planName: string;
    activeBorrowCount: number;
    activeReservationCount: number;
    queuedReservationCount: number;
}

export interface Transaction {
    id: number;
    bookId: number;
    bookTitle: string;
    bookIsbn: string;
    memberId: number;
    memberUserName: string;
    borrowDate: string;
    returnedDate: string | null;
    dueDate: string;
    transactionStatus: 'ACTIVE' | 'RETURNED' | 'FINE_PENDING';
    overdue: boolean;
    daysOverdue: number;
}

export interface Reservation {
    id: number;
    bookId: number;
    bookTitle: string;
    bookIsbn: string;
    memberId: number;
    memberUserName: string;
    reservationDate: string;
    expiryDate: string | null;
    status: 'QUEUED' | 'ACTIVE' | 'FULFILLED' | 'EXPIRED';
    daysUntilExpiry: number;
}

export type PlanType = 'STANDARD' | 'PREMIUM';
export type AddOn = 'EXTENDED_BORROWING';
