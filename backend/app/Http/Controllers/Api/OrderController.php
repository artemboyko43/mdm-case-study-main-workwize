<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class OrderController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Order::class);

        $perPage = min(max((int) $request->query('per_page', 20), 1), 100);

        $orders = Order::query()
            ->where('user_id', $request->user()->id)
            ->with('items')
            ->latest('id')
            ->paginate($perPage);

        return OrderResource::collection($orders);
    }

    public function show(Order $order): OrderResource
    {
        $this->authorize('view', $order);

        $order->load('items');

        return new OrderResource($order);
    }
}
