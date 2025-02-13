import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

export default function About() {
  return (
    <div className="w-full py-16 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-bold mb-6">About Bamika Vision</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            We're on a mission to transform social connections through innovative technology.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
              <p className="text-muted-foreground">
                To create meaningful connections and empower users through cutting-edge social technology.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Our Vision</h2>
              <p className="text-muted-foreground">
                To be the leading platform for authentic social interactions in the digital age.
              </p>
            </CardContent>
          </Card>
        </div>

        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <ValueCard
              title="Innovation"
              description="Constantly pushing boundaries to create better solutions"
            />
            <ValueCard
              title="User Privacy"
              description="Protecting user data and privacy is our top priority"
            />
            <ValueCard
              title="Community"
              description="Building meaningful connections that last"
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function ValueCard({ title, description }: { title: string; description: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="p-6 border rounded-lg"
    >
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </motion.div>
  );
}
