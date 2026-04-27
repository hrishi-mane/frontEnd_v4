import {useEffect, useState} from 'react';
import {Transaction} from '../../types/lms';
import {ApiError, apiRequestJson} from '../../utils/api';
import {Button} from './ui/button';
import {Card} from './ui/card';
import {History} from 'lucide-react';
import {toast} from 'sonner';

export function TransactionsList() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const data = await apiRequestJson<Transaction[]>('/getAllTransactions');
            setTransactions(data);
        } catch (error) {
            if (error instanceof ApiError) {
                toast.error(error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    const getStatusBadge = (status: string) => {
        const colors = {
            ACTIVE: 'bg-blue-100 text-blue-700',
            RETURNED: 'bg-green-100 text-green-700',
            FINE_PENDING: 'bg-red-100 text-red-700',
        };
        return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-700';
    };

    return (
        <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="flex items-center gap-2">
                    <History className="w-5 h-5"/>
                    Transaction History
                </h2>
                <Button variant="outline" size="sm" onClick={fetchTransactions}>
                    Refresh
                </Button>
            </div>

            {loading ? (
                <p className="text-center py-8 text-gray-500">Loading transactions...</p>
            ) : transactions.length === 0 ? (
                <p className="text-center py-8 text-gray-500">No transactions found</p>
            ) : (
                <div className="space-y-2">
                    {transactions.map((transaction) => (
                        <div
                            key={transaction.id}
                            className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <p className="font-medium">{transaction.bookTitle}</p>
                                    <p className="text-sm text-gray-600">
                                        by {transaction.memberUserName} • ISBN: {transaction.bookIsbn}
                                    </p>
                                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
                    <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">
                      ID: {transaction.id}
                    </span>
                                        <span>
                      Borrowed: {new Date(transaction.borrowDate).toLocaleDateString()}
                    </span>
                                        <span>
                      Due: {new Date(transaction.dueDate).toLocaleDateString()}
                    </span>
                                        {transaction.returnedDate && (
                                            <span>
                        Returned: {new Date(transaction.returnedDate).toLocaleDateString()}
                      </span>
                                        )}
                                        {transaction.overdue && (
                                            <span className="text-red-600 font-medium">
                        Overdue by {transaction.daysOverdue} day{transaction.daysOverdue !== 1 ? 's' : ''}
                      </span>
                                        )}
                                    </div>
                                </div>
                                <span
                                    className={`px-2 py-1 rounded text-xs ${getStatusBadge(transaction.transactionStatus)}`}>
                  {transaction.transactionStatus}
                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
}
