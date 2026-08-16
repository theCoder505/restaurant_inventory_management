import AppLayout from '@/layouts/app-layout';
import { formatCurrency, formatDate, showConfirm, showToast } from '@/lib/swal';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { DollarSign, Edit, Plus, Printer, Trash2, Users } from 'lucide-react';
import { useState } from 'react';

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
}

interface Props {
    employees: Employee[];
    allSalaries: Salary[];
    currency: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'HR & Employee Roster', href: '/admin/employees' },
];

export default function EmployeesIndex({ employees, allSalaries, currency }: Props) {
    const [showStaffModal, setShowStaffModal] = useState(false);
    const [showSalaryModal, setShowSalaryModal] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const [viewingPayslip, setViewingPayslip] = useState<Salary | null>(null);

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
        notes: '',
    });

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
            staffForm.put(`/admin/employees/${editingEmployee.id}`, {
                onSuccess: () => {
                    setShowStaffModal(false);
                    showToast(`Staff member "${staffForm.data.name}" updated!`, 'success');
                },
            });
        } else {
            staffForm.post('/admin/employees', {
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
            router.delete(`/admin/employees/${emp.id}`, {
                onSuccess: () => showToast(`Staff member "${emp.name}" removed`, 'success'),
            });
        }
    };

    const submitSalaryForm = (e: React.FormEvent) => {
        e.preventDefault();
        salaryForm.post('/admin/employees/generate-salary', {
            onSuccess: () => {
                setShowSalaryModal(false);
                showToast('Monthly salary voucher generated!', 'success');
            },
        });
    };

    const printPayslip = () => window.print();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="HR & Monthly Salary Management" />

            <div className="flex min-h-screen flex-col gap-6 bg-slate-50 p-4 text-slate-900 transition-colors md:p-6 dark:bg-slate-950 dark:text-slate-100">
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
                            onClick={() => setShowSalaryModal(true)}
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
                    <div className="border-b border-slate-200 p-4 dark:border-slate-800">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Active Restaurant Staff Roster</h3>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
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
                                {employees.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-8 text-center text-slate-500">
                                            No employee staff records created yet.
                                        </td>
                                    </tr>
                                ) : (
                                    employees.map((emp) => (
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
                </div>

                {/* Salary Log Table */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="border-b border-slate-200 p-4 dark:border-slate-800">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Monthly Payroll Disbursement Log</h3>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                            <thead className="bg-slate-100 text-[10px] font-semibold text-slate-500 uppercase dark:bg-slate-950 dark:text-slate-400">
                                <tr>
                                    <th className="p-3.5">Month</th>
                                    <th className="p-3.5">Employee</th>
                                    <th className="p-3.5 text-right">Base Salary</th>
                                    <th className="p-3.5 text-right">Bonus</th>
                                    <th className="p-3.5 text-right">Deduction</th>
                                    <th className="p-3.5 text-right">Net Pay</th>
                                    <th className="p-3.5 text-center">Payslip</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {allSalaries.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-6 text-center text-slate-500">
                                            No salary vouchers generated yet.
                                        </td>
                                    </tr>
                                ) : (
                                    allSalaries.map((sal) => (
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
                                            <td className="p-3.5 text-center">
                                                <button
                                                    onClick={() => setViewingPayslip(sal)}
                                                    className="rounded-xl bg-slate-100 px-3 py-1 text-[11px] font-bold text-amber-600 dark:bg-slate-800 dark:text-amber-400"
                                                >
                                                    Payslip Voucher
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Create / Edit Staff Modal */}
                {showStaffModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
                        <div className="w-full max-w-lg space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
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
                        <div className="w-full max-w-lg space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Generate Monthly Salary Voucher</h3>

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
                                        Disburse Salary
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Payslip Modal */}
                {viewingPayslip && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
                        <div className="w-full max-w-sm space-y-4 rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-2xl print:p-0">
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
