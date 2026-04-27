import {useEffect, useState} from 'react';
import {Book, Member} from '../../types/lms';
import {ApiError, apiRequest, apiRequestJson, parseId} from '../../utils/api';
import {Button} from './ui/button';
import {Input} from './ui/input';
import {Label} from './ui/label';
import {Card} from './ui/card';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from './ui/select';
import {Bookmark, CheckCircle} from 'lucide-react';
import {toast} from 'sonner';
import {ReservationsList} from './ReservationsList';

export function Reservations() {
    const [books, setBooks] = useState<Book[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const [reserveData, setReserveData] = useState({
        bookId: '',
        memberId: '',
    });
    const [pickupData, setPickupData] = useState({
        reservationId: '',
    });

    useEffect(() => {
        fetchBooks();
        fetchMembers();
    }, []);

    const fetchBooks = async () => {
        try {
            const data = await apiRequestJson<Book[]>('/getAllBooks');
            setBooks(data.filter(book => !book.available || book.copiesAvailable === 0));
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

    const handleReserve = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await apiRequest(
                `/reserveBook?book_id=${reserveData.bookId}&member_id=${reserveData.memberId}`,
                {method: 'POST'}
            );

            const reservationId = parseId(response, 'id:');
            const queueMatch = response.match(/queue number is:(\d+)/);
            const queuePosition = queueMatch ? queueMatch[1] : '';

            toast.success(
                `Reservation created! ID: ${reservationId}, Queue position: ${queuePosition}`,
                {duration: 5000}
            );
            setReserveData({bookId: '', memberId: ''});
            fetchBooks();
        } catch (error) {
            if (error instanceof ApiError) {
                toast.error(error.message);
            }
        }
    };

    const handlePickup = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await apiRequest(`/processReservationPickup/${pickupData.reservationId}`, {
                method: 'POST',
            });

            toast.success('Reservation fulfilled successfully!');
            setPickupData({reservationId: ''});
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
                        <Bookmark className="w-5 h-5"/>
                        Reserve Book
                    </h2>

                    <form onSubmit={handleReserve} className="space-y-4">
                        <div>
                            <Label htmlFor="reserveBookSelect">Select Unavailable Book *</Label>
                            <Select
                                value={reserveData.bookId}
                                onValueChange={(value) => setReserveData({...reserveData, bookId: value})}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose a book"/>
                                </SelectTrigger>
                                <SelectContent>
                                    {books.length === 0 ? (
                                        <div className="p-2 text-sm text-gray-500">No unavailable books</div>
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
                            <Label htmlFor="reserveMemberSelect">Select Member *</Label>
                            <Select
                                value={reserveData.memberId}
                                onValueChange={(value) => setReserveData({...reserveData, memberId: value})}
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

                        <Button type="submit" className="w-full"
                                disabled={!reserveData.bookId || !reserveData.memberId}>
                            <Bookmark className="w-4 h-4 mr-2"/>
                            Reserve Book
                        </Button>
                    </form>
                </Card>

                <Card className="p-6">
                    <h2 className="flex items-center gap-2 mb-4">
                        <CheckCircle className="w-5 h-5"/>
                        Process Pickup
                    </h2>

                    <form onSubmit={handlePickup} className="space-y-4">
                        <div>
                            <Label htmlFor="reservationId">Reservation ID *</Label>
                            <Input
                                id="reservationId"
                                type="number"
                                value={pickupData.reservationId}
                                onChange={(e) => setPickupData({reservationId: e.target.value})}
                                placeholder="Enter reservation ID"
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                You will receive an email when your reservation becomes active
                            </p>
                        </div>

                        <Button type="submit" className="w-full" variant="outline">
                            <CheckCircle className="w-4 h-4 mr-2"/>
                            Confirm Pickup
                        </Button>
                    </form>
                </Card>
            </div>

            <ReservationsList/>
        </div>
    );
}
