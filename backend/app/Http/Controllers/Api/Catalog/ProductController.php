<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\Catalog;

use App\Http\Controllers\Controller;
use App\Http\Resources\CatalogProductResource;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ProductController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $perPage = min(max((int) $request->query('per_page', 20), 1), 100);

        $products = Product::query()
            ->with(['supplier:id,name'])
            ->latest('id')
            ->paginate($perPage);

        return CatalogProductResource::collection($products);
    }

    public function show(Product $product): CatalogProductResource
    {
        $product->load(['supplier:id,name']);

        return new CatalogProductResource($product);
    }
}
