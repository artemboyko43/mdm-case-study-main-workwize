<?php

declare(strict_types=1);

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\Order;
use App\Models\User;

class OrderPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->role === UserRole::Customer;
    }

    public function view(User $user, Order $order): bool
    {
        return $user->role === UserRole::Customer && $user->id === $order->user_id;
    }
}
