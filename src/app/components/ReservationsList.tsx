import {useEffect, useState} from 'react';
import {Reservation} from '../../types/lms';
import {ApiError, apiRequestJson} from '../../utils/api';
import {Button} from './ui/button';
import {Card} from './ui/card';
import {BookmarkCheck} from 'lucide-react';
import {toast} from 'sonner';

export function ReservationsList() {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchReservations = async () => {
        setLoading(true);
        try {
            const data = await apiRequestJson<Reservation[]>('/getAllReservations');
            setReservations(data);
        } catch (error) {
            if (error instanceof ApiError) {
                toast.error(error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReservations();
    }, []);

    const getStatusBadge = (status: string) => {
        const colors = {
            QUEUED: 'bg-yellow-100 text-yellow-700',
            ACTIVE: 'bg-green-100 text-green-700',
            FULFILLED: 'bg-blue-100 text-blue-700',
            EXPIRED: 'bg-gray-100 text-gray-700',
        };
        return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-700';
    };

    return (
        <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="flex items-center gap-2">
                    <BookmarkCheck className="w-5 h-5"/>
                    All Reservations
                </h2>
                <Button variant="outline" size="sm" onClick={fetchReservations}>
                    Refresh
                </Button>
            </div>

            {loading ? (
                <p className="text-center py-8 text-gray-500">Loading reservations...</p>
            ) : reservations.length === 0 ? (
                <p className="text-center py-8 text-gray-500">No reservations found</p>
            ) : (
                <div className="space-y-2">
                    {reservations.map((reservation) => (
                        <div
                            key={reservation.id}
                            className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <p className="font-medium">{reservation.bookTitle}</p>
                                    <p className="text-sm text-gray-600">
                                        Reserved by: {reservation.memberUserName} • ISBN: {reservation.bookIsbn}
                                    </p>
                                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
                    <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">
                      ID: {reservation.id}
                    </span>
                                        <span>
                      Reserved: {new Date(reservation.reservationDate).toLocaleDateString()}
                    </span>
                                        {reservation.expiryDate && (
                                            <span>
                        Expires: {new Date(reservation.expiryDate).toLocaleDateString()}
                      </span>
                                        )}
                                        {reservation.status === 'ACTIVE' && reservation.daysUntilExpiry > 0 && (
                                            <span className="text-orange-600 font-medium">
                        {reservation.daysUntilExpiry} day{reservation.daysUntilExpiry !== 1 ? 's' : ''} left to pickup
                      </span>
                                        )}
                                    </div>
                                </div>
                                <span className={`px-2 py-1 rounded text-xs ${getStatusBadge(reservation.status)}`}>
                  {reservation.status}
                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
}
