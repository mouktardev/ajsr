import { Nav } from '@/components/Nav';
import { Outlet, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_home')({
  component: HomeLayout,
});

function HomeLayout() {
  return (
    <main className="flex min-h-dvh w-full flex-col" lang="ar" dir="rtl">
        <Nav/>
        <Outlet />
    </main>
  );
}
