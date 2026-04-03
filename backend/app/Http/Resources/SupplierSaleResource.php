<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin OrderItem */
class SupplierSaleResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $order = $this->order;

        return [
            'id' => $this->id,
            'order_id' => $this->order_id,
            'purchased_at' => $order->created_at,
            'buyer' => [
                'id' => $order->user->id,
                'name' => $order->user->name,
                'email' => $order->user->email,
            ],
            'product_id' => $this->product_id,
            'product_name' => $this->product_name,
            'quantity' => $this->quantity,
            'unit_price' => $this->unit_price,
            'line_total' => bcmul((string) $this->unit_price, (string) $this->quantity, 2),
        ];
    }
}
