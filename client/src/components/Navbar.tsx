"use client";
import * as React from "react";
import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "./ui/navigation-menu";
import { cn } from "../lib/utils";
import { Menu, X, UserCircle2, LogOut, Settings, ChevronDown } from "lucide-react";
import { Button } from "./ui/button";

const components = [
  {
    title: "Alert Dialog",
    href: "/docs/primitives/alert-dialog",
    description: "A modal dialog that interrupts the user with important content and expects a response.",
  },
  {
    title: "Hover Card",
    href: "/docs/primitives/hover-card",
    description: "For sighted users to preview content available behind a link.",
  },
  {
    title: "Progress",
    href: "/docs/primitives/progress",
    description: "Displays an indicator showing the completion progress of a task, typically displayed as a progress bar.",
  },
];

const Navbar = () => {
  const [active, setActive] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const [isLoggedIn, setIsLoggedIn] = React.useState(true);
  const mobileMenuRef = React.useRef<HTMLDivElement>(null);
  const profileRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleScroll = () => {
      setActive(window.scrollY > 80);
      setIsMobileMenuOpen(false);
      setIsProfileOpen(false);
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav
      className={`sticky top-0 z-50 border-b bg-white/80 backdrop-blur-lg transition-all duration-300 dark:border-gray-800 dark:bg-gray-900/80 ${
        active ? "shadow-lg dark:bg-gray-900/90" : ""
      }`}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/Home" className="flex items-center gap-2">
          <span className="text-2xl font-bold text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400">
            ExamBank
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800">
                  Getting started
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                    <li className="row-span-3">
                      <NavigationMenuLink asChild>
                        <Link
                          href="/"
                          className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-blue-50 to-white p-6 no-underline outline-none focus:shadow-md dark:from-gray-800 dark:to-gray-900"
                        >
                          <h2 className="mb-2 text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-400">
                            ExamBank Pro
                          </h2>
                          <p className="text-sm leading-tight text-muted-foreground">
                            Your ultimate exam preparation partner
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <ListItem href="/docs" title="Introduction">
                      Access thousands of practice exams and study materials
                    </ListItem>
                    <ListItem href="/docs/installation" title="Getting Started">
                      Learn how to effectively use our platform
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800">
                  Resources
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    {components.map((component) => (
                      <ListItem
                        key={component.title}
                        href={component.href}
                        title={component.title}
                      >
                        {component.description}
                      </ListItem>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link href="/docs" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Documentation
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Profile Section */}
          {isLoggedIn ? (
            <div className="relative" ref={profileRef}>
              <Button
                variant="ghost"
                className="h-12 w-12 rounded-full p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                  <UserCircle2 className="h-6 w-6 text-blue-600 dark:text-blue-300 cursor-pointer" />
                </div>
              </Button>

              {isProfileOpen && (
                <div className="absolute right-0 top-14 w-48 rounded-lg border bg-white py-2 shadow-xl dark:border-gray-700 dark:bg-gray-800">
                  <Link
                    href="/ClientProfile"
                    className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <UserCircle2 className="mr-2 h-4 w-4 cursor-pointer" />
                    Profile
                  </Link>
                  <Link
                    href="/ClientProfile"
                    className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                  <button
                    onClick={() => setIsLoggedIn(false)}
                    className="flex w-full items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden gap-2 lg:flex">
              <Button
                asChild
                variant="outline"
                className="rounded-full px-6 transition-all hover:border-blue-600 hover:bg-blue-50 hover:text-blue-600 dark:hover:border-blue-400 dark:hover:bg-blue-900/20"
              >
                <Link href="/login">Sign In</Link>
              </Button>
              <Button
                asChild
                className="rounded-full bg-blue-600 px-6 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
              >
                <Link href="/signup">Get Started</Link>
              </Button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 lg:hidden h-full">
          <div
            ref={mobileMenuRef}
            className="absolute right-0 top-0 h-screen w-3/4 max-h-screen overflow-y-auto bg-white p-6 shadow-2xl dark:bg-gray-900"
          >
            <div className="flex h-16 items-center justify-between">
              <span className="text-lg font-bold">ExamBank</span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2"
                aria-label="Close menu"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Mobile Navigation */}
            <div className="space-y-4 pt-4">
              <details className="group">
                <summary className="flex cursor-pointer items-center justify-between rounded-lg px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800">
                  Getting Started
                  <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
                </summary>
                <div className="ml-4 mt-2 space-y-2">
                  <Link
                    href="/docs"
                    className="block rounded-lg px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Introduction
                  </Link>
                  <Link
                    href="/docs/installation"
                    className="block rounded-lg px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Getting Started
                  </Link>
                </div>
              </details>

              <details className="group">
                <summary className="flex cursor-pointer items-center justify-between rounded-lg px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800">
                  Resources
                  <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
                </summary>
                <div className="ml-4 mt-2 space-y-2">
                  {components.map((component) => (
                    <Link
                      key={component.title}
                      href={component.href}
                      className="block rounded-lg px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {component.title}
                    </Link>
                  ))}
                </div>
              </details>

              <Link
                href="/docs"
                className="block rounded-lg px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Documentation
              </Link>
            </div>

            {/* Mobile Auth Section */}
            {!isLoggedIn && (
              <div className="mt-8 space-y-4">
                <Button
                  asChild
                  className="w-full rounded-full bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                >
                  <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                    Get Started
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full rounded-full dark:border-gray-600"
                >
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    Sign In
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

interface ListItemProps extends React.ComponentPropsWithoutRef<"a"> {
  title: string;
}

const ListItem = React.forwardRef<HTMLAnchorElement, ListItemProps>(
  ({ className, title, children, ...props }, ref) => {
    return (
      <li>
        <NavigationMenuLink asChild>
          <a
            ref={ref}
            className={cn(
              "block select-none space-y-1 rounded-lg p-3 leading-none no-underline outline-none transition-colors hover:bg-blue-50 hover:text-blue-600 focus:bg-blue-50 dark:hover:bg-gray-800",
              className
            )}
            {...props}
          >
            <div className="text-sm font-medium leading-none">{title}</div>
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
              {children}
            </p>
          </a>
        </NavigationMenuLink>
      </li>
    );
  }
);
ListItem.displayName = "ListItem";

export default Navbar;