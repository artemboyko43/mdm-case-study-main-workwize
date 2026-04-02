<?php

declare(strict_types=1);

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\Product;
use App\Models\User;

class ProductPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->role === UserRole::Supplier;
    }

    public function view(User $user, Product $product): bool
    {
        return $user->role === UserRole::Supplier && $user->id === $product->supplier_id;
    }

    public function create(User $user): bool
    {
        return $user->role === UserRole::Supplier;
    }

    public function update(User $user, Product $product): bool
    {
        return $this->view($user, $product);
    }

    public function delete(User $user, Product $product): bool
    {
        return $this->view($user, $product);
    }
}
