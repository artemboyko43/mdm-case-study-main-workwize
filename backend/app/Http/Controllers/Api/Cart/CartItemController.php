<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\Cart;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCartItemRequest;
use App\Http\Requests\UpdateCartItemRequest;
use App\Http\Resources\CartItemResource;
use App\Models\CartItem;
use Illuminate\Http\JsonResponse;

class CartItemController extends Controller
{
    public function store(StoreCartItemRequest $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->validated();

        $item = CartItem::query()->firstOrNew([
            'user_id' => $user->id,
            'product_id' => $data['product_id'],
        ]);
        $item->quantity = ($item->exists ? $item->quantity : 0) + $data['quantity'];
        $item->save();

        $item->load(['product.supplier:id,name']);

        return (new CartItemResource($item))->response()->setStatusCode($item->wasRecentlyCreated ? 201 : 200);
    }

    public function update(UpdateCartItemRequest $request, CartItem $cartItem): CartItemResource
    {
        $this->authorize('update', $cartItem);

        $cartItem->update(['quantity' => $request->validated('quantity')]);
        $cartItem->load(['product.supplier:id,name']);

        return new CartItemResource($cartItem->fresh());
    }

    public function destroy(CartItem $cartItem): JsonResponse
    {
        $this->authorize('delete', $cartItem);

        $cartItem->delete();

        return response()->json(null, 204);
    }
}
