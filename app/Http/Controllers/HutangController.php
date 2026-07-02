<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Hutang;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HutangController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Hutang::with('customer');

        if ($request->filter === 'belum_lunas') {
            $query->belumLunas();
        } elseif ($request->filter === 'lunas') {
            $query->lunas();
        }

        $customers = Customer::where('is_blacklisted', false)
            ->orderBy('nama_customer')
            ->get();

        return Inertia::render('Hutangs/Index', [
            'hutangs' => $query->orderByDesc('tanggal_hutang')->get(),
            'filter' => $request->filter ?? 'semua',
            'customers' => $customers,
        ]);
    }

    public function create(): Response
    {
        $customers = Customer::where('is_blacklisted', false)
            ->orderBy('nama_customer')
            ->get();

        return Inertia::render('Hutangs/Create', [
            'customers' => $customers,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'customer_id' => ['required', 'exists:customers,id'],
            'jumlah_hutang' => ['required', 'numeric', 'min:1'],
            'tanggal_hutang' => ['required', 'date'],
            'keterangan' => ['nullable', 'string', 'max:500'],
        ]);

        $customer = Customer::findOrFail($validated['customer_id']);

        if ($customer->is_blacklisted) {
            return back()->withErrors(['customer_id' => 'Customer ini sudah di-blacklist.']);
        }

        if ($validated['jumlah_hutang'] > $customer->sisa_plafon) {
            return back()->withErrors([
                'jumlah_hutang' => "Melebihi sisa plafon (Rp " . number_format($customer->sisa_plafon, 0, ',', '.') . ").",
            ]);
        }

        $validated['status'] = 'belum_lunas';
        Hutang::create($validated);

        return redirect()->route('hutangs.index')->with('success', 'Kasbon berhasil dicatat.');
    }

    public function lunasi(Hutang $hutang): RedirectResponse
    {
        $hutang->update([
            'status' => 'lunas',
            'tanggal_lunas' => now()->toDateString(),
        ]);

        return redirect()->route('hutangs.index')->with('success', 'Hutang berhasil dilunasi.');
    }

    public function destroy(Hutang $hutang): RedirectResponse
    {
        $hutang->delete();

        return redirect()->route('hutangs.index')->with('success', 'Catatan hutang berhasil dihapus.');
    }
}
