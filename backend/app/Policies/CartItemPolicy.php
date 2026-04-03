<?php

declare(strict_types=1);

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\CartItem;
use App\Models\User;

class CartItemPolicy
{
    public function update(User $user, CartItem $cartItem): bool
    {
        return $user->role === UserRole::Customer && $user->id === $cartItem->user_id;
    }

    public function delete(User $user, CartItem $cartItem): bool
    {
        return $this->update($user, $cartItem);
    }
}
