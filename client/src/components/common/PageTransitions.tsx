"use client";

import { motion, useReducedMotion } from "framer-motion";

interface PageTransitionsProps {
    children: React.ReactNode;
}

const PageTransitions = ({ children }: PageTransitionsProps) => {
    const shouldReduceMotion = useReducedMotion();
    return (
        <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -10 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
            {children}
        </motion.div>
    );
}

export default PageTransitions;
