<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\Product;
use App\Models\Stok;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SalesTest extends TestCase
{
    use RefreshDatabase;

    public function test_sales_transaction_reduces_stock_of_specific_batch(): void
    {
        $user = User::factory()->create();
        $product = Product::create([
            'nama_produk' => 'Aqua 600ml',
            'kategori' => 'Air Mineral (AMDK)',
        ]);

        $stok1 = Stok::create([
            'product_id' => $product->id,
            'nama_barang' => 'Aqua 600ml',
            'jumlah' => 10,
            'harga_jual' => 3000,
            'tanggal_masuk' => now()->toDateString(),
            'tanggal_kadaluarsa' => now()->addMonths(6)->toDateString(),
        ]);

        $stok2 = Stok::create([
            'product_id' => $product->id,
            'nama_barang' => 'Aqua 600ml',
            'jumlah' => 20,
            'harga_jual' => 3500,
            'tanggal_masuk' => now()->toDateString(),
            'tanggal_kadaluarsa' => now()->addMonths(12)->toDateString(),
        ]);

        $response = $this->actingAs($user)->post('/sales', [
            'tanggal_jual' => now()->toDateString(),
            'jenis_pembayaran' => 'tunai',
            'items' => [
                [
                    'stok_id' => $stok2->id,
                    'jumlah' => 5,
                    'harga_satuan' => 3500,
                ]
            ]
        ]);

        $response->assertRedirect(route('sales.index'));
        
        $this->assertEquals(10, $stok1->fresh()->jumlah);
        $this->assertEquals(15, $stok2->fresh()->jumlah);

        $this->assertDatabaseHas('sales_transactions', [
            'jenis_pembayaran' => 'tunai',
            'total_harga' => 17500,
        ]);
    }

    public function test_sales_transaction_fails_if_quantity_exceeds_batch_stock(): void
    {
        $user = User::factory()->create();
        $product = Product::create([
            'nama_produk' => 'Aqua 600ml',
            'kategori' => 'Air Mineral (AMDK)',
        ]);

        $stok = Stok::create([
            'product_id' => $product->id,
            'nama_barang' => 'Aqua 600ml',
            'jumlah' => 10,
            'harga_jual' => 3000,
            'tanggal_masuk' => now()->toDateString(),
            'tanggal_kadaluarsa' => now()->addMonths(6)->toDateString(),
        ]);

        $response = $this->actingAs($user)->post('/sales', [
            'tanggal_jual' => now()->toDateString(),
            'jenis_pembayaran' => 'tunai',
            'items' => [
                [
                    'stok_id' => $stok->id,
                    'jumlah' => 15,
                    'harga_satuan' => 3000,
                ]
            ]
        ]);

        $response->assertSessionHasErrors('items');
        $this->assertEquals(10, $stok->fresh()->jumlah);
    }

    public function test_sales_transaction_requires_customer_for_credit_payment(): void
    {
        $user = User::factory()->create();
        $product = Product::create([
            'nama_produk' => 'Aqua 600ml',
            'kategori' => 'Air Mineral (AMDK)',
        ]);

        $stok = Stok::create([
            'product_id' => $product->id,
            'nama_barang' => 'Aqua 600ml',
            'jumlah' => 10,
            'harga_jual' => 3000,
            'tanggal_masuk' => now()->toDateString(),
            'tanggal_kadaluarsa' => now()->addMonths(6)->toDateString(),
        ]);

        $response = $this->actingAs($user)->post('/sales', [
            'tanggal_jual' => now()->toDateString(),
            'jenis_pembayaran' => 'kredit',
            'items' => [
                [
                    'stok_id' => $stok->id,
                    'jumlah' => 2,
                    'harga_satuan' => 3000,
                ]
            ]
        ]);

        $response->assertSessionHasErrors('customer_id');
    }

    public function test_sales_transaction_fails_if_credit_exceeds_plafon(): void
    {
        $user = User::factory()->create();
        $product = Product::create([
            'nama_produk' => 'Aqua 600ml',
            'kategori' => 'Air Mineral (AMDK)',
        ]);

        $stok = Stok::create([
            'product_id' => $product->id,
            'nama_barang' => 'Aqua 600ml',
            'jumlah' => 10,
            'harga_jual' => 3000,
            'tanggal_masuk' => now()->toDateString(),
            'tanggal_kadaluarsa' => now()->addMonths(6)->toDateString(),
        ]);

        $customer = Customer::create([
            'nama_customer' => 'John Doe',
            'plafon_kasbon' => 5000,
            'is_blacklisted' => false,
        ]);

        $response = $this->actingAs($user)->post('/sales', [
            'tanggal_jual' => now()->toDateString(),
            'jenis_pembayaran' => 'kredit',
            'customer_id' => $customer->id,
            'items' => [
                [
                    'stok_id' => $stok->id,
                    'jumlah' => 3,
                    'harga_satuan' => 3000,
                ]
            ]
        ]);

        $response->assertSessionHasErrors('customer_id');
        $this->assertEquals(10, $stok->fresh()->jumlah);
    }
}
