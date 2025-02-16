import { motion } from "framer-motion";
import { Mail, Phone, MapPin } from "lucide-react";

export default function Contact() {
  return (
    <div className="w-full py-16 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-bold mb-6">Contact Us</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get in touch with our team for any inquiries or support
          </p>
        </motion.div>

        <div className="max-w-2xl mx-auto">
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <Mail className="w-8 h-8 text-primary" />
              <div>
                <h3 className="text-xl font-medium">Email</h3>
                <p className="text-muted-foreground">
                  <a href="mailto:contact@bamikavision.com" className="hover:text-primary">
                    contact@bamikavision.com
                  </a>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Phone className="w-8 h-8 text-primary" />
              <div>
                <h3 className="text-xl font-medium">Phone</h3>
                <p className="text-muted-foreground">
                  <a href="tel:+14377726368" className="hover:text-primary">
                    +1 437-772-6368
                  </a>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <MapPin className="w-8 h-8 text-primary" />
              <div>
                <h3 className="text-xl font-medium">Location</h3>
                <p className="text-muted-foreground">Ontario, Canada</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}