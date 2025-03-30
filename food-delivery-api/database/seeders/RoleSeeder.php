<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleSeeder extends Seeder
{
    public function run()
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Clear existing roles and permissions
        Role::query()->delete();
        Permission::query()->delete();

        // Create roles
        $customerRole = Role::create(['name' => 'customer']);
        $restaurantRole = Role::create(['name' => 'restaurant']);
        $adminRole = Role::create(['name' => 'admin']);

        // Create permissions (optional, if needed)
        $createOrder = Permission::create(['name' => 'create-order']);
        $manageMenu = Permission::create(['name' => 'manage-menu']);
        $manageUsers = Permission::create(['name' => 'manage-users']);

        // Assign permissions to roles
        $customerRole->givePermissionTo($createOrder);
        $restaurantRole->givePermissionTo($manageMenu);
        $adminRole->givePermissionTo([$manageUsers, $manageMenu]);
    }
}