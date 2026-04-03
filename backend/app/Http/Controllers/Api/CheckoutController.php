<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Services\CheckoutCart;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CheckoutController extends Controller
{
    public function store(Request $request, CheckoutCart $checkout): JsonResponse
    {
        $order = $checkout->run($request->user());

        return (new OrderResource($order))
            ->response()
            ->setStatusCode(201);
    }
}
