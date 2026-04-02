<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\Supplier;

use App\Http\Controllers\Controller;
use App\Http\Resources\SupplierSaleResource;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class SalesController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $perPage = min(max((int) $request->query('per_page', 20), 1), 100);

        $lines = OrderItem::query()
            ->where('supplier_id', $request->user()->id)
            ->with([
                'order' => static fn ($q) => $q->select('id', 'user_id', 'created_at'),
                'order.user:id,name,email',
            ])
            ->latest('id')
            ->paginate($perPage);

        return SupplierSaleResource::collection($lines);
    }
}
