
<script setup lang="ts">
import { Link, } from '@inertiajs/vue3';
import { UserPen, LayoutGrid, Hammer, Map } from 'lucide-vue-next';
import AppLogo from '@/components/AppLogo.vue';
import NavFooter from '@/components/NavFooter.vue';
import NavMain from '@/components/NavMain.vue';
import NavUser from '@/components/NavUser.vue';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';

import { dashboard } from '@/routes';
import { index as index_complaint } from '@/routes/complaint';
import { show as show_map } from '@/routes/map';
import { edit } from '@/routes/profile';

import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: Map,
    },
    {
        title: 'Complaint',
        href: index_complaint(),
        icon: Hammer,
    },
    {
        title: 'Leaflet',
        href: show_map(),
        icon: Map,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Edit My Profile',
        href: edit(),
        icon: UserPen,
    },
];

</script>

<template>
    <Sidebar collapsible="icon" variant="inset" class=" z-2000 ">
        <SidebarHeader>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton size="lg" as-child>
                        <Link :href="dashboard()">
                            <AppLogo />
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
            <NavMain :items="mainNavItems" />
        </SidebarContent>

        <SidebarFooter class=" z-3000 ">
            <NavFooter :items="footerNavItems" />
            <NavUser class=" z-4000 " />
        </SidebarFooter>
    </Sidebar>
    <slot />
</template>

