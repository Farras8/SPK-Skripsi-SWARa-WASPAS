<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoleMiddlewareTest extends TestCase
{
    use RefreshDatabase;

    public function test_super_admin_can_access_users_page(): void
    {
        $superAdmin = User::factory()->superAdmin()->create();

        $response = $this->actingAs($superAdmin)->get('/users');

        $response->assertStatus(200);
    }

    public function test_admin_cannot_access_users_page(): void
    {
        $admin = User::factory()->create();

        $response = $this->actingAs($admin)->get('/users');

        $response->assertStatus(403);
    }

    public function test_guest_is_redirected_to_login(): void
    {
        $response = $this->get('/users');

        $response->assertRedirect('/login');
    }
}
