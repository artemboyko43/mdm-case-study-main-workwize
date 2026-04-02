<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SupplierProductTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_cannot_list_supplier_products(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/supplier/products')
            ->assertForbidden();
    }

    public function test_supplier_can_crud_own_products(): void
    {
        $supplier = User::factory()->supplier()->create();

        $create = $this->actingAs($supplier, 'sanctum')->postJson('/api/supplier/products', [
            'name' => 'Widget',
            'description' => 'A widget.',
            'price' => 19.99,
            'stock_quantity' => 100,
        ]);

        $create->assertCreated()
            ->assertJsonPath('data.name', 'Widget');

        $productId = $create->json('data.id');

        $this->actingAs($supplier, 'sanctum')
            ->getJson('/api/supplier/products')
            ->assertOk()
            ->assertJsonCount(1, 'data');

        $this->actingAs($supplier, 'sanctum')
            ->getJson("/api/supplier/products/{$productId}")
            ->assertOk()
            ->assertJsonPath('data.name', 'Widget');

        $this->actingAs($supplier, 'sanctum')
            ->patchJson("/api/supplier/products/{$productId}", [
                'name' => 'Mega Widget',
                'price' => 24.50,
            ])
            ->assertOk()
            ->assertJsonPath('data.name', 'Mega Widget')
            ->assertJsonPath('data.price', '24.50');

        $this->actingAs($supplier, 'sanctum')
            ->deleteJson("/api/supplier/products/{$productId}")
            ->assertNoContent();

        $this->assertDatabaseMissing('products', ['id' => $productId]);
    }

    public function test_supplier_cannot_manage_other_supplier_product(): void
    {
        $a = User::factory()->supplier()->create();
        $b = User::factory()->supplier()->create();

        $product = Product::query()->create([
            'supplier_id' => $b->id,
            'name' => 'Other',
            'description' => null,
            'price' => 10,
            'stock_quantity' => 1,
        ]);

        $this->actingAs($a, 'sanctum')
            ->getJson("/api/supplier/products/{$product->id}")
            ->assertForbidden();

        $this->actingAs($a, 'sanctum')
            ->patchJson("/api/supplier/products/{$product->id}", ['name' => 'Hack'])
            ->assertForbidden();

        $this->actingAs($a, 'sanctum')
            ->deleteJson("/api/supplier/products/{$product->id}")
            ->assertForbidden();
    }
}
