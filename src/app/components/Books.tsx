import {useEffect, useState} from 'react';
import {Book} from '../../types/lms';
import {ApiError, apiRequest, apiRequestJson, parseId} from '../../utils/api';
import {Button} from './ui/button';
import {Input} from './ui/input';
import {Label} from './ui/label';
import {Card} from './ui/card';
import {BookOpen, Plus, Trash2} from 'lucide-react';
import {toast} from 'sonner';

export function Books() {
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        author: '',
        isbn: '',
        category: '',
        publicationYear: '',
        copiesAvailable: '1',
    });

    const fetchBooks = async () => {
        setLoading(true);
        try {
            const data = await apiRequestJson<Book[]>('/getAllBooks');
            setBooks(data);
        } catch (error) {
            if (error instanceof ApiError) {
                toast.error(error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBooks();
    }, []);

    const handleAddBook = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await apiRequest('/addBook', {
                method: 'POST',
                body: JSON.stringify({
                    title: formData.title,
                    author: formData.author,
                    isbn: formData.isbn,
                    category: formData.category,
                    publicationYear: parseInt(formData.publicationYear),
                    copiesAvailable: parseInt(formData.copiesAvailable),
                }),
            });

            const bookId = parseId(response, 'Id');
            toast.success(`Book added successfully (ID: ${bookId})`);
            setFormData({
                title: '',
                author: '',
                isbn: '',
                category: '',
                publicationYear: '',
                copiesAvailable: '1',
            });
            fetchBooks();
        } catch (error) {
            if (error instanceof ApiError) {
                toast.error(error.message);
            }
        }
    };

    const handleRemoveBook = async (bookId: number) => {
        try {
            await apiRequest(`/removeBook/${bookId}`, {method: 'POST'});
            toast.success('Book removed successfully');
            fetchBooks();
        } catch (error) {
            if (error instanceof ApiError) {
                toast.error(error.message);
            }
        }
    };

    return (
        <div className="space-y-6">
            <Card className="p-6">
                <h2 className="flex items-center gap-2 mb-4">
                    <Plus className="w-5 h-5"/>
                    Add New Book
                </h2>
                <form onSubmit={handleAddBook} className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="title">Title *</Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="author">Author *</Label>
                        <Input
                            id="author"
                            value={formData.author}
                            onChange={(e) => setFormData({...formData, author: e.target.value})}
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="isbn">ISBN *</Label>
                        <Input
                            id="isbn"
                            value={formData.isbn}
                            onChange={(e) => setFormData({...formData, isbn: e.target.value})}
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="category">Category *</Label>
                        <Input
                            id="category"
                            value={formData.category}
                            onChange={(e) => setFormData({...formData, category: e.target.value})}
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="year">Publication Year *</Label>
                        <Input
                            id="year"
                            type="number"
                            value={formData.publicationYear}
                            onChange={(e) => setFormData({...formData, publicationYear: e.target.value})}
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="copies">Copies Available *</Label>
                        <Input
                            id="copies"
                            type="number"
                            min="1"
                            value={formData.copiesAvailable}
                            onChange={(e) => setFormData({...formData, copiesAvailable: e.target.value})}
                            required
                        />
                    </div>
                    <div className="col-span-2">
                        <Button type="submit" className="w-full">
                            <Plus className="w-4 h-4 mr-2"/>
                            Add Book
                        </Button>
                    </div>
                </form>
            </Card>

            <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5"/>
                        Book Inventory
                    </h2>
                    <Button variant="outline" size="sm" onClick={fetchBooks}>
                        Refresh
                    </Button>
                </div>

                {loading ? (
                    <p className="text-center py-8 text-gray-500">Loading books...</p>
                ) : books.length === 0 ? (
                    <p className="text-center py-8 text-gray-500">No books in inventory</p>
                ) : (
                    <div className="space-y-2">
                        {books.map((book) => (
                            <div
                                key={book.id}
                                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex-1">
                                    <p className="font-medium">{book.title}</p>
                                    <p className="text-sm text-gray-600">
                                        by {book.author} • ISBN: {book.isbn}
                                    </p>
                                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                        <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">ID: {book.id}</span>
                                        <span>{book.category}</span>
                                        <span>{book.publicationYear}</span>
                                        <span>Copies: {book.copiesAvailable}</span>
                                        <span className={`px-2 py-0.5 rounded ${
                                            book.available
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-100 text-gray-700'
                                        }`}>
                      {book.available ? 'Available' : 'Unavailable'}
                    </span>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveBook(book.id)}
                                >
                                    <Trash2 className="w-4 h-4"/>
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
}
