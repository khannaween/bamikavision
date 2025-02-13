import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, Phone, Mail } from "lucide-react";

export default function Home() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-primary text-primary-foreground py-20 px-4 md:px-8"
      >
        <div className="max-w-6xl mx-auto">
          <motion.h1 
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            className="text-4xl md:text-6xl font-bold mb-6"
          >
            Revolutionizing Social Media with Bamika Vision
          </motion.h1>
          <p className="text-xl mb-8 max-w-2xl">
            Experience the future of social connection with our innovative platform and Bamika Vibes app.
          </p>
          <div className="flex gap-4">
            <Link href="/contact">
              <Button size="lg">
                Get Started <ArrowRight className="ml-2" />
              </Button>
            </Link>
            <Link href="/services">
              <Button variant="outline" size="lg">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section className="py-20 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Why Choose Bamika Vision?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              title="Innovative Technology"
              description="Leading-edge solutions that transform social interactions"
              icon={<Phone className="w-8 h-8" />}
            />
            <FeatureCard 
              title="Global Reach"
              description="Connect with users worldwide through our platform"
              icon={<Mail className="w-8 h-8" />}
            />
            <FeatureCard 
              title="User-Focused"
              description="Designed with user experience at the forefront"
              icon={<Mail className="w-8 h-8" />}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ title, description, icon }: { title: string; description: string; icon: React.ReactNode }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="p-6 border rounded-lg shadow-sm"
    >
      <div className="mb-4 text-primary">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </motion.div>
  );
}
