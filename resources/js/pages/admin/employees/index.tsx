import AppLayout from '@/layouts/app-layout';
import { formatCurrency, formatDate, showConfirm, showToast } from '@/lib/swal';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, DollarSign, Download, Edit, Plus, Printer, Search, Trash2, Users } from 'lucide-react';
import { useMemo, useState } from 'react';

interface Employee {
    id: number;
    name: string;
    role_title: string;
    phone?: string;
    email?: string;
    joining_date?: string;
    base_salary: number;
    status: 'active' | 'inactive';
}

interface Salary {
    id: number;
    employee_id: number;
    employee?: Employee;
    month_year: string;
    base_salary: number;
    bonus: number;
    deduction: number;
    net_pay: number;
    payment_status: 'paid' | 'unpaid';
    payment_date?: string;
    updated_at?: string;
    created_at?: string;
}

interface Props {
    employees: Employee[];
    allSalaries: Salary[];
    currency: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/administration-control/dashboard' },
    { title: 'HR & Employee Roster', href: '/administration-control/employees' },
];

export default function EmployeesIndex({ employees, allSalaries, currency }: Props) {
    const [showStaffModal, setShowStaffModal] = useState(false);
    const [showSalaryModal, setShowSalaryModal] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const [editingSalary, setEditingSalary] = useState<Salary | null>(null);
    const [viewingPayslip, setViewingPayslip] = useState<Salary | null>(null);

    // Roster Pagination & Search State
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);

    const filteredEmployees = useMemo(() => {
        if (!searchTerm.trim()) return employees;
        const term = searchTerm.toLowerCase();
        return employees.filter(
            (emp) =>
                emp.name.toLowerCase().includes(term) ||
                emp.role_title.toLowerCase().includes(term) ||
                (emp.phone && emp.phone.toLowerCase().includes(term))
        );
    }, [employees, searchTerm]);

    const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / perPage));

    const paginatedEmployees = useMemo(() => {
        const start = (currentPage - 1) * perPage;
        return filteredEmployees.slice(start, start + perPage);
    }, [filteredEmployees, currentPage, perPage]);

    // Salary Log Pagination & Search/Date Range/Scope State
    type PayrollScope = 'monthly' | 'yearly' | 'all' | 'custom';
    const [payrollScope, setPayrollScope] = useState<PayrollScope>('monthly');
    const [selectedMonth, setSelectedMonth] = useState<string>(() => new Date().toISOString().slice(0, 7));
    const [selectedYear, setSelectedYear] = useState<string>(() => new Date().getFullYear().toString());
    const [salarySearchTerm, setSalarySearchTerm] = useState('');
    const [salaryStartDate, setSalaryStartDate] = useState('');
    const [salaryEndDate, setSalaryEndDate] = useState('');
    const [salaryCurrentPage, setSalaryCurrentPage] = useState(1);
    const [salaryPerPage, setSalaryPerPage] = useState(10);

    const availableYears = useMemo(() => {
        const currentYr = new Date().getFullYear();
        const years = new Set<string>([currentYr.toString()]);
        allSalaries.forEach((sal) => {
            if (sal.month_year) {
                years.add(sal.month_year.slice(0, 4));
            } else if (sal.payment_date) {
                years.add(sal.payment_date.slice(0, 4));
            }
        });
        return Array.from(years).sort((a, b) => Number(b) - Number(a));
    }, [allSalaries]);

    const filteredSalaries = useMemo(() => {
        return allSalaries.filter((sal) => {
            if (salarySearchTerm.trim()) {
                const term = salarySearchTerm.toLowerCase();
                const empName = sal.employee?.name.toLowerCase() || '';
                const month = sal.month_year.toLowerCase();
                if (!empName.includes(term) && !month.includes(term)) {
                    return false;
                }
            }

            if (payrollScope === 'monthly') {
                const salMonth = sal.month_year || (sal.payment_date ? sal.payment_date.slice(0, 7) : '');
                if (salMonth !== selectedMonth) return false;
            } else if (payrollScope === 'yearly') {
                const salYear = sal.month_year ? sal.month_year.slice(0, 4) : (sal.payment_date ? sal.payment_date.slice(0, 4) : '');
                if (salYear !== selectedYear) return false;
            } else if (payrollScope === 'custom') {
                const targetDateStr = sal.payment_date || sal.updated_at || sal.created_at;
                if (salaryStartDate) {
                    if (targetDateStr) {
                        const salDate = new Date(targetDateStr).setHours(0, 0, 0, 0);
                        const startDate = new Date(salaryStartDate).setHours(0, 0, 0, 0);
                        if (salDate < startDate) return false;
                    } else if (sal.month_year < salaryStartDate.slice(0, 7)) {
                        return false;
                    }
                }

                if (salaryEndDate) {
                    if (targetDateStr) {
                        const salDate = new Date(targetDateStr).setHours(23, 59, 59, 999);
                        const endDate = new Date(salaryEndDate).setHours(23, 59, 59, 999);
                        if (salDate > endDate) return false;
                    } else if (sal.month_year > salaryEndDate.slice(0, 7)) {
                        return false;
                    }
                }
            }

            return true;
        });
    }, [allSalaries, payrollScope, selectedMonth, selectedYear, salarySearchTerm, salaryStartDate, salaryEndDate]);

    const salaryTotals = useMemo(() => {
        return filteredSalaries.reduce(
            (acc, sal) => {
                acc.base += sal.base_salary || 0;
                acc.bonus += sal.bonus || 0;
                acc.deduction += sal.deduction || 0;
                acc.netPay += sal.net_pay || 0;
                return acc;
            },
            { base: 0, bonus: 0, deduction: 0, netPay: 0 }
        );
    }, [filteredSalaries]);

    const totalSalaryPages = Math.max(1, Math.ceil(filteredSalaries.length / salaryPerPage));

    const paginatedSalaries = useMemo(() => {
        const start = (salaryCurrentPage - 1) * salaryPerPage;
        return filteredSalaries.slice(start, start + salaryPerPage);
    }, [filteredSalaries, salaryCurrentPage, salaryPerPage]);

    // Staff Form
    const staffForm = useForm({
        name: '',
        role_title: 'Chef',
        phone: '',
        email: '',
        joining_date: new Date().toISOString().split('T')[0],
        base_salary: 25000,
        status: 'active',
    });

    // Salary Form
    const salaryForm = useForm({
        employee_id: employees[0]?.id || '',
        month_year: new Date().toISOString().slice(0, 7),
        base_salary: employees[0]?.base_salary || 25000,
        bonus: 0,
        deduction: 0,
        payment_status: 'paid',
        payment_date: new Date().toISOString().split('T')[0],
        notes: '',
    });

    const openSalaryModal = (emp?: Employee) => {
        setEditingSalary(null);
        const selected = emp || employees[0];
        salaryForm.setData({
            employee_id: selected?.id || '',
            month_year: new Date().toISOString().slice(0, 7),
            base_salary: selected?.base_salary || 25000,
            bonus: 0,
            deduction: 0,
            payment_status: 'paid',
            payment_date: new Date().toISOString().split('T')[0],
            notes: '',
        });
        salaryForm.clearErrors();
        setShowSalaryModal(true);
    };

    const openEditSalaryModal = (sal: Salary) => {
        setEditingSalary(sal);
        salaryForm.setData({
            employee_id: sal.employee_id,
            month_year: sal.month_year,
            base_salary: sal.base_salary,
            bonus: sal.bonus,
            deduction: sal.deduction,
            payment_status: sal.payment_status || 'paid',
            payment_date: sal.payment_date ? sal.payment_date.split('T')[0] : new Date().toISOString().split('T')[0],
            notes: '',
        });
        salaryForm.clearErrors();
        setShowSalaryModal(true);
    };

    const openCreateStaff = () => {
        setEditingEmployee(null);
        staffForm.reset();
        setShowStaffModal(true);
    };

    const openEditStaff = (emp: Employee) => {
        setEditingEmployee(emp);
        staffForm.setData({
            name: emp.name,
            role_title: emp.role_title,
            phone: emp.phone || '',
            email: emp.email || '',
            joining_date: emp.joining_date || '',
            base_salary: emp.base_salary,
            status: emp.status,
        });
        setShowStaffModal(true);
    };

    const submitStaffForm = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingEmployee) {
            staffForm.put(`/administration-control/employees/${editingEmployee.id}`, {
                onSuccess: () => {
                    setShowStaffModal(false);
                    showToast(`Staff member "${staffForm.data.name}" updated!`, 'success');
                },
            });
        } else {
            staffForm.post('/administration-control/employees', {
                onSuccess: () => {
                    setShowStaffModal(false);
                    showToast(`New staff member "${staffForm.data.name}" added!`, 'success');
                },
            });
        }
    };

    const handleDeleteStaff = async (emp: Employee) => {
        const confirmed = await showConfirm(`Delete staff member "${emp.name}"?`, 'Action cannot be undone.');
        if (confirmed) {
            router.delete(`/administration-control/employees/${emp.id}`, {
                onSuccess: () => showToast(`Staff member "${emp.name}" removed`, 'success'),
            });
        }
    };

    const submitSalaryForm = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingSalary) {
            salaryForm.put(`/administration-control/employees/salary/${editingSalary.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setShowSalaryModal(false);
                    setEditingSalary(null);
                    showToast('Monthly salary voucher updated!', 'success');
                },
            });
        } else {
            salaryForm.post('/administration-control/employees/generate-salary', {
                preserveScroll: true,
                onSuccess: () => {
                    setShowSalaryModal(false);
                    showToast('Monthly salary voucher generated!', 'success');
                },
            });
        }
    };

    const handleDeleteSalary = async (sal: Salary) => {
        const empName = sal.employee?.name || 'Staff';
        const confirmed = await showConfirm(
            `Delete salary voucher for "${empName}" (${sal.month_year})?`,
            'Action cannot be undone.'
        );
        if (confirmed) {
            router.delete(`/administration-control/employees/salary/${sal.id}`, {
                onSuccess: () => showToast(`Salary voucher for ${empName} deleted`, 'success'),
            });
        }
    };

    const printPayslip = () => window.print();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="HR & Monthly Salary Management" />

            <div className="flex min-h-screen w-full max-w-full min-w-0 flex-col gap-6 bg-slate-50 p-3 sm:p-4 md:p-6 text-slate-900 transition-colors overflow-x-hidden dark:bg-slate-950 dark:text-slate-100">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                            <Users className="h-6 w-6 text-amber-500" /> HR Roster & Monthly Salary Matrix
                        </h1>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Manage restaurant staff roster, generate monthly payslips, and log payroll disbursements
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => {
                                window.location.href = '/administration-control/employees/export-excel';
                            }}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-slate-200 px-4 py-2 text-xs font-bold text-slate-800 transition-all hover:bg-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                        >
                            <Download className="h-4 w-4" /> Export Excel (.xlsx)
                        </button>
                        <button
                            onClick={() => openSalaryModal()}
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-900/20 transition-all hover:bg-emerald-500"
                        >
                            <DollarSign className="h-4 w-4" /> Generate Monthly Salary
                        </button>
                        <button
                            onClick={openCreateStaff}
                            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-400"
                        >
                            <Plus className="h-4 w-4" /> Add Staff Member
                        </button>
                    </div>
                </div>

                {/* Staff Roster Table */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Active Restaurant Staff Roster</h3>
                            <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                                {filteredEmployees.length} {filteredEmployees.length === 1 ? 'Staff' : 'Staff Members'}
                            </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <div className="relative min-w-[200px]">
                                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search staff name, role, phone..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full rounded-xl border border-slate-300 bg-slate-50 pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                />
                            </div>

                            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                                <span>Show</span>
                                <select
                                    value={perPage}
                                    onChange={(e) => {
                                        setPerPage(Number(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                    className="rounded-lg border border-slate-300 bg-slate-50 px-2 py-1 text-xs text-slate-900 focus:border-amber-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                </select>
                                <span>entries</span>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[700px] text-left text-xs text-slate-700 dark:text-slate-300">
                            <thead className="bg-slate-100 text-[10px] font-semibold text-slate-500 uppercase dark:bg-slate-950 dark:text-slate-400">
                                <tr>
                                    <th className="p-3.5">Staff Name</th>
                                    <th className="p-3.5">Role Title</th>
                                    <th className="p-3.5">Contact Phone</th>
                                    <th className="p-3.5">Joining Date</th>
                                    <th className="p-3.5 text-right">Base Salary</th>
                                    <th className="p-3.5 text-center">Status</th>
                                    <th className="p-3.5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {paginatedEmployees.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-8 text-center text-slate-500">
                                            {searchTerm ? 'No staff members match your search criteria.' : 'No employee staff records created yet.'}
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedEmployees.map((emp) => (
                                        <tr key={emp.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                            <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100">{emp.name}</td>
                                            <td className="p-3.5">{emp.role_title}</td>
                                            <td className="p-3.5 text-slate-500 dark:text-slate-400">{emp.phone || '-'}</td>
                                            <td className="p-3.5 text-slate-500 dark:text-slate-400">{emp.joining_date ? formatDate(emp.joining_date) : '-'}</td>
                                            <td className="p-3.5 text-right font-extrabold text-slate-900 dark:text-slate-100">
                                                {formatCurrency(emp.base_salary, currency)}
                                            </td>
                                            <td className="p-3.5 text-center">
                                                <span
                                                    className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                                                        emp.status === 'active'
                                                            ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                                                            : 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
                                                    }`}
                                                >
                                                    {emp.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="p-3.5 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => openSalaryModal(emp)}
                                                        title="Distribute / Pay Salary"
                                                        className="rounded-lg bg-emerald-500/10 p-1.5 text-emerald-600 hover:bg-emerald-500 hover:text-white dark:text-emerald-400"
                                                    >
                                                        <DollarSign className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => openEditStaff(emp)}
                                                        className="rounded-lg bg-slate-100 p-1.5 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                                                    >
                                                        <Edit className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteStaff(emp)}
                                                        className="rounded-lg bg-rose-500/10 p-1.5 text-rose-500 hover:bg-rose-500 hover:text-white"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 p-4 text-xs sm:flex-row dark:border-slate-800">
                        <p className="text-slate-500 dark:text-slate-400">
                            Showing <span className="font-semibold text-slate-900 dark:text-slate-100">{filteredEmployees.length === 0 ? 0 : (currentPage - 1) * perPage + 1}</span> to{' '}
                            <span className="font-semibold text-slate-900 dark:text-slate-100">{Math.min(currentPage * perPage, filteredEmployees.length)}</span> of{' '}
                            <span className="font-semibold text-slate-900 dark:text-slate-100">{filteredEmployees.length}</span> entries
                        </p>

                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-transparent dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
                            >
                                <ChevronLeft className="h-3.5 w-3.5" /> Previous
                            </button>

                            <div className="flex items-center gap-1 px-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`h-7 w-7 rounded-lg text-xs font-semibold transition-colors ${
                                            currentPage === page
                                                ? 'bg-amber-500 text-slate-950 shadow-sm'
                                                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages || totalPages === 0}
                                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-transparent dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
                            >
                                Next <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Salary Log Table */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex flex-col gap-4 border-b border-slate-200 p-4 xl:flex-row xl:items-center xl:justify-between dark:border-slate-800">
                        <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Monthly Payroll Disbursement Log</h3>
                                <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                                    {filteredSalaries.length} {filteredSalaries.length === 1 ? 'Voucher' : 'Vouchers'}
                                </span>
                            </div>

                            {/* Scope Selector Pills */}
                            <div className="flex flex-wrap items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-950">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setPayrollScope('monthly');
                                        setSalaryCurrentPage(1);
                                    }}
                                    className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                                        payrollScope === 'monthly'
                                            ? 'bg-amber-500 text-slate-950 shadow-sm'
                                            : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                                    }`}
                                >
                                    Monthly
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setPayrollScope('yearly');
                                        setSalaryCurrentPage(1);
                                    }}
                                    className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                                        payrollScope === 'yearly'
                                            ? 'bg-amber-500 text-slate-950 shadow-sm'
                                            : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                                    }`}
                                >
                                    Yearly
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setPayrollScope('all');
                                        setSalaryCurrentPage(1);
                                    }}
                                    className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                                        payrollScope === 'all'
                                            ? 'bg-amber-500 text-slate-950 shadow-sm'
                                            : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                                    }`}
                                >
                                    All Time
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setPayrollScope('custom');
                                        setSalaryCurrentPage(1);
                                    }}
                                    className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                                        payrollScope === 'custom'
                                            ? 'bg-amber-500 text-slate-950 shadow-sm'
                                            : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                                    }`}
                                >
                                    Custom Range
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5">
                            {/* Dynamic Scope Selector Inputs */}
                            {payrollScope === 'monthly' && (
                                <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                                    <span className="font-semibold">Month:</span>
                                    <input
                                        type="month"
                                        value={selectedMonth}
                                        onChange={(e) => {
                                            setSelectedMonth(e.target.value);
                                            setSalaryCurrentPage(1);
                                        }}
                                        className="rounded-xl border border-slate-300 bg-slate-50 px-2.5 py-1 text-xs font-mono font-bold text-amber-600 focus:border-amber-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-amber-400"
                                    />
                                </div>
                            )}

                            {payrollScope === 'yearly' && (
                                <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                                    <span className="font-semibold">Year:</span>
                                    <select
                                        value={selectedYear}
                                        onChange={(e) => {
                                            setSelectedYear(e.target.value);
                                            setSalaryCurrentPage(1);
                                        }}
                                        className="rounded-xl border border-slate-300 bg-slate-50 px-2.5 py-1 text-xs font-mono font-bold text-amber-600 focus:border-amber-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-amber-400"
                                    >
                                        {availableYears.map((yr) => (
                                            <option key={yr} value={yr}>
                                                {yr}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {payrollScope === 'custom' && (
                                <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                                    <span className="font-medium">From:</span>
                                    <input
                                        type="date"
                                        value={salaryStartDate}
                                        onChange={(e) => {
                                            setSalaryStartDate(e.target.value);
                                            setSalaryCurrentPage(1);
                                        }}
                                        className="rounded-xl border border-slate-300 bg-slate-50 px-2.5 py-1 text-xs font-mono text-slate-900 focus:border-amber-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                    />
                                    <span className="font-medium">To:</span>
                                    <input
                                        type="date"
                                        value={salaryEndDate}
                                        onChange={(e) => {
                                            setSalaryEndDate(e.target.value);
                                            setSalaryCurrentPage(1);
                                        }}
                                        className="rounded-xl border border-slate-300 bg-slate-50 px-2.5 py-1 text-xs font-mono text-slate-900 focus:border-amber-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                    />
                                </div>
                            )}

                            {/* Search Input */}
                            <div className="relative min-w-[170px]">
                                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search employee or month..."
                                    value={salarySearchTerm}
                                    onChange={(e) => {
                                        setSalarySearchTerm(e.target.value);
                                        setSalaryCurrentPage(1);
                                    }}
                                    className="w-full rounded-xl border border-slate-300 bg-slate-50 pl-8 pr-3 py-1 text-xs text-slate-900 focus:border-amber-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                />
                            </div>

                            {(payrollScope !== 'monthly' || salarySearchTerm || selectedMonth !== new Date().toISOString().slice(0, 7) || salaryStartDate || salaryEndDate) && (
                                <button
                                    onClick={() => {
                                        setPayrollScope('monthly');
                                        setSelectedMonth(new Date().toISOString().slice(0, 7));
                                        setSelectedYear(new Date().getFullYear().toString());
                                        setSalaryStartDate('');
                                        setSalaryEndDate('');
                                        setSalarySearchTerm('');
                                        setSalaryCurrentPage(1);
                                    }}
                                    className="rounded-xl bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                                >
                                    Reset Filters
                                </button>
                            )}

                            {/* Per Page Selector */}
                            <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                                <span>Show</span>
                                <select
                                    value={salaryPerPage}
                                    onChange={(e) => {
                                        setSalaryPerPage(Number(e.target.value));
                                        setSalaryCurrentPage(1);
                                    }}
                                    className="rounded-lg border border-slate-300 bg-slate-50 px-2 py-1 text-xs text-slate-900 focus:border-amber-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                </select>
                                <span>entries</span>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[750px] text-left text-xs text-slate-700 dark:text-slate-300">
                            <thead className="bg-slate-100 text-[10px] font-semibold text-slate-500 uppercase dark:bg-slate-950 dark:text-slate-400">
                                <tr>
                                    <th className="p-3.5">Month</th>
                                    <th className="p-3.5">Employee</th>
                                    <th className="p-3.5 text-right">Base Salary</th>
                                    <th className="p-3.5 text-right">Bonus</th>
                                    <th className="p-3.5 text-right">Deduction</th>
                                    <th className="p-3.5 text-right">Net Pay</th>
                                    <th className="p-3.5 text-center">Last Updated</th>
                                    <th className="p-3.5 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {paginatedSalaries.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="py-8 text-center text-slate-500">
                                            {salarySearchTerm || salaryStartDate || salaryEndDate || payrollScope === 'monthly' || payrollScope === 'yearly'
                                                ? 'No salary vouchers found for the selected scope or filter criteria.'
                                                : 'No salary vouchers generated yet.'}
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedSalaries.map((sal) => (
                                        <tr key={sal.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                            <td className="p-3.5 font-mono font-bold text-amber-600 dark:text-amber-400">{sal.month_year}</td>
                                            <td className="p-3.5 font-semibold text-slate-900 dark:text-slate-100">
                                                {sal.employee?.name || 'Staff'}
                                            </td>
                                            <td className="p-3.5 text-right">{formatCurrency(sal.base_salary, currency)}</td>
                                            <td className="p-3.5 text-right text-emerald-600 dark:text-emerald-400">
                                                +{formatCurrency(sal.bonus, currency)}
                                            </td>
                                            <td className="p-3.5 text-right text-rose-500">-{formatCurrency(sal.deduction, currency)}</td>
                                            <td className="p-3.5 text-right font-extrabold text-slate-900 dark:text-slate-100">
                                                {formatCurrency(sal.net_pay, currency)}
                                            </td>
                                            <td className="p-3.5 text-center font-mono text-[11px] text-slate-500 dark:text-slate-400">
                                                {sal.updated_at ? formatDate(sal.updated_at) : sal.payment_date ? formatDate(sal.payment_date) : '-'}
                                            </td>
                                            <td className="p-3.5 text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button
                                                        onClick={() => setViewingPayslip(sal)}
                                                        className="rounded-xl bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-amber-600 dark:bg-slate-800 dark:text-amber-400"
                                                    >
                                                        Payslip Voucher
                                                    </button>
                                                    <button
                                                        onClick={() => openEditSalaryModal(sal)}
                                                        title="Edit Salary Voucher"
                                                        className="rounded-lg bg-slate-100 p-1.5 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                                                    >
                                                        <Edit className="h-3.5 w-3.5" />
                                                     </button>
                                                    <button
                                                        onClick={() => handleDeleteSalary(sal)}
                                                        title="Delete Salary Voucher"
                                                        className="rounded-lg bg-rose-500/10 p-1.5 text-rose-500 hover:bg-rose-500 hover:text-white"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>

                            {/* Column Totals Footer */}
                            {filteredSalaries.length > 0 && (
                                <tfoot className="border-t-2 border-slate-200 bg-slate-100/90 font-bold dark:border-slate-800 dark:bg-slate-950/90">
                                    <tr>
                                        <td colSpan={2} className="p-3.5 text-slate-900 dark:text-slate-100">
                                            Total Disbursed ({filteredSalaries.length} {filteredSalaries.length === 1 ? 'Voucher' : 'Vouchers'})
                                        </td>
                                        <td className="p-3.5 text-right font-extrabold text-slate-900 dark:text-slate-100">
                                            {formatCurrency(salaryTotals.base, currency)}
                                        </td>
                                        <td className="p-3.5 text-right font-extrabold text-emerald-600 dark:text-emerald-400">
                                            +{formatCurrency(salaryTotals.bonus, currency)}
                                        </td>
                                        <td className="p-3.5 text-right font-extrabold text-rose-500">
                                            -{formatCurrency(salaryTotals.deduction, currency)}
                                        </td>
                                        <td className="p-3.5 text-right text-sm font-black text-amber-600 dark:text-amber-400">
                                            {formatCurrency(salaryTotals.netPay, currency)}
                                        </td>
                                        <td colSpan={2} className="p-3.5 text-center text-[11px] text-slate-400 uppercase tracking-wider">
                                            Scope Total
                                        </td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>

                    {/* Total Expense Summary Banner */}
                    <div className="border-t border-slate-200 bg-slate-50 p-4 text-slate-900 transition-colors dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100">
                        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 shadow-inner dark:bg-amber-500/20 dark:text-amber-400">
                                    <DollarSign className="h-6 w-6" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                            Total Payroll Expense
                                        </span>
                                        <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-700 dark:bg-amber-500/20 dark:text-amber-400">
                                            {payrollScope === 'monthly'
                                                ? `Month: ${selectedMonth}`
                                                : payrollScope === 'yearly'
                                                ? `Year: ${selectedYear}`
                                                : payrollScope === 'all'
                                                ? 'All Time'
                                                : 'Custom Date Range'}
                                        </span>
                                    </div>
                                    <p className="text-2xl font-black tracking-tight text-amber-600 dark:text-amber-400">
                                        {formatCurrency(salaryTotals.netPay, currency)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 text-xs">
                                <div className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                                    <span className="text-slate-500 dark:text-slate-400">Base Salary: </span>
                                    <span className="font-bold text-slate-900 dark:text-slate-100">{formatCurrency(salaryTotals.base, currency)}</span>
                                </div>
                                <div className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                                    <span className="text-slate-500 dark:text-slate-400">Bonuses: </span>
                                    <span className="font-bold text-emerald-600 dark:text-emerald-400">+{formatCurrency(salaryTotals.bonus, currency)}</span>
                                </div>
                                <div className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                                    <span className="text-slate-500 dark:text-slate-400">Deductions: </span>
                                    <span className="font-bold text-rose-500 dark:text-rose-400">-{formatCurrency(salaryTotals.deduction, currency)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pagination Footer */}
                    <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 p-4 text-xs sm:flex-row dark:border-slate-800">
                        <p className="text-slate-500 dark:text-slate-400">
                            Showing <span className="font-semibold text-slate-900 dark:text-slate-100">{filteredSalaries.length === 0 ? 0 : (salaryCurrentPage - 1) * salaryPerPage + 1}</span> to{' '}
                            <span className="font-semibold text-slate-900 dark:text-slate-100">{Math.min(salaryCurrentPage * salaryPerPage, filteredSalaries.length)}</span> of{' '}
                            <span className="font-semibold text-slate-900 dark:text-slate-100">{filteredSalaries.length}</span> entries
                        </p>

                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => setSalaryCurrentPage((prev) => Math.max(prev - 1, 1))}
                                disabled={salaryCurrentPage === 1}
                                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-transparent dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
                            >
                                <ChevronLeft className="h-3.5 w-3.5" /> Previous
                            </button>

                            <div className="flex items-center gap-1 px-1">
                                {Array.from({ length: totalSalaryPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => setSalaryCurrentPage(page)}
                                        className={`h-7 w-7 rounded-lg text-xs font-semibold transition-colors ${
                                            salaryCurrentPage === page
                                                ? 'bg-emerald-600 text-white shadow-sm'
                                                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => setSalaryCurrentPage((prev) => Math.min(prev + 1, totalSalaryPages))}
                                disabled={salaryCurrentPage === totalSalaryPages || totalSalaryPages === 0}
                                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-transparent dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
                            >
                                Next <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Create / Edit Staff Modal */}
                {showStaffModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
                        <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto space-y-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                                {editingEmployee ? 'Edit Staff Details' : 'Add New Staff Member'}
                            </h3>

                            <form onSubmit={submitStaffForm} className="space-y-4 text-xs">
                                <div>
                                    <label className="mb-1 block font-medium text-slate-600 dark:text-slate-400">Full Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={staffForm.data.name}
                                        onChange={(e) => staffForm.setData('name', e.target.value)}
                                        className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="mb-1 block font-medium text-slate-600 dark:text-slate-400">Role Title *</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. Head Chef, Waiter, Manager"
                                            value={staffForm.data.role_title}
                                            onChange={(e) => staffForm.setData('role_title', e.target.value)}
                                            className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block font-medium text-slate-600 dark:text-slate-400">
                                            Monthly Base Salary ({currency}) *
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            required
                                            value={staffForm.data.base_salary}
                                            onChange={(e) => staffForm.setData('base_salary', parseFloat(e.target.value) || 0)}
                                            className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 font-bold text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="mb-1 block font-medium text-slate-600 dark:text-slate-400">Phone</label>
                                        <input
                                            type="text"
                                            value={staffForm.data.phone}
                                            onChange={(e) => staffForm.setData('phone', e.target.value)}
                                            className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block font-medium text-slate-600 dark:text-slate-400">Joining Date</label>
                                        <input
                                            type="date"
                                            value={staffForm.data.joining_date}
                                            onChange={(e) => staffForm.setData('joining_date', e.target.value)}
                                            className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
                                    <button
                                        type="button"
                                        onClick={() => setShowStaffModal(false)}
                                        className="rounded-xl bg-slate-200 px-4 py-2 font-semibold text-slate-800 dark:bg-slate-800 dark:text-slate-300"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={staffForm.processing}
                                        className="rounded-xl bg-amber-500 px-5 py-2 font-bold text-slate-950 hover:bg-amber-400"
                                    >
                                        Save Staff
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Generate Monthly Salary Modal */}
                {showSalaryModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
                        <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto space-y-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                                {editingSalary ? 'Edit Monthly Salary Voucher' : 'Generate Monthly Salary Voucher'}
                            </h3>

                            <form onSubmit={submitSalaryForm} className="space-y-4 text-xs">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="mb-1 block font-medium text-slate-600 dark:text-slate-400">Select Staff *</label>
                                        <select
                                            value={salaryForm.data.employee_id}
                                            onChange={(e) => {
                                                const id = Number(e.target.value);
                                                const emp = employees.find((x) => x.id === id);
                                                salaryForm.setData({
                                                    ...salaryForm.data,
                                                    employee_id: id,
                                                    base_salary: emp?.base_salary || 0,
                                                });
                                            }}
                                            className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                        >
                                            {employees.map((e) => (
                                                <option key={e.id} value={e.id}>
                                                    {e.name} ({e.role_title})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="mb-1 block font-medium text-slate-600 dark:text-slate-400">Month-Year *</label>
                                        <input
                                            type="month"
                                            required
                                            value={salaryForm.data.month_year}
                                            onChange={(e) => salaryForm.setData('month_year', e.target.value)}
                                            className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 font-mono text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="mb-1 block font-medium text-slate-600 dark:text-slate-400">Base Salary</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={salaryForm.data.base_salary}
                                            onChange={(e) => salaryForm.setData('base_salary', parseFloat(e.target.value) || 0)}
                                            className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 font-bold text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-1 block font-medium text-slate-600 dark:text-slate-400">Bonus</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={salaryForm.data.bonus}
                                            onChange={(e) => salaryForm.setData('bonus', parseFloat(e.target.value) || 0)}
                                            className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 font-bold text-emerald-500 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-1 block font-medium text-slate-600 dark:text-slate-400">Deductions</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={salaryForm.data.deduction}
                                            onChange={(e) => salaryForm.setData('deduction', parseFloat(e.target.value) || 0)}
                                            className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 font-bold text-rose-500 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="mb-1 block font-medium text-slate-600 dark:text-slate-400">Payment Status</label>
                                        <select
                                            value={salaryForm.data.payment_status}
                                            onChange={(e) => salaryForm.setData('payment_status', e.target.value as 'paid' | 'unpaid')}
                                            className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 font-semibold text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                        >
                                            <option value="paid">Paid</option>
                                            <option value="unpaid">Unpaid</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="mb-1 block font-medium text-slate-600 dark:text-slate-400">Payment Date</label>
                                        <input
                                            type="date"
                                            value={salaryForm.data.payment_date}
                                            onChange={(e) => salaryForm.setData('payment_date', e.target.value)}
                                            className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 font-mono text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                        />
                                    </div>
                                </div>

                                {Object.keys(salaryForm.errors).length > 0 && (
                                    <div className="rounded-xl bg-rose-500/10 p-3 text-xs font-semibold text-rose-600 dark:text-rose-400">
                                        {Object.values(salaryForm.errors).map((err, idx) => (
                                            <p key={idx}>{err}</p>
                                        ))}
                                    </div>
                                )}

                                <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
                                    <button
                                        type="button"
                                        onClick={() => setShowSalaryModal(false)}
                                        className="rounded-xl bg-slate-200 px-4 py-2 font-semibold text-slate-800 dark:bg-slate-800 dark:text-slate-300"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={salaryForm.processing}
                                        className="rounded-xl bg-emerald-600 px-5 py-2 font-bold text-white hover:bg-emerald-500"
                                    >
                                        {editingSalary ? 'Update Salary Voucher' : 'Disburse Salary'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Payslip Modal */}
                {viewingPayslip && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
                        <div className="w-full max-w-sm max-h-[90vh] overflow-y-auto space-y-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 text-slate-900 shadow-2xl print:p-0">
                            <div className="space-y-1 border-b border-dashed border-slate-300 pb-4 text-center">
                                <h2 className="text-lg font-black">SALARY PAYSLIP VOUCHER</h2>
                                <p className="text-[10px] text-slate-500">Le Gourmet Bistro Restaurant</p>
                                <p className="mt-1 text-xs font-bold text-amber-600">Period: {viewingPayslip.month_year}</p>
                            </div>

                            <div className="space-y-2 text-xs">
                                <p>
                                    <strong>Employee:</strong> {viewingPayslip.employee?.name}
                                </p>
                                <p>
                                    <strong>Role Title:</strong> {viewingPayslip.employee?.role_title}
                                </p>
                                <div className="space-y-1 border-t border-slate-200 pt-2">
                                    <div className="flex justify-between">
                                        <span>Base Salary</span>
                                        <span>{formatCurrency(viewingPayslip.base_salary, currency)}</span>
                                    </div>
                                    <div className="flex justify-between text-emerald-600">
                                        <span>Bonus / Allowance</span>
                                        <span>+{formatCurrency(viewingPayslip.bonus, currency)}</span>
                                    </div>
                                    <div className="flex justify-between text-rose-600">
                                        <span>Deductions</span>
                                        <span>-{formatCurrency(viewingPayslip.deduction, currency)}</span>
                                    </div>
                                    <div className="flex justify-between border-t border-slate-300 pt-2 text-sm font-black">
                                        <span>Net Disbursed Pay</span>
                                        <span>{formatCurrency(viewingPayslip.net_pay, currency)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between gap-3 pt-2 text-center print:hidden">
                                <button
                                    onClick={() => setViewingPayslip(null)}
                                    className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={printPayslip}
                                    className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950"
                                >
                                    <Printer className="h-4 w-4" /> Print Payslip
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
