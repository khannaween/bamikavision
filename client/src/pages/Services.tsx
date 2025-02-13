import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Smartphone, Globe, Shield } from "lucide-react";

export default function Services() {
  return (
    <div className="w-full py-16 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-bold mb-6">Our Services</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover how Bamika Vision can transform your social experience
          </p>
        </motion.div>

        {/* Bamika Vibes App Showcase */}
        <section className="mb-20">
          <Card>
            <CardContent className="p-8 grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-4">Bamika Vibes App</h2>
                <p className="text-muted-foreground mb-6">
                  Experience social connection like never before with our flagship app
                </p>
                <Button>
                  Learn More <ArrowRight className="ml-2" />
                </Button>
              </div>
              <div className="bg-muted rounded-lg p-4 aspect-video flex items-center justify-center">
                <Smartphone className="w-32 h-32 text-primary" />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Features Grid */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-8">Key Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Globe className="w-8 h-8" />}
              title="Global Connectivity"
              description="Connect with users worldwide through our innovative platform"
            />
            <FeatureCard
              icon={<Shield className="w-8 h-8" />}
              title="Advanced Security"
              description="State-of-the-art security measures to protect your data"
            />
            <FeatureCard
              icon={<Smartphone className="w-8 h-8" />}
              title="Cross-Platform"
              description="Seamless experience across all your devices"
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="p-6 border rounded-lg"
    >
      <div className="mb-4 text-primary">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </motion.div>
  );
}
