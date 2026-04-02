<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\CartItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderHistoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_lists_and_shows_own_orders(): void
    {
        $supplier = User::factory()->supplier()->create();
        $customer = User::factory()->create();

        $product = Product::query()->create([
            'supplier_id' => $supplier->id,
            'name' => 'Item',
            'description' => null,
            'price' => 5,
            'stock_quantity' => 10,
        ]);

        CartItem::query()->create([
            'user_id' => $customer->id,
            'product_id' => $product->id,
            'quantity' => 2,
        ]);

        $checkout = $this->actingAs($customer, 'sanctum')->postJson('/api/checkout');
        $checkout->assertCreated();
        $orderId = $checkout->json('data.id');

        $this->actingAs($customer, 'sanctum')
            ->getJson('/api/orders')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $orderId);

        $this->actingAs($customer, 'sanctum')
            ->getJson("/api/orders/{$orderId}")
            ->assertOk()
            ->assertJsonPath('data.total', '10.00')
            ->assertJsonCount(1, 'data.items');
    }

    public function test_supplier_cannot_list_customer_orders(): void
    {
        $supplier = User::factory()->supplier()->create();

        $this->actingAs($supplier, 'sanctum')
            ->getJson('/api/orders')
            ->assertForbidden();
    }

    public function test_customer_gets_404_for_foreign_order_id(): void
    {
        $supplier = User::factory()->supplier()->create();
        $a = User::factory()->create();
        $b = User::factory()->create();

        $product = Product::query()->create([
            'supplier_id' => $supplier->id,
            'name' => 'P',
            'description' => null,
            'price' => 1,
            'stock_quantity' => 5,
        ]);

        CartItem::query()->create(['user_id' => $a->id, 'product_id' => $product->id, 'quantity' => 1]);
        $orderId = $this->actingAs($a, 'sanctum')->postJson('/api/checkout')->json('data.id');

        $this->actingAs($b, 'sanctum')
            ->getJson("/api/orders/{$orderId}")
            ->assertNotFound();
    }
}
