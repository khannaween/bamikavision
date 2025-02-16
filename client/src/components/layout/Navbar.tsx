import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

const navigation = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Services", href: "/services" },
  { name: "Contact", href: "/contact" },
  { name: "Investors", href: "/investors" },
];

export default function Navbar() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-black/95 border-b border-primary/20 backdrop-blur-sm fixed w-full z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/">
              <Button variant="ghost" className="flex items-center">
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                  Bamika Vision
                </span>
              </Button>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {navigation.map((item) => (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={location === item.href ? "default" : "ghost"}
                  className={`text-sm font-medium transition-colors ${
                    location === item.href 
                      ? "bg-primary text-primary-foreground" 
                      : "text-gray-300 hover:text-white hover:bg-primary/10"
                  }`}
                >
                  {item.name}
                </Button>
              </Link>
            ))}
          </div>

          {/* Mobile Navigation */}
          <div className="flex items-center md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-gray-300">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent className="bg-black/95 border-primary/20">
                <div className="flex flex-col space-y-4 mt-4">
                  {navigation.map((item) => (
                    <Link key={item.name} href={item.href}>
                      <Button
                        variant={location === item.href ? "default" : "ghost"}
                        className={`w-full justify-start ${
                          location === item.href 
                            ? "bg-primary text-primary-foreground" 
                            : "text-gray-300 hover:text-white hover:bg-primary/10"
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        {item.name}
                      </Button>
                    </Link>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}