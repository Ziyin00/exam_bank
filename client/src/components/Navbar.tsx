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
import { Menu, X } from "lucide-react";

const components = [
  // ... (keep your existing components array)
];

const Navbar = () => {
  const [active, setActive] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 80) {
        setActive(true);
      } else {
        setActive(false);
      }
      setIsMobileMenuOpen(false);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleCloseMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <nav
      className={`sticky top-0 z-50 border-b-2 bg-white dark:bg-gray-900 ${
        active
          ? "dark:bg-opacity-50 dark:bg-gradient-to-b dark:from-gray-900 dark:to-black shadow-xl"
          : "bg-gradient-to-b dark:border-[#ffffff1c]"
      }`}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold">
          Exam Bank
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex">
        <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Getting started</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                <li className="row-span-3">
                  <NavigationMenuLink asChild>
                    <a
                      className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                      href="/"
                    >
                      <div className="mb-2 mt-4 text-lg font-medium">
                        shadcn/ui
                      </div>
                      <p className="text-sm leading-tight text-muted-foreground">
                        Beautifully designed components built with Radix UI and
                        Tailwind CSS.
                      </p>
                    </a>
                  </NavigationMenuLink>
                </li>
                <ListItem href="/docs" title="Introduction">
                  Re-usable components built using Radix UI and Tailwind CSS.
                </ListItem>
                <ListItem href="/docs/installation" title="Installation">
                  How to install dependencies and structure your app.
                </ListItem>
                <ListItem href="/docs/primitives/typography" title="Typography">
                  Styles for headings, paragraphs, lists...etc
                </ListItem>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Components</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                {components.map((component) => (
                  <ListItem
                    key={component.title}
                    title={component.title}
                    href={component.href}
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

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>

        {/* Desktop Auth Buttons */}
        <div className="hidden gap-4 lg:flex">
          <Link
            href="/Signup"
            className="rounded bg-gray-800 px-4 py-2 font-semibold text-white hover:shadow"
          >
            Register
          </Link>
          <Link
            href="/Login"
            className="rounded border px-4 py-2 font-semibold hover:shadow"
          >
            Login
          </Link>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 lg:hidden">
          <div className="absolute right-0 top-0 h-full w-3/4 bg-white dark:bg-gray-900 p-4">
            <div className="flex flex-col space-y-4">
              <button
                onClick={handleCloseMobileMenu}
                className="self-end p-2"
              >
                <X className="h-6 w-6" />
              </button>

              {/* Mobile Navigation Items */}
              <div className="flex flex-col space-y-2">
                <NavigationMenuLink asChild>
                  <Link
                    href="#"
                    className="p-2 font-medium"
                    onClick={handleCloseMobileMenu}
                  >
                    Getting Started
                  </Link>
                </NavigationMenuLink>
                <NavigationMenuLink asChild>
                  <Link
                    href="#"
                    className="p-2 font-medium"
                    onClick={handleCloseMobileMenu}
                  >
                    Components
                  </Link>
                </NavigationMenuLink>
              </div>

              {/* Mobile Auth Buttons */}
              <div className="mt-4 flex flex-col gap-2">
                <Link
                  href="/signup"
                  onClick={handleCloseMobileMenu}
                  className="rounded bg-gray-800 px-4 py-2 text-center font-semibold text-white hover:shadow"
                >
                  Register
                </Link>
                <Link
                  href="/login"
                  onClick={handleCloseMobileMenu}
                  className="rounded border px-4 py-2 text-center font-semibold hover:shadow"
                >
                  Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};



export default Navbar;

const ListItem = React.forwardRef(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
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
});
ListItem.displayName = "ListItem";