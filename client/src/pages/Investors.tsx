import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, TrendingUp, Users, Target } from "lucide-react";

export default function Investors() {
  return (
    <div className="w-full py-16 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-bold mb-6">Investor Relations</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join us in shaping the future of social connection
          </p>
        </motion.div>

        {/* Investment Highlights */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-8">Why Invest in Bamika Vision?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <HighlightCard
              icon={<TrendingUp className="w-8 h-8" />}
              title="Market Growth"
              description="Rapidly expanding market with significant growth potential"
            />
            <HighlightCard
              icon={<Users className="w-8 h-8" />}
              title="Strong User Base"
              description="Growing user community with high engagement rates"
            />
            <HighlightCard
              icon={<Target className="w-8 h-8" />}
              title="Clear Vision"
              description="Focused strategy for sustainable growth and innovation"
            />
          </div>
        </section>

        {/* Investment Documents */}
        <section className="mb-20">
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-6">Investment Documents</h2>
              <div className="space-y-4">
                <DocumentDownload
                  title="Pitch Deck"
                  description="Comprehensive overview of our business and vision"
                />
                <DocumentDownload
                  title="Financial Projections"
                  description="Detailed financial forecasts and metrics"
                />
                <DocumentDownload
                  title="Partnership Opportunities"
                  description="Information about partnership and collaboration options"
                />
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}

function HighlightCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
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

function DocumentDownload({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Button variant="outline" size="sm">
        <Download className="w-4 h-4 mr-2" />
        Download
      </Button>
    </div>
  );
}
