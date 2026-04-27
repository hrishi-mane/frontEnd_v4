import {useState} from 'react';
import {Tabs, TabsContent, TabsList, TabsTrigger} from './components/ui/tabs';
import {Books} from './components/Books';
import {Members} from './components/Members';
import {Transactions} from './components/Transactions';
import {Reservations} from './components/Reservations';
import {Toaster} from './components/ui/sonner';
import {Library} from 'lucide-react';

export default function App() {
    const [activeTab, setActiveTab] = useState('books');

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto p-6">
                <header className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <Library className="w-8 h-8"/>
                                <h1 className="text-3xl">Library Management System</h1>
                            </div>
                            <p className="text-gray-600">Admin Dashboard - Manage books, members, and transactions</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-medium">Librarian Portal</p>
                            <p className="text-xs text-gray-500">Admin Access</p>
                        </div>
                    </div>
                </header>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-4 mb-6">
                        <TabsTrigger value="books">Books</TabsTrigger>
                        <TabsTrigger value="members">Members</TabsTrigger>
                        <TabsTrigger value="transactions">Transactions</TabsTrigger>
                        <TabsTrigger value="reservations">Reservations</TabsTrigger>
                    </TabsList>

                    <TabsContent value="books">
                        <Books/>
                    </TabsContent>

                    <TabsContent value="members">
                        <Members/>
                    </TabsContent>

                    <TabsContent value="transactions">
                        <Transactions/>
                    </TabsContent>

                    <TabsContent value="reservations">
                        <Reservations/>
                    </TabsContent>
                </Tabs>
            </div>

            <Toaster/>
        </div>
    );
}