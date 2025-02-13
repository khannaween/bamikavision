import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import type { ContactMessage } from "@shared/schema";

export default function Admin() {
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: messages = [], isLoading } = useQuery<ContactMessage[]>({
    queryKey: ["/api/contact/messages"],
  });

  // WebSocket connection
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log('Connected to WebSocket server');
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'new_message') {
        // Show notification
        toast({
          title: "New Message",
          description: `New message from ${data.message.name}`,
        });

        // Update messages in cache
        queryClient.setQueryData<ContactMessage[]>(["/api/contact/messages"], (old = []) => {
          return [data.message, ...old];
        });
      }
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      socket.close();
    };
  }, [toast, queryClient]);

  const filteredMessages = messages.filter((message) =>
    message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedMessages = [...filteredMessages].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="w-full py-16 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold mb-6">Messages Dashboard</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            View and manage your contact form submissions
          </p>
          <Input
            type="text"
            placeholder="Search messages..."
            className="max-w-md mx-auto"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </motion.div>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Contact Messages</h2>
              <span className="text-muted-foreground">
                {filteredMessages.length} messages
              </span>
            </div>

            {isLoading ? (
              <p className="text-center text-muted-foreground">Loading messages...</p>
            ) : sortedMessages.length === 0 ? (
              <p className="text-center text-muted-foreground">
                {searchTerm ? "No messages found matching your search" : "No messages yet"}
              </p>
            ) : (
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-4">
                  {sortedMessages.map((message) => (
                    <Card key={message.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-lg">{message.name}</h3>
                          <span className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <div className="flex items-center mb-3">
                          <a 
                            href={`mailto:${message.email}`} 
                            className="text-primary hover:underline"
                          >
                            {message.email}
                          </a>
                        </div>
                        <p className="text-muted-foreground whitespace-pre-wrap bg-muted/50 p-3 rounded-lg">
                          {message.message}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}