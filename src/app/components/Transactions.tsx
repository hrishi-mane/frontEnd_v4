import {useEffect, useState} from 'react';
import {Book, Member} from '../../types/lms';
import {ApiError, apiRequest, apiRequestJson, parseId} from '../../utils/api';
import {Button} from './ui/button';
import {Input} from './ui/input';
import {Label} from './ui/label';
import {Card} from './ui/card';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from './ui/select';
import {BookMarked, RotateCcw} from 'lucide-react';
import {toast} from 'sonner';
import {TransactionsList} from './TransactionsList';

export function Transactions() {
    const [books, setBooks] = useState<Book[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const [borrowData, setBorrowData] = useState({
        bookId: '',
        memberId: '',
    });
    const [returnData, setReturnData] = useState({
        transactionId: '',
    });

    useEffect(() => {
        fetchBooks();
        fetchMembers();
    }, []);

    const fetchBooks = async () => {
        try {
            const data = await apiRequestJson<Book[]>('/getAllBooks');
            setBooks(data.filter(book => book.available && book.copiesAvailable > 0));
        } catch (error) {
            if (error instanceof ApiError) {
                toast.error('Failed to load books');
            }
        }
    };

    const fetchMembers = async () => {
        try {
            const data = await apiRequestJson<Member[]>('/getAllMembers');
            setMembers(data);
        } catch (error) {
            if (error instanceof ApiError) {
                toast.error('Failed to load members');
            }
        }
    };

    const handleBorrow = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await apiRequest(
                `/borrowBook/?book_id=${borrowData.bookId}&member_id=${borrowData.memberId}`
            );

            const transactionId = parseId(response, 'Transaction ID');
            toast.success(`Book borrowed successfully! Transaction ID: ${transactionId}`);
            setBorrowData({bookId: '', memberId: ''});
            fetchBooks();
        } catch (error) {
            if (error instanceof ApiError) {
                toast.error(error.message);
            }
        }
    };

    const handleReturn = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await apiRequest(`/processReturn/${returnData.transactionId}`);

            if (response.includes('LATE')) {
                const match = response.match(/fine: \$([\d.]+)/);
                const fine = match ? match[1] : '';
                toast.warning(`Book returned late. Fine: $${fine}`, {duration: 5000});
            } else {
                toast.success('Book returned on time!');
            }

            setReturnData({transactionId: ''});
        } catch (error) {
            if (error instanceof ApiError) {
                toast.error(error.message);
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
                <Card className="p-6">
                    <h2 className="flex items-center gap-2 mb-4">
                        <BookMarked className="w-5 h-5"/>
                        Borrow Book
                    </h2>

                    <form onSubmit={handleBorrow} className="space-y-4">
                        <div>
                            <Label htmlFor="bookSelect">Select Book *</Label>
                            <Select
                                value={borrowData.bookId}
                                onValueChange={(value) => setBorrowData({...borrowData, bookId: value})}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose a book"/>
                                </SelectTrigger>
                                <SelectContent>
                                    {books.length === 0 ? (
                                        <div className="p-2 text-sm text-gray-500">No available books</div>
                                    ) : (
                                        books.map((book) => (
                                            <SelectItem key={book.id} value={book.id.toString()}>
                                                {book.title} by {book.author} (ID: {book.id})
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="memberSelect">Select Member *</Label>
                            <Select
                                value={borrowData.memberId}
                                onValueChange={(value) => setBorrowData({...borrowData, memberId: value})}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose a member"/>
                                </SelectTrigger>
                                <SelectContent>
                                    {members.length === 0 ? (
                                        <div className="p-2 text-sm text-gray-500">No members registered</div>
                                    ) : (
                                        members.map((member) => (
                                            <SelectItem key={member.id} value={member.id.toString()}>
                                                {member.userName} ({member.emailId}) - ID: {member.id}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        <Button type="submit" className="w-full" disabled={!borrowData.bookId || !borrowData.memberId}>
                            <BookMarked className="w-4 h-4 mr-2"/>
                            Borrow Book
                        </Button>
                    </form>
                </Card>

                <Card className="p-6">
                    <h2 className="flex items-center gap-2 mb-4">
                        <RotateCcw className="w-5 h-5"/>
                        Return Book
                    </h2>

                    <form onSubmit={handleReturn} className="space-y-4">
                        <div>
                            <Label htmlFor="transactionId">Transaction ID *</Label>
                            <Input
                                id="transactionId"
                                type="number"
                                value={returnData.transactionId}
                                onChange={(e) => setReturnData({transactionId: e.target.value})}
                                placeholder="Enter transaction ID"
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Find the transaction ID in the transaction history below
                            </p>
                        </div>

                        <Button type="submit" className="w-full" variant="outline">
                            <RotateCcw className="w-4 h-4 mr-2"/>
                            Process Return
                        </Button>
                    </form>
                </Card>
            </div>

            <TransactionsList/>
        </div>
    );
}
