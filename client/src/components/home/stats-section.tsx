import React from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, useInView, useSpring } from "framer-motion";
import { Users, Flag, CheckCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsData {
  totalUsers: number;
  totalReports: number;
  resolvedReports: number;
}

const AnimatedCounter = ({ value }: { value: number }) => {
  const ref = React.useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const spring = useSpring(0, {
    damping: 20,
    stiffness: 100,
  });

  React.useEffect(() => {
    if (isInView) {
      spring.set(value);
    }
  }, [spring, value, isInView]);

  React.useEffect(() => {
    const unsubscribe = spring.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = Math.round(latest).toLocaleString();
      }
    });
    return unsubscribe;
  }, [spring]);

  return <span ref={ref}>0</span>;
};

const StatsSection: React.FC = () => {
  const { data, isLoading } = useQuery<StatsData>({
    queryKey: ["/api/stats/public"],
  });

  const stats = [
    {
      icon: Users,
      value: data?.totalUsers ?? 0,
      label: "Active Citizens",
      description: "Joined our mission for a cleaner city.",
    },
    {
      icon: Flag,
      value: data?.totalReports ?? 0,
      label: "Reports Submitted",
      description: "Issues identified and reported by the community.",
    },
    {
      icon: CheckCircle,
      value: data?.resolvedReports ?? 0,
      label: "Issues Resolved",
      description: "Successfully cleaned up and resolved by authorities.",
    },
  ];

  return (
    <section id="stats" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Our Impact in <span className="gradient-text">Numbers</span>
          </h2>
          <p className="text-lg text-gray-600">
            We believe in transparency and the power of community. Here's a look at what we've achieved together.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className="text-center p-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center bg-primary/10 text-primary">
                <stat.icon className="w-8 h-8" />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {isLoading ? (
                  <Skeleton className="h-10 w-32 mx-auto" />
                ) : (
                  <AnimatedCounter value={stat.value} />
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{stat.label}</h3>
              <p className="text-sm text-gray-600">{stat.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;