<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\Cart;

use App\Http\Controllers\Controller;
use App\Http\Resources\CartItemResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CartController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $items = $request->user()
            ->cartItems()
            ->with(['product.supplier:id,name'])
            ->orderBy('id')
            ->get();

        return CartItemResource::collection($items);
    }
}
