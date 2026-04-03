<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\CartItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CartCheckoutTest extends TestCase
{
    use RefreshDatabase;

    public function test_supplier_cannot_access_cart(): void
    {
        $supplier = User::factory()->supplier()->create();

        $this->actingAs($supplier, 'sanctum')
            ->getJson('/api/cart')
            ->assertForbidden();
    }

    public function test_customer_cart_merge_and_checkout(): void
    {
        $supplier = User::factory()->supplier()->create();
        $customer = User::factory()->create();

        $product = Product::query()->create([
            'supplier_id' => $supplier->id,
            'name' => 'SKU',
            'description' => null,
            'price' => 10.50,
            'stock_quantity' => 5,
        ]);

        $this->actingAs($customer, 'sanctum')
            ->postJson('/api/cart/items', [
                'product_id' => $product->id,
                'quantity' => 2,
            ])
            ->assertSuccessful();

        $this->actingAs($customer, 'sanctum')
            ->postJson('/api/cart/items', [
                'product_id' => $product->id,
                'quantity' => 1,
            ])
            ->assertSuccessful();

        $this->actingAs($customer, 'sanctum')
            ->getJson('/api/cart')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.quantity', 3);

        $this->actingAs($customer, 'sanctum')
            ->postJson('/api/checkout')
            ->assertCreated()
            ->assertJsonPath('data.status', 'completed')
            ->assertJsonPath('data.total', '31.50');

        $product->refresh();
        $this->assertSame(2, $product->stock_quantity);

        $this->assertSame(0, CartItem::query()->where('user_id', $customer->id)->count());
        $this->assertDatabaseHas('order_items', [
            'product_id' => $product->id,
            'quantity' => 3,
        ]);
    }

    public function test_checkout_fails_when_cart_empty(): void
    {
        $customer = User::factory()->create();

        $this->actingAs($customer, 'sanctum')
            ->postJson('/api/checkout')
            ->assertStatus(422)
            ->assertJsonValidationErrors('cart');
    }

    public function test_checkout_fails_when_insufficient_stock(): void
    {
        $supplier = User::factory()->supplier()->create();
        $customer = User::factory()->create();

        $product = Product::query()->create([
            'supplier_id' => $supplier->id,
            'name' => 'Low',
            'description' => null,
            'price' => 1,
            'stock_quantity' => 1,
        ]);

        CartItem::query()->create([
            'user_id' => $customer->id,
            'product_id' => $product->id,
            'quantity' => 3,
        ]);

        $this->actingAs($customer, 'sanctum')
            ->postJson('/api/checkout')
            ->assertStatus(422)
            ->assertJsonValidationErrors('cart');
    }

    public function test_customer_cannot_patch_other_users_cart_item(): void
    {
        $supplier = User::factory()->supplier()->create();
        $a = User::factory()->create();
        $b = User::factory()->create();

        $product = Product::query()->create([
            'supplier_id' => $supplier->id,
            'name' => 'X',
            'description' => null,
            'price' => 1,
            'stock_quantity' => 10,
        ]);

        $item = CartItem::query()->create([
            'user_id' => $a->id,
            'product_id' => $product->id,
            'quantity' => 1,
        ]);

        $this->actingAs($b, 'sanctum')
            ->patchJson("/api/cart/items/{$item->id}", ['quantity' => 9])
            ->assertNotFound();
    }
}
