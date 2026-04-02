<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_register_creates_user_and_returns_token(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Supplier One',
            'email' => 'supplier@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => UserRole::Supplier->value,
        ]);

        $response->assertCreated()
            ->assertJsonStructure(['token', 'user' => ['id', 'name', 'email', 'role']]);

        $this->assertDatabaseHas('users', [
            'email' => 'supplier@example.com',
            'role' => UserRole::Supplier->value,
        ]);
    }

    public function test_login_returns_token(): void
    {
        User::query()->create([
            'name' => 'Buyer',
            'email' => 'buyer@example.com',
            'password' => Hash::make('secret456'),
            'role' => UserRole::Customer,
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'buyer@example.com',
            'password' => 'secret456',
        ]);

        $response->assertOk()
            ->assertJsonPath('user.email', 'buyer@example.com')
            ->assertJsonStructure(['token', 'user']);
    }

    public function test_user_endpoint_requires_token(): void
    {
        $this->getJson('/api/user')->assertUnauthorized();
    }

    public function test_user_endpoint_with_bearer_token(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/user');

        $response->assertOk()
            ->assertJsonPath('data.email', $user->email);
    }
}
