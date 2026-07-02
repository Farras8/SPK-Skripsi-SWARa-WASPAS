<?php

use App\Http\Controllers\CriteriaController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\HutangController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\LaporanController;
use App\Http\Controllers\PurchaseOrderController;
use App\Http\Controllers\RecommendationController;
use App\Http\Controllers\SalesController;
use App\Http\Controllers\StokController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->route('login');
});

// Routes without auth middleware (for JMeter load testing)
Route::get('/suppliers', [SupplierController::class, 'index'])->name('suppliers.index');
Route::get('/products/{product}/manage-suppliers', [ProductController::class, 'manageSuppliers'])->name('products.manage-suppliers');
Route::post('/products/{product}/save-suppliers', [ProductController::class, 'saveSuppliers'])->name('products.save-suppliers');
Route::resource('criteria', CriteriaController::class)->only(['index', 'store', 'update', 'destroy']);
Route::post('/criteria/reorder', [CriteriaController::class, 'reorder'])->name('criteria.reorder');
Route::post('/criteria/save-weights', [CriteriaController::class, 'saveWeights'])->name('criteria.saveWeights');
Route::get('/recommendations', [RecommendationController::class, 'index'])->name('recommendations.index');

Route::middleware('auth')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::put('/profile/password', [ProfileController::class, 'updatePassword'])->name('password.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::resource('products', ProductController::class)->except(['show']);

    Route::resource('customers', CustomerController::class)->except(['show']);
    Route::get('/customers/{customer}', [CustomerController::class, 'show'])->name('customers.show');
    Route::post('/customers/{customer}/toggle-blacklist', [CustomerController::class, 'toggleBlacklist'])->name('customers.toggle-blacklist');

    Route::resource('hutangs', HutangController::class)->only(['index', 'create', 'store', 'destroy']);
    Route::post('/hutangs/{hutang}/lunasi', [HutangController::class, 'lunasi'])->name('hutangs.lunasi');

    Route::resource('stoks', StokController::class)->except(['show']);
    Route::post('/stoks/{stok}/adjust', [StokController::class, 'adjust'])->name('stoks.adjust');

    Route::resource('purchase-orders', PurchaseOrderController::class)->only(['index', 'create', 'store', 'show']);
    Route::post('/purchase-orders/{purchaseOrder}/receive', [PurchaseOrderController::class, 'receive'])->name('purchase-orders.receive');
    Route::post('/purchase-orders/{purchaseOrder}/cancel', [PurchaseOrderController::class, 'cancel'])->name('purchase-orders.cancel');
    Route::resource('sales', SalesController::class)->only(['index', 'create', 'store', 'show', 'destroy']);
    Route::get('/laporan', [LaporanController::class, 'index'])->name('laporan.index');
});

Route::middleware(['auth', 'role:super_admin'])->group(function () {
    Route::resource('users', UserController::class)->except(['show']);
    Route::resource('suppliers', SupplierController::class)->except(['show', 'index']);
});

require __DIR__.'/auth.php';
