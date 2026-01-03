import { cn } from "@/lib/utils";
import { IconCertificate, IconHome, IconMenu, IconReport } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useState } from "react";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";

export function Nav () {
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
    return(
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
                        <DropdownMenuItem asChild>
                            <Link to="/" activeProps={{ className: "bg-primary text-primary-foreground" }}>
                                <IconReport className="size-4" />
                                التقارير
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link to="/" activeProps={{ className: "bg-primary text-primary-foreground" }}>
                                <IconCertificate className="size-4" />
                                الشهادات
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                    </DropdownMenu>
                    <div className="hidden items-center gap-3 md:flex">
                    {/* desktop nav */}
                    <Link to="/">
                        {({ isActive }:{isActive:boolean}) => (
                        <div className={cn(isActive ? 'underline underline-offset-2 font-bold' : '',"flex gap-1 items-center")}>
                            <IconHome className="size-4" />
                            الرئيسية
                        </div>
                        )}
                    </Link>
                    <Link to="/report">
                        {({ isActive }:{isActive:boolean}) => (
                        <div className={cn(isActive ? 'underline underline-offset-2 font-bold' : '',"flex gap-1 items-center")}>
                            <IconReport className="size-4" />
                            التقارير
                        </div>
                        )}
                    </Link>
                    <Link to="/certificate">
                        {({ isActive }:{isActive:boolean}) => (
                        <div className={cn(isActive ? 'underline underline-offset-2 font-bold' : '',"flex gap-1 items-center")}>
                            <IconCertificate className="size-4" />
                            الشهادات
                        </div>
                        )}
                    </Link>
                    </div>
                    <div className="flex items-center gap-2 mr-auto">
                    <ThemeToggle />
                    </div>
                </nav>
        </motion.header>
    )
}