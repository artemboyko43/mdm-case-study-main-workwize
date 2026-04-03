<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CatalogProductTest extends TestCase
{
    use RefreshDatabase;

    public function test_index_lists_all_products_with_supplier(): void
    {
        $s1 = User::factory()->supplier()->create(['name' => 'Acme']);
        $s2 = User::factory()->supplier()->create(['name' => 'Globex']);

        Product::query()->create([
            'supplier_id' => $s1->id,
            'name' => 'Alpha',
            'description' => null,
            'price' => 1,
            'stock_quantity' => 5,
        ]);
        Product::query()->create([
            'supplier_id' => $s2->id,
            'name' => 'Beta',
            'description' => 'Desc',
            'price' => 2,
            'stock_quantity' => 0,
        ]);

        $response = $this->getJson('/api/products');

        $response->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.supplier.name', 'Globex')
            ->assertJsonPath('data.1.supplier.name', 'Acme');
    }

    public function test_show_returns_product_with_supplier(): void
    {
        $supplier = User::factory()->supplier()->create(['name' => 'Vendor']);
        $product = Product::query()->create([
            'supplier_id' => $supplier->id,
            'name' => 'Item',
            'description' => 'Full text',
            'price' => 9.99,
            'stock_quantity' => 3,
        ]);

        $this->getJson("/api/products/{$product->id}")
            ->assertOk()
            ->assertJsonPath('data.name', 'Item')
            ->assertJsonPath('data.supplier.name', 'Vendor');
    }

    public function test_show_returns_404_for_missing_product(): void
    {
        $this->getJson('/api/products/99999')->assertNotFound();
    }
}
