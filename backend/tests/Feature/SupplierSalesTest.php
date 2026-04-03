<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\CartItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SupplierSalesTest extends TestCase
{
    use RefreshDatabase;

    public function test_supplier_sees_buyers_for_their_products(): void
    {
        $supplierA = User::factory()->supplier()->create();
        $supplierB = User::factory()->supplier()->create();
        $customer = User::factory()->create();

        $pA = Product::query()->create([
            'supplier_id' => $supplierA->id,
            'name' => 'From A',
            'description' => null,
            'price' => 3,
            'stock_quantity' => 10,
        ]);
        $pB = Product::query()->create([
            'supplier_id' => $supplierB->id,
            'name' => 'From B',
            'description' => null,
            'price' => 7,
            'stock_quantity' => 10,
        ]);

        CartItem::query()->create(['user_id' => $customer->id, 'product_id' => $pA->id, 'quantity' => 1]);
        CartItem::query()->create(['user_id' => $customer->id, 'product_id' => $pB->id, 'quantity' => 1]);
        $this->actingAs($customer, 'sanctum')->postJson('/api/checkout')->assertCreated();

        $this->actingAs($supplierA, 'sanctum')
            ->getJson('/api/supplier/sales')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.buyer.email', $customer->email)
            ->assertJsonPath('data.0.product_name', 'From A');

        $this->actingAs($supplierB, 'sanctum')
            ->getJson('/api/supplier/sales')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.product_name', 'From B');
    }

    public function test_customer_cannot_access_supplier_sales(): void
    {
        $customer = User::factory()->create();

        $this->actingAs($customer, 'sanctum')
            ->getJson('/api/supplier/sales')
            ->assertForbidden();
    }
}
