<?php

namespace App\Http\Controllers;

use App\Models\Criteria;
use App\Models\Product;
use App\Services\WaspasService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RecommendationController extends Controller
{
    public function __construct(
        private WaspasService $waspasService
    ) {}

    public function index(Request $request): Response
    {
        $products = Product::orderBy('kategori')->orderBy('nama_produk')->get();
        $criteria = Criteria::orderBy('urutan_prioritas')->get();

        $selectedProductId = $request->query('product_id');
        $rankings = [];
        $error = null;
        $selectedProduct = null;
        $calculationDetails = null;

        if ($selectedProductId) {
            $selectedProduct = Product::find($selectedProductId);

            if ($selectedProduct) {
                $result = $this->waspasService->calculate($selectedProduct);
                $rankings = $result['rankings'];
                $error = $result['error'];
                $calculationDetails = $result['calculationDetails'] ?? null;
            }
        }

        return Inertia::render('Recommendations/Index', [
            'products' => $products,
            'criteria' => $criteria,
            'rankings' => $rankings,
            'selectedProductId' => $selectedProductId ? (int) $selectedProductId : null,
            'selectedProduct' => $selectedProduct,
            'error' => $error,
            'calculationDetails' => $calculationDetails,
        ]);
    }
}
