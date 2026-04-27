import {useEffect, useState} from 'react';
import {Member, PlanType} from '../../types/lms';
import {ApiError, apiRequest, apiRequestJson, parseId} from '../../utils/api';
import {Button} from './ui/button';
import {Input} from './ui/input';
import {Label} from './ui/label';
import {Card} from './ui/card';
import {RadioGroup, RadioGroupItem} from './ui/radio-group';
import {Checkbox} from './ui/checkbox';
import {UserPlus, Users} from 'lucide-react';
import {toast} from 'sonner';

export function Members() {
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        userName: '',
        emailId: '',
        phoneNumber: '',
        planType: 'STANDARD' as PlanType,
        memberShipMonths: '12',
        addExtendedBorrowing: false,
    });

    const fetchMembers = async () => {
        setLoading(true);
        try {
            const data = await apiRequestJson<Member[]>('/getAllMembers');
            setMembers(data);
        } catch (error) {
            if (error instanceof ApiError) {
                toast.error(error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, []);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await apiRequest('/registerMember', {
                method: 'POST',
                body: JSON.stringify({
                    userName: formData.userName,
                    password: 'library_member_' + Date.now(), // Auto-generated password (not used for login)
                    emailId: formData.emailId,
                    phoneNumber: formData.phoneNumber,
                    planType: formData.planType,
                    memberShipMonths: parseInt(formData.memberShipMonths),
                    addOns: formData.addExtendedBorrowing ? 'EXTENDED_BORROWING' : undefined,
                }),
            });

            const memberId = parseId(response, 'Id :');
            toast.success(`Library member added successfully (ID: ${memberId})`);
            setFormData({
                userName: '',
                emailId: '',
                phoneNumber: '',
                planType: 'STANDARD',
                memberShipMonths: '12',
                addExtendedBorrowing: false,
            });
            fetchMembers();
        } catch (error) {
            if (error instanceof ApiError) {
                toast.error(error.message);
            }
        }
    };

    return (
        <div className="space-y-6">
            <Card className="p-6">
                <div className="mb-4">
                    <h2 className="flex items-center gap-2">
                        <UserPlus className="w-5 h-5"/>
                        Add New Library Member
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Register a new patron in the library system</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="userName">Full Name *</Label>
                            <Input
                                id="userName"
                                value={formData.userName}
                                onChange={(e) => setFormData({...formData, userName: e.target.value})}
                                placeholder="John Doe"
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="phoneNumber">Phone Number *</Label>
                            <Input
                                id="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                                placeholder="0851234567"
                                required
                            />
                        </div>
                        <div className="col-span-2">
                            <Label htmlFor="emailId">Email Address *</Label>
                            <Input
                                id="emailId"
                                type="email"
                                value={formData.emailId}
                                onChange={(e) => setFormData({...formData, emailId: e.target.value})}
                                placeholder="john.doe@example.com"
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">Used for sending notifications about borrowed
                                books and reservations</p>
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <Label className="text-base">Membership Plan *</Label>
                        <p className="text-xs text-gray-500 mb-3">Choose the subscription tier for this member</p>
                        <RadioGroup
                            value={formData.planType}
                            onValueChange={(value) => setFormData({...formData, planType: value as PlanType})}
                            className="space-y-3"
                        >
                            <div
                                className="flex items-start space-x-3 border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                                <RadioGroupItem value="STANDARD" id="standard" className="mt-1"/>
                                <div className="flex-1">
                                    <Label htmlFor="standard" className="font-medium cursor-pointer">
                                        Standard Plan - $5/month
                                    </Label>
                                    <p className="text-xs text-gray-600 mt-1">
                                        10 books for 30 days • Max 2 reservations • $0.25/day fine
                                    </p>
                                </div>
                            </div>
                            <div
                                className="flex items-start space-x-3 border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                                <RadioGroupItem value="PREMIUM" id="premium" className="mt-1"/>
                                <div className="flex-1">
                                    <Label htmlFor="premium" className="font-medium cursor-pointer">
                                        Premium Plan - $7/month
                                    </Label>
                                    <p className="text-xs text-gray-600 mt-1">
                                        10 books for 30 days • Max 5 reservations • $0.25/day fine
                                    </p>
                                </div>
                            </div>
                        </RadioGroup>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="months">Membership Duration *</Label>
                            <select
                                id="months"
                                value={formData.memberShipMonths}
                                onChange={(e) => setFormData({...formData, memberShipMonths: e.target.value})}
                                className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="1">1 Month</option>
                                <option value="3">3 Months</option>
                                <option value="6">6 Months</option>
                                <option value="12">12 Months (1 Year)</option>
                                <option value="24">24 Months (2 Years)</option>
                            </select>
                        </div>
                    </div>

                    <div className="border rounded-lg p-3 bg-blue-50">
                        <div className="flex items-start space-x-2">
                            <Checkbox
                                id="extendedBorrowing"
                                checked={formData.addExtendedBorrowing}
                                onCheckedChange={(checked) =>
                                    setFormData({...formData, addExtendedBorrowing: checked as boolean})
                                }
                                className="mt-1"
                            />
                            <div className="flex-1">
                                <Label htmlFor="extendedBorrowing" className="font-medium cursor-pointer">
                                    Extended Borrowing Add-on (+$3/month)
                                </Label>
                                <p className="text-xs text-gray-600 mt-1">
                                    Adds +2 books to borrowing limit and +7 days to borrow duration
                                </p>
                            </div>
                        </div>
                    </div>

                    <Button type="submit" className="w-full">
                        <UserPlus className="w-4 h-4 mr-2"/>
                        Add Library Member
                    </Button>
                </form>
            </Card>

            <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="flex items-center gap-2">
                            <Users className="w-5 h-5"/>
                            Library Members
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {members.length} registered patron{members.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={fetchMembers}>
                        Refresh
                    </Button>
                </div>

                {loading ? (
                    <p className="text-center py-8 text-gray-500">Loading library members...</p>
                ) : members.length === 0 ? (
                    <div className="text-center py-8">
                        <Users className="w-12 h-12 mx-auto text-gray-300 mb-2"/>
                        <p className="text-gray-500">No library members yet</p>
                        <p className="text-sm text-gray-400 mt-1">Add your first member using the form above</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {members.map((member) => (
                            <div
                                key={member.id}
                                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex-1">
                                    <p className="font-medium">{member.userName}</p>
                                    <p className="text-sm text-gray-600">
                                        {member.emailId} • {member.phoneNumber}
                                    </p>
                                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                        <span
                                            className="font-mono bg-gray-100 px-2 py-0.5 rounded">ID: {member.id}</span>
                                        <span>{member.planName}</span>
                                        <span>Expires: {new Date(member.membershipEndDate).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-gray-600 mt-1">
                                        <span>Active Borrows: {member.activeBorrowCount}</span>
                                        <span>Active Reservations: {member.activeReservationCount}</span>
                                        <span>Queued Reservations: {member.queuedReservationCount}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
}
