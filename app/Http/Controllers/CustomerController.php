<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Customer::with(['hutangs' => fn ($q) => $q->where('status', 'belum_lunas')])
            ->withCount(['hutangs as hutang_aktif_count' => function ($q) {
                $q->where('status', 'belum_lunas');
            }]);

        if ($request->filter === 'blacklisted') {
            $query->where('is_blacklisted', true);
        } elseif ($request->filter === 'punya_hutang') {
            $query->whereHas('hutangs', fn ($q) => $q->where('status', 'belum_lunas'));
        }

        return Inertia::render('Customers/Index', [
            'customers' => $query->orderBy('nama_customer')->get(),
            'filter' => $request->filter ?? 'semua',
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Customers/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nama_customer' => ['required', 'string', 'max:255'],
            'alamat' => ['nullable', 'string', 'max:255'],
            'no_hp' => ['nullable', 'string', 'max:20'],
            'plafon_kasbon' => ['required', 'numeric', 'min:0'],
        ]);

        $customer = Customer::create($validated);

        if (str_contains(url()->previous(), '/sales')) {
            return redirect()->to(url()->previous())->with([
                'success' => 'Customer terdaftar otomatis.',
                'new_customer_id' => $customer->id,
            ]);
        }

        return redirect()->route('customers.index')->with('success', 'Customer berhasil ditambahkan.');
    }

    public function show(Customer $customer): Response
    {
        $customer->load(['hutangs' => fn ($q) => $q->orderByDesc('tanggal_hutang')]);

        $stats = [
            'total_hutang'    => $customer->hutangs->count(),
            'belum_lunas'     => $customer->hutangs->where('status', 'belum_lunas')->count(),
            'lunas'           => $customer->hutangs->where('status', 'lunas')->count(),
            'total_outstanding' => (float) $customer->hutangs->where('status', 'belum_lunas')->sum('jumlah_hutang'),
            'total_pernah_hutang' => (float) $customer->hutangs->sum('jumlah_hutang'),
        ];

        return Inertia::render('Customers/Show', [
            'customer' => $customer,
            'stats'    => $stats,
        ]);
    }

    public function edit(Customer $customer): Response
    {
        return Inertia::render('Customers/Edit', [
            'customer' => $customer,
        ]);
    }

    public function update(Request $request, Customer $customer): RedirectResponse
    {
        $validated = $request->validate([
            'nama_customer' => ['required', 'string', 'max:255'],
            'alamat' => ['nullable', 'string', 'max:255'],
            'no_hp' => ['nullable', 'string', 'max:20'],
            'plafon_kasbon' => ['required', 'numeric', 'min:0'],
        ]);

        $customer->update($validated);

        return redirect()->route('customers.index')->with('success', 'Customer berhasil diperbarui.');
    }

    public function destroy(Customer $customer): RedirectResponse
    {
        $customer->delete();

        return redirect()->route('customers.index')->with('success', 'Customer berhasil dihapus.');
    }

    public function toggleBlacklist(Request $request, Customer $customer): RedirectResponse
    {
        if ($customer->is_blacklisted) {
            $customer->update([
                'is_blacklisted' => false,
                'blacklisted_at' => null,
                'alasan_blacklist' => null,
            ]);
            $message = 'Customer berhasil di-unblacklist.';
        } else {
            $validated = $request->validate([
                'alasan_blacklist' => ['nullable', 'string', 'max:500'],
            ]);
            $customer->update([
                'is_blacklisted' => true,
                'blacklisted_at' => now(),
                'alasan_blacklist' => $validated['alasan_blacklist'] ?? 'Tidak ada alasan.',
            ]);
            $message = 'Customer berhasil di-blacklist.';
        }

        return redirect()->route('customers.index')->with('success', $message);
    }
}
