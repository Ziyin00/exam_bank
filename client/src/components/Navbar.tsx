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
  {
    title: "Alert Dialog",
    href: "/docs/primitives/alert-dialog",
    description: "A modal dialog that interrupts the user with important content and expects a response.",
  },
  // ... keep the rest of your components array
];

const Navbar = () => {
  const [active, setActive] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const mobileMenuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleScroll = () => {
      setActive(window.scrollY > 80);
      setIsMobileMenuOpen(false);
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
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
      className={`sticky top-0 z-50 border-b-2 bg-white transition-all duration-300 dark:border-gray-800 dark:bg-gray-900 ${
        active ? "shadow-lg dark:bg-gray-900/90" : ""
      }`}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-blue-600 hover:text-blue-700 dark:text-white">
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
                        <Link
                          href="/"
                          className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                        >
                          <h2 className="mb-2 mt-4 font-Poppins font-extrabold uppercase text-2xl ">Exam Bank</h2>
                          <p className="text-sm leading-tight text-muted-foreground">
                            Your comprehensive exam preparation solution
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
                <NavigationMenuTrigger>Components</NavigationMenuTrigger>
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

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Desktop Auth Buttons */}
        <div className="hidden gap-4 lg:flex">
          <Link
            href="/Signup"
            className="rounded bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700"
          >
            Register
          </Link>
          <Link
            href="/Login"
            className="rounded border px-4 py-2 font-semibold transition hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800"
          >
            Login
          </Link>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 lg:hidden">
          <div ref={mobileMenuRef} className="absolute right-0 top-0 h-full w-3/4 bg-white p-4 dark:bg-gray-900">
            <div className="flex flex-col space-y-4">
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="self-end p-2"
                aria-label="Close menu"
              >
                <X className="h-6 w-6" />
              </button>

              {/* Mobile Navigation Items */}
              <div className="flex flex-col space-y-2">
                <NavigationMenuItem className="w-full">
                  <NavigationMenuTrigger className="w-full">Getting started</NavigationMenuTrigger>
                  <NavigationMenuContent className="w-full">
                    <ul className="grid gap-3 p-4">
                      <ListItem href="/docs" title="Introduction">
                        Access thousands of practice exams and study materials
                      </ListItem>
                      <ListItem href="/docs/installation" title="Getting Started">
                        Learn how to effectively use our platform
                      </ListItem>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem className="w-full">
                  <NavigationMenuTrigger className="w-full">Components</NavigationMenuTrigger>
                  <NavigationMenuContent className="w-full">
                    <ul className="grid gap-3 p-4">
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

                <Link
                  href="/docs"
                  className="p-2 font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Documentation
                </Link>
              </div>

              {/* Mobile Auth Buttons */}
              <div className="mt-4 flex flex-col gap-2">
                <Link
                  href="/Signup"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="rounded bg-blue-600 px-4 py-2 text-center font-semibold text-white hover:bg-blue-700"
                >
                  Register
                </Link>
                <Link
                  href="/Login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="rounded border px-4 py-2 text-center font-semibold hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800"
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
  }
);
ListItem.displayName = "ListItem";

export default Navbar;