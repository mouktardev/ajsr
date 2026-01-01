import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { IconHome, IconMenu } from '@tabler/icons-react';
import { Link, Outlet, createFileRoute } from '@tanstack/react-router';
import { motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { useState } from 'react';

export const Route = createFileRoute('/_home')({
  component: HomeLayout,
});

function HomeLayout() {
    const { scrollY } = useScroll();
    const [hidden, setHidden] = useState<boolean>(false);

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const pervious = scrollY.getPrevious();
    if (pervious && latest > pervious && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  return (
    <main className="flex min-h-dvh w-full flex-col" lang="ar" dir="rtl">
        <motion.header
        variants={{
            visible: { y: 0 },
            hidden: { y: '-100%' },
        }}
        animate={hidden ? 'hidden' : 'visible'}
        transition={{ duration: 0.35, ease: 'easeInOut' }}
        className="sticky top-0 z-10 border-b bg-background px-4 py-2"
        >
            <nav className="flex items-center justify-between">
            {/* mobile nav */}
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className='md:hidden'>
                <IconMenu />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                <Link to="/" activeProps={{ className: "bg-primary text-primary-foreground" }}>
                    <IconHome className="size-4" />
                    الرئيسية
                </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
            <div className="hidden items-center gap-3 md:flex">
            {/* desktop nav */}
            <Link to="/">
                {({ isActive }) => (
                <div className={cn(isActive ? 'underline underline-offset-2 font-bold' : '',"flex gap-1 items-center")}>
                    <IconHome className="size-4" />
                    الرئيسية
                </div>
                )}
            </Link>
            </div>
            <div className="flex items-center gap-2 mr-auto">
            <ThemeToggle />
            </div>
        </nav>
        </motion.header>
        <Outlet />
    </main>
  );
}
