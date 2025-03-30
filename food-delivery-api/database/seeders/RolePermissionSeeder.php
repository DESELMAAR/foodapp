<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    public function run()
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Permissions
        $permissions = [
            'manage users',  // Admin only
            'manage restaurants', // Admin only
            'manage menus', // Restaurant only
            'manage orders', // Restaurant only
            'place orders', // Customer only
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Roles
        $admin = Role::firstOrCreate(['name' => 'admin']);
        $restaurant = Role::firstOrCreate(['name' => 'restaurant']);
        $customer = Role::firstOrCreate(['name' => 'customer']);

        // Assign permissions to roles
        $admin->givePermissionTo(['manage users', 'manage restaurants']);
        $restaurant->givePermissionTo(['manage menus', 'manage orders']);
        $customer->givePermissionTo(['place orders','manage orders']);
    }
}
