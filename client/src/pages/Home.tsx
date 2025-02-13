import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, Sparkles, Globe, Shield } from "lucide-react";

export default function Home() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative bg-black/95 text-white py-24 px-4 md:px-8 overflow-hidden"
      >
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-primary/10" />
          <motion.div
            initial={{ rotate: 0, scale: 0.9 }}
            animate={{ rotate: 360, scale: 1.1 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--primary)_0%,_transparent_50%)]"
          />
        </div>

        <div className="max-w-6xl mx-auto relative">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <motion.h1 
              className="text-4xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-primary/80"
            >
              Revolutionizing Social Media with Bamika Vision
            </motion.h1>
            <p className="text-xl mb-8 max-w-2xl text-gray-300">
              Experience the future of social connection with our innovative platform and Bamika Vibes app.
            </p>
            <div className="flex gap-4">
              <Link href="/contact">
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  Get Started <ArrowRight className="ml-2" />
                </Button>
              </Link>
              <Link href="/services">
                <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary/10">
                  Learn More
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section className="py-20 px-4 md:px-8 bg-black/90">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center text-white">Why Choose Bamika Vision?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              title="Innovative Technology"
              description="Leading-edge solutions that transform social interactions"
              icon={<Sparkles className="w-8 h-8" />}
            />
            <FeatureCard 
              title="Global Reach"
              description="Connect with users worldwide through our platform"
              icon={<Globe className="w-8 h-8" />}
            />
            <FeatureCard 
              title="Advanced Security"
              description="State-of-the-art protection for your digital presence"
              icon={<Shield className="w-8 h-8" />}
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
      whileHover={{ y: -5, scale: 1.02 }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="p-6 rounded-lg bg-black/50 border border-primary/20 backdrop-blur-sm"
    >
      <div className="mb-4 text-primary">{icon}</div>
      <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </motion.div>
  );
}