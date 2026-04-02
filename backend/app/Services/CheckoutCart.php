<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\CartItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

final class CheckoutCart
{
    public function run(User $user): Order
    {
        return DB::transaction(function () use ($user) {
            $items = CartItem::query()
                ->where('user_id', $user->id)
                ->orderBy('id')
                ->lockForUpdate()
                ->get();

            if ($items->isEmpty()) {
                throw ValidationException::withMessages([
                    'cart' => ['Cart is empty.'],
                ]);
            }

            $productIds = $items->pluck('product_id')->unique()->sort()->values();
            $products = Product::query()
                ->whereIn('id', $productIds)
                ->orderBy('id')
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            $total = '0.00';
            $prepared = [];

            foreach ($items as $cartItem) {
                $product = $products->get($cartItem->product_id);
                if ($product === null) {
                    throw ValidationException::withMessages([
                        'cart' => ['A product in your cart is no longer available.'],
                    ]);
                }
                if ($cartItem->quantity > $product->stock_quantity) {
                    throw ValidationException::withMessages([
                        'cart' => ["Not enough stock for «{$product->name}»."],
                    ]);
                }
                $line = bcmul((string) $product->price, (string) $cartItem->quantity, 2);
                $total = bcadd($total, $line, 2);
                $prepared[] = [$cartItem, $product];
            }

            $order = Order::query()->create([
                'user_id' => $user->id,
                'status' => 'completed',
                'total' => $total,
            ]);

            foreach ($prepared as [$cartItem, $product]) {
                OrderItem::query()->create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'supplier_id' => $product->supplier_id,
                    'product_name' => $product->name,
                    'quantity' => $cartItem->quantity,
                    'unit_price' => $product->price,
                ]);
                $product->decrement('stock_quantity', $cartItem->quantity);
            }

            CartItem::query()->where('user_id', $user->id)->delete();

            return $order->load('items');
        });
    }
}
